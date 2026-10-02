/**
 * Preparation Portal data model (Service → Course → Post → Syllabus/Notes/Model Set).
 *
 * Everything is data-driven and stored in Firestore so admin can add
 * services/courses/posts/content without touching frontend code.
 */

export const PREP_COLLECTIONS = {
  services: "prep_services",
  courses: "prep_courses",
  posts: "prep_posts",
  notes: "prep_notes",
  modelSets: "prep_model_sets",
} as const;

export type PrepCollection = (typeof PREP_COLLECTIONS)[keyof typeof PREP_COLLECTIONS];

/** Top-level security service the student is preparing for. */
export interface PrepService {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** lucide icon name — see getPrepIcon() */
  icon: string;
  /** tailwind gradient/background classes for the card */
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: number;
}

/** A course/group inside a service (e.g. जनपद प्रहरी). */
export interface PrepCourse {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: number;
}

/** A post/rank inside a course (e.g. प्रहरी जवान). */
export interface PrepPost {
  id: string;
  serviceId: string;
  courseId: string;
  name: string;
  slug: string;
  description?: string;
  /** Official government syllabus detail URL (admin-configured, may be empty). */
  syllabusUrl?: string;
  /** Official syllabus index/listing page for the service (admin-configured). */
  syllabusIndexUrl?: string;
  /** ISO date (YYYY-MM-DD) the admin last verified/updated the official URL. */
  syllabusUpdatedAt?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: number;
}

/** STAR Coaching study note (coaching material — never official). */
export interface PrepNote {
  id: string;
  serviceId: string;
  courseId: string;
  postId: string;
  title: string;
  subject?: string;
  description?: string;
  fileUrl?: string;
  allowDownload?: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: number;
}

export interface PrepQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

/** Model set — PDF file or online MCQ test. */
export interface PrepModelSet {
  id: string;
  serviceId: string;
  courseId: string;
  postId: string;
  title: string;
  description?: string;
  type: "pdf" | "mcq";
  /** required when type = "pdf" */
  fileUrl?: string;
  allowDownload?: boolean;
  /** required when type = "mcq" */
  questions?: PrepQuestion[];
  isPublished: boolean;
  sortOrder: number;
  createdAt?: number;
}

/** URL-safe slug from a name (Nepali falls back to a readable hash-ish slug). */
export function slugify(value: string): string {
  const s = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\p{Script=Devanagari}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return s || `item-${Date.now().toString(36)}`;
}
