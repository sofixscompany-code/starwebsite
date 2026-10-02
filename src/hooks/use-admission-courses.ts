import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { DEFAULT_ADMISSION_COURSES } from "@/lib/admission-form/defaults";
import type { AdmissionCourse } from "@/lib/admission-form/types";

/**
 * Admin-managed Class/Course/Package/Pricing configuration
 * (Firestore `admission_courses`). Falls back to the initial default pricing
 * (printed fee tables) when the collection is empty — see defaults.ts.
 */
export function useAdmissionCourses(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;
  return useQuery({
    queryKey: ["admission-courses", includeInactive],
    queryFn: async (): Promise<AdmissionCourse[]> => {
      try {
        const snap = await getDocs(collection(db, "admission_courses"));
        const rows = snap.docs.map((d) => ({ ...(d.data() as AdmissionCourse), id: d.id }));
        if (rows.length === 0) return DEFAULT_ADMISSION_COURSES;
        const visible = includeInactive ? rows : rows.filter((c) => c.active !== false);
        return visible.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      } catch {
        // Offline / rules error → defaults so the form always works.
        return DEFAULT_ADMISSION_COURSES;
      }
    },
    staleTime: 60_000,
  });
}

/** Raw Firestore read (admin pricing page) — empty array = not seeded yet. */
export function useAdmissionCoursesRaw() {
  return useQuery({
    queryKey: ["admission-courses-raw"],
    queryFn: async (): Promise<AdmissionCourse[]> => {
      try {
        const snap = await getDocs(collection(db, "admission_courses"));
        return snap.docs
          .map((d) => ({ ...(d.data() as AdmissionCourse), id: d.id }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
  });
}

/** Writes the initial pricing tables into Firestore (admin "Seed defaults"). */
export async function seedDefaultAdmissionCourses(): Promise<number> {
  for (const c of DEFAULT_ADMISSION_COURSES) {
    await setDoc(doc(db, "admission_courses", c.id), {
      ...c,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  return DEFAULT_ADMISSION_COURSES.length;
}

/** Persist an admin-edited course (add/edit handled by id). */
export async function saveAdmissionCourse(course: AdmissionCourse) {
  await setDoc(
    doc(db, "admission_courses", course.id),
    { ...course, updatedAt: Date.now(), createdAt: course.createdAt ?? Date.now() },
    { merge: true },
  );
}

export async function deleteAdmissionCourse(id: string) {
  await deleteDoc(doc(db, "admission_courses", id));
}

/** Invalidate the form's cached pricing after an admin change. */
export function useRefreshAdmissionCourses() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["admission-courses"] });
}
