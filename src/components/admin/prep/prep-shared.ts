import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import {
  DEFAULT_PREP_COURSES,
  DEFAULT_PREP_POSTS,
  DEFAULT_PREP_SERVICES,
} from "@/data/prep-defaults";
import { deletePrepDoc, savePrepDoc } from "@/hooks/use-prep-data";
import { storage } from "@/integrations/firebase/config";
import { PREP_COLLECTIONS, type PrepCollection } from "@/lib/prep/types";

/** Gradient presets for service cards — literal classes so Tailwind can see them. */
export const PREP_GRADIENTS: { value: string; label: string }[] = [
  { value: "from-blue-700 to-blue-900", label: "Blue" },
  { value: "from-emerald-700 to-emerald-900", label: "Emerald" },
  { value: "from-orange-600 to-orange-800", label: "Orange" },
  { value: "from-green-700 to-green-900", label: "Green" },
  { value: "from-purple-700 to-purple-900", label: "Purple" },
  { value: "from-slate-700 to-slate-900", label: "Slate" },
  { value: "from-red-700 to-red-900", label: "Red" },
];

/** lucide icon names accepted by getPrepIcon(). */
export const PREP_ICON_NAMES = [
  "Award",
  "BookOpen",
  "ClipboardCheck",
  "FileText",
  "GraduationCap",
  "Landmark",
  "ScrollText",
  "Shield",
  "ShieldCheck",
  "Star",
  "Swords",
  "Target",
  "Trees",
  "Users",
] as const;

const BUNDLED_SERVICE_IDS = new Set(DEFAULT_PREP_SERVICES.map((d) => d.id));
const BUNDLED_COURSE_IDS = new Set(DEFAULT_PREP_COURSES.map((d) => d.id));
const BUNDLED_POST_IDS = new Set(DEFAULT_PREP_POSTS.map((d) => d.id));

/**
 * true when the row comes from the bundled default catalog — i.e. it has no
 * Firestore document yet (seed writes get fresh ids, never the bundled ones).
 */
export function isBundledRow(collection: PrepCollection, id?: string): boolean {
  if (!id) return false;
  if (collection === PREP_COLLECTIONS.services) return BUNDLED_SERVICE_IDS.has(id);
  if (collection === PREP_COLLECTIONS.courses) return BUNDLED_COURSE_IDS.has(id);
  if (collection === PREP_COLLECTIONS.posts) return BUNDLED_POST_IDS.has(id);
  return false;
}

/** Save via savePrepDoc — bundled defaults become NEW documents, not failed updates. */
export async function savePrepRow<T extends { id?: string }>(
  collection: PrepCollection,
  data: T,
): Promise<string> {
  if (isBundledRow(collection, data.id)) {
    const { id: _bundled, ...rest } = data;
    return savePrepDoc(collection, rest);
  }
  return savePrepDoc(collection, data);
}

/**
 * Delete via deletePrepDoc. Returns false for bundled default rows — they are
 * not stored in Firestore yet, so "deleting" them would silently do nothing.
 */
export async function deletePrepRow(collection: PrepCollection, id: string): Promise<boolean> {
  if (isBundledRow(collection, id)) return false;
  await deletePrepDoc(collection, id);
  return true;
}

/** Client-side sort by sortOrder (Firestore reads are unordered here). */
export function bySort<T extends { sortOrder?: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999));
}

/** Optional official-URL fields: empty is fine, non-empty must be https. */
export function isValidHttpsUrl(value: string): boolean {
  const v = value.trim();
  return v === "" || v.startsWith("https://");
}

/** Upload a file to Firebase Storage and return its download URL. */
export async function uploadPrepFile(folder: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "_");
  const fileRef = storageRef(storage, `prep/${folder}/${Date.now()}-${safeName}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload with the honest fallback: if Storage is not enabled/configured the
 * admin keeps the text input and pastes a URL manually.
 */
export async function pickAndUploadFile(
  folder: string,
  file: File,
  onUrl: (url: string) => void,
): Promise<void> {
  try {
    const url = await uploadPrepFile(folder, file);
    onUrl(url);
    toast.success("फाइल अपलोड भयो — URL स्वतः भरियो।");
  } catch {
    toast.error("Storage सक्रिय छैन — URL सिधै पेस्ट गर्नुहोस्");
  }
}
