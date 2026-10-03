import { getUserRole } from "@/lib/api-auth";

/**
 * Role → capability map for admin module pages. This MIRRORS firestore.rules
 * so the UI never offers an action the backend will reject (e.g. a student
 * seeing "New Payment" on a read-only page, or a teacher's create button
 * failing with permission-denied).
 *
 * Keep in sync with `starweb/firestore.rules`:
 * - default (unlisted collection) → super admin only (catch-all rule)
 * - STAFF collections → teachers + super admin (`isStaff()`)
 * - FINANCE collections → accountants + super admin (`isAccountant()`)
 * - ALL collections → any signed-in user can create, but only super admin
 *   can edit/delete (messages / support tickets).
 */

const ALL = ["super_admin", "teacher", "student", "parent", "accountant"];
const STAFF = ["super_admin", "teacher"];
const FINANCE = ["super_admin", "accountant"];
const SUPER = ["super_admin"];

const CREATORS: Record<string, string[]> = {
  // Academic / staff-managed
  attendance: STAFF,
  calendar: STAFF,
  classes: STAFF,
  homework: STAFF,
  assignments: STAFF,
  exams: STAFF,
  results: STAFF,
  students: STAFF,
  notices: STAFF,
  certificates: STAFF,
  teacher_content: STAFF,
  teacher_classes: STAFF,
  teacher_student_progress: STAFF,
  student_attendance: STAFF,
  student_grades: STAFF,
  student_assignments: STAFF,
  student_schedule: STAFF,
  lms_courses: STAFF,
  lms_lessons: STAFF,
  lms_quizzes: STAFF,
  lms_materials: STAFF,
  // Finance
  payments: FINANCE,
  payables: FINANCE,
  expenses: FINANCE,
  fees: FINANCE,
  fee_invoices: FINANCE,
  fee_payments: FINANCE,
  fee_structure: FINANCE,
  collections: FINANCE,
  dues: FINANCE,
  transactions: FINANCE,
  // Any signed-in user may start a conversation / enrollment / attempt
  messages: ALL,
  support_tickets: ALL,
  lms_enrollments: ALL,
  lms_quiz_attempts: ALL,
  // Public forms — submissions arrive from the website, admin only manages
  inquiries: SUPER,
  admissions: SUPER,
  // Audit logs are appended by the app itself, never from the UI
  audit_logs: [],
};

const MANAGERS: Record<string, string[]> = {
  ...CREATORS,
  // …but only super admin moderates messages/support and staff own LMS records
  messages: SUPER,
  support_tickets: SUPER,
  lms_enrollments: STAFF,
  lms_quiz_attempts: STAFF,
  audit_logs: [],
};

const DEFAULT_WRITERS = SUPER; // firestore.rules catch-all

export function canCreate(collectionName: string, role: string | null): boolean {
  if (!role) return false;
  return (CREATORS[collectionName] ?? DEFAULT_WRITERS).includes(role);
}

export function canManage(collectionName: string, role: string | null): boolean {
  if (!role) return false;
  return (MANAGERS[collectionName] ?? DEFAULT_WRITERS).includes(role);
}

/** Current role shortcut (null when signed out). */
export function currentRole(): string | null {
  return getUserRole();
}
