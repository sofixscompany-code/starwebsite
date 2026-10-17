import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db, firebaseConfig } from "@/integrations/firebase/config";
import { createAuthUser, usernameToLoginEmail } from "@/lib/user-accounts";

/** Minimum admission data the credential flow needs (web + mobile share it). */
export interface VerifyInput {
  studentName: string;
  mobileNumber: string;
  applicationId?: string;
  admissionNumber?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
  fatherMobile?: string;
  motherMobile?: string;
  courseName?: string;
  classAppliedFor?: string;
  totalPayment?: number | null;
}

/**
 * Verify-time credential auto-creation for admission applications.
 *
 * When the super admin verifies an admission, the system creates Firebase
 * Auth accounts (student + parent) WITHOUT signing the admin out — everything
 * goes through the public Identity Toolkit REST endpoints, mirroring
 * `createAuthUser()`:
 *
 *   student login = <studentMobile>@starcoaching.edu.np
 *   parent login  = <parentMobile>@starcoaching.edu.np
 *   (same mobile → parent gets a `p` suffix, e.g. 9800000000p@…)
 *   password for both = ADMISSION_PASSWORD (Star123@)
 *
 * Also writes `users/{uid}` role docs + a `students` document (so the
 * student/parent dashboards scope correctly), then stamps the admission
 * record with Verified status + the issued credentials.
 */

/** Default password handed to every auto-created student/parent account. */
export const ADMISSION_PASSWORD = "Star123@";

/** `<mobile>@starcoaching.edu.np` — mobile digits only, lowercased. */
function loginForMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return usernameToLoginEmail(digits);
}

export interface CredentialPreview {
  studentEmail: string;
  parentEmail: string;
}

/** Pure preview of the logins that `issueAdmissionCredentials` will create. */
export function previewCredentials(record: {
  mobileNumber: string;
  fatherMobile?: string;
  motherMobile?: string;
  guardianMobile?: string;
}): CredentialPreview {
  const student = loginForMobile(record.mobileNumber);
  const parentMobile =
    record.guardianMobile?.trim() ||
    record.fatherMobile?.trim() ||
    record.motherMobile?.trim() ||
    "";
  let parent = parentMobile ? loginForMobile(parentMobile) : student;
  // Same number for student & parent → disambiguate with a `p` suffix.
  if (parent === student) parent = usernameToLoginEmail(`${parentMobile.replace(/\D/g, "")}p`);
  return { studentEmail: student, parentEmail: parent };
}

/**
 * Resolve the Firebase UID of an EXISTING institute login by signing in via
 * REST with the shared password. Used when re-verifying an admission whose
 * accounts were already created (EMAIL_EXISTS on signUp). Pure fetch — the
 * admin's session is untouched.
 */
async function resolveUid(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      },
    );
    const json = (await res.json().catch(() => ({}))) as { localId?: string };
    return res.ok && json.localId ? json.localId : null;
  } catch {
    return null;
  }
}

export interface IssueResult {
  studentUid: string | null;
  parentUid: string | null;
  studentEmail: string;
  parentEmail: string;
  /** Human-readable notes: "already existed", "student login has no UID", … */
  warnings: string[];
}

/**
 * Create (or resolve) the student + parent accounts for a verified admission
 * and stamp the Firestore records:
 *
 * 1. Firebase Auth accounts — student & parent (existing accounts are
 *    resolved via the shared password instead of failing).
 * 2. `users/{uid}` role docs (student / parent).
 * 3. A `students` document linking studentUid ↔ parentEmail (dashboards
 *    scope on it).
 * 4. The admission doc: status "Verified", discount/payable, UIDs,
 *    usernames and timestamps.
 */
export async function issueAdmissionCredentials({
  admissionId,
  record,
  discount,
}: {
  admissionId: string;
  record: VerifyInput;
  discount: number;
}): Promise<IssueResult> {
  const { studentEmail, parentEmail } = previewCredentials(record);
  const warnings: string[] = [];

  /* ── 1. Auth accounts (create, or resolve when they already exist) ── */
  let studentUid: string | null = null;
  let parentUid: string | null = null;

  try {
    studentUid = await createAuthUser({ email: studentEmail, password: ADMISSION_PASSWORD });
  } catch (e) {
    // EMAIL_EXISTS on re-verify → recover the UID via the shared password.
    studentUid = await resolveUid(studentEmail, ADMISSION_PASSWORD);
    if (!studentUid) {
      warnings.push(`Student login already exists but could not be resolved (${String(e)}).`);
    } else {
      warnings.push("Student account already existed — reused existing login.");
    }
  }

  try {
    parentUid = await createAuthUser({ email: parentEmail, password: ADMISSION_PASSWORD });
  } catch (e) {
    parentUid = await resolveUid(parentEmail, ADMISSION_PASSWORD);
    if (!parentUid) {
      warnings.push(`Parent login already exists but could not be resolved (${String(e)}).`);
    } else {
      warnings.push("Parent account already existed — reused existing login.");
    }
  }

  const now = Date.now();

  /* ── 2. users/{uid} role docs ── */
  if (studentUid) {
    await setDoc(doc(db, "users", studentUid), {
      uid: studentUid,
      username: studentEmail.split("@")[0],
      email: studentEmail,
      full_name: record.studentName,
      phone: record.mobileNumber,
      role: "student",
      branch: "",
      status: "active",
      createdAt: now,
      admissionId,
      applicationId: record.applicationId,
    });
  }
  if (parentUid) {
    const parentName =
      record.guardianName?.trim() || record.fatherName?.trim() || `${record.studentName} — Parent`;
    await setDoc(doc(db, "users", parentUid), {
      uid: parentUid,
      username: parentEmail.split("@")[0],
      email: parentEmail,
      full_name: parentName,
      phone:
        record.guardianMobile?.trim() || record.fatherMobile?.trim() || record.motherMobile?.trim(),
      role: "parent",
      branch: "",
      status: "active",
      createdAt: now,
      admissionId,
      applicationId: record.applicationId,
    });
  }

  /* ── 3. students doc (dashboards scope on studentId / parentEmail) ── */
  if (studentUid) {
    const dup = await getDocs(
      query(collection(db, "students"), where("studentId", "==", studentUid)),
    );
    if (dup.empty) {
      const newDoc = doc(collection(db, "students"));
      await setDoc(newDoc, {
        fullName: record.studentName,
        name: record.studentName,
        email: studentEmail,
        phone: record.mobileNumber,
        studentId: studentUid,
        parentName: record.guardianName?.trim() || record.fatherName?.trim() || "",
        parentEmail,
        parentPhone:
          record.guardianMobile?.trim() ||
          record.fatherMobile?.trim() ||
          record.motherMobile?.trim() ||
          "",
        course: record.courseName,
        class: record.classAppliedFor || record.courseName,
        batch: "",
        admissionNumber: record.admissionNumber || "",
        admissionId,
        applicationId: record.applicationId,
        createdAt: now,
      });
    }
  }

  /* ── 4. stamp the admission record ── */
  const totalPayment = record.totalPayment ?? 0;
  await updateDoc(doc(db, "admissions", admissionId), {
    status: "Verified",
    discount,
    payable: Math.max(totalPayment - discount, 0),
    verifiedAt: now,
    studentUid: studentUid ?? "",
    parentUid: parentUid ?? "",
    studentEmail,
    parentEmail,
    studentUsername: studentEmail.split("@")[0],
    parentUsername: parentEmail.split("@")[0],
    credentialsIssuedAt: now,
    updatedAt: now,
  });

  return { studentUid, parentUid, studentEmail, parentEmail, warnings };
}
