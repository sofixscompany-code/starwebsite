import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import {
  PREP_COLLECTIONS,
  type PrepCollection,
  type PrepCourse,
  type PrepModelSet,
  type PrepNote,
  type PrepPost,
  type PrepService,
} from "@/lib/prep/types";
import {
  DEFAULT_PREP_COURSES,
  DEFAULT_PREP_MODEL_SETS,
  DEFAULT_PREP_NOTES,
  DEFAULT_PREP_POSTS,
  DEFAULT_PREP_SERVICES,
} from "@/data/prep-defaults";

const bySort = <T extends { sortOrder?: number }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999));

async function readCollection<T>(name: string, publishedOnly?: boolean): Promise<T[]> {
  try {
    // Public reads of notes/model sets must filter on isPublished so the list
    // query matches the Firestore rule for every returned document.
    const q = publishedOnly
      ? query(collection(db, name), where("isPublished", "==", true))
      : collection(db, name);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
  } catch {
    // Offline / rules error → caller falls back to bundled defaults.
    return [];
  }
}

export interface PrepCatalog {
  services: PrepService[];
  courses: PrepCourse[];
  posts: PrepPost[];
  notes: PrepNote[];
  modelSets: PrepModelSet[];
  isLoading: boolean;
  /** true while Firestore is empty and bundled defaults are in use */
  usingDefaults: boolean;
  refetch: () => void;
}

/**
 * Whole Preparation Portal catalog in one query set.
 * - services/courses/posts fall back to bundled defaults when empty so the
 *   portal works before admin seeds Firestore.
 * - notes/model sets fall back to EMPTY (honest "coming soon" states).
 * - `admin: true` also returns unpublished notes/model sets.
 */
export function usePrepCatalog(options?: { admin?: boolean }): PrepCatalog {
  const admin = options?.admin === true;

  const servicesQ = useQuery({
    queryKey: ["prep", "services"],
    queryFn: () => readCollection<PrepService>(PREP_COLLECTIONS.services),
    staleTime: 60_000,
  });
  const coursesQ = useQuery({
    queryKey: ["prep", "courses"],
    queryFn: () => readCollection<PrepCourse>(PREP_COLLECTIONS.courses),
    staleTime: 60_000,
  });
  const postsQ = useQuery({
    queryKey: ["prep", "posts"],
    queryFn: () => readCollection<PrepPost>(PREP_COLLECTIONS.posts),
    staleTime: 60_000,
  });
  const notesQ = useQuery({
    queryKey: ["prep", "notes", admin],
    queryFn: () => readCollection<PrepNote>(PREP_COLLECTIONS.notes, !admin),
    staleTime: 60_000,
  });
  const modelSetsQ = useQuery({
    queryKey: ["prep", "model-sets", admin],
    queryFn: () => readCollection<PrepModelSet>(PREP_COLLECTIONS.modelSets, !admin),
    staleTime: 60_000,
  });

  const servicesRaw = servicesQ.data ?? [];
  const coursesRaw = coursesQ.data ?? [];
  const postsRaw = postsQ.data ?? [];

  const notesRaw = notesQ.data ?? [];
  const modelSetsRaw = modelSetsQ.data ?? [];

  const services = servicesRaw.length ? bySort(servicesRaw) : DEFAULT_PREP_SERVICES;
  const courses = coursesRaw.length ? bySort(coursesRaw) : DEFAULT_PREP_COURSES;
  const posts = postsRaw.length ? bySort(postsRaw) : DEFAULT_PREP_POSTS;

  const notes = bySort(admin ? notesRaw : notesRaw.filter((n) => n.isPublished));
  const modelSets = bySort(admin ? modelSetsRaw : modelSetsRaw.filter((m) => m.isPublished));

  return {
    services: admin ? services : services.filter((s) => s.isActive !== false),
    courses: admin ? courses : courses.filter((c) => c.isActive !== false),
    posts: admin ? posts : posts.filter((p) => p.isActive !== false),
    notes,
    modelSets,
    isLoading:
      servicesQ.isLoading ||
      coursesQ.isLoading ||
      postsQ.isLoading ||
      notesQ.isLoading ||
      modelSetsQ.isLoading,
    usingDefaults: servicesRaw.length === 0,
    refetch: () => {
      servicesQ.refetch();
      coursesQ.refetch();
      postsQ.refetch();
      notesQ.refetch();
      modelSetsQ.refetch();
    },
  };
}

/** Invalidate every prep cache entry (after admin saves). */
export function usePrepRefresh(): () => void {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["prep"] });
  };
}

/** Create or update a prep document. `id` present → update, else create. */
export async function savePrepDoc<T extends { id?: string }>(
  collectionName: PrepCollection,
  data: T,
): Promise<string> {
  const { id, ...rest } = data;
  if (id) {
    await updateDoc(doc(db, collectionName, id), rest as Record<string, unknown>);
    return id;
  }
  const ref = await addDoc(collection(db, collectionName), {
    ...rest,
    createdAt: Date.now(),
  } as Record<string, unknown>);
  return ref.id;
}

export async function deletePrepDoc(collectionName: PrepCollection, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

/**
 * Write the bundled default catalog into Firestore (first-time seeding).
 *
 * Firestore auto-generates doc IDs, but the bundled rows reference each other
 * by their bundled IDs (`serviceId: "svc-nepal-police"` …). Every reference is
 * remapped to the actual newly-created doc ID — otherwise service → course →
 * post relations silently break after seeding.
 */
export async function seedPrepDefaults(): Promise<number> {
  let count = 0;
  const serviceIds = new Map<string, string>();
  const courseIds = new Map<string, string>();
  const postIds = new Map<string, string>();

  for (const s of DEFAULT_PREP_SERVICES) {
    const { id, ...rest } = s;
    const ref = await addDoc(collection(db, PREP_COLLECTIONS.services), {
      ...rest,
      createdAt: Date.now(),
    });
    serviceIds.set(id, ref.id);
    count++;
  }
  for (const c of DEFAULT_PREP_COURSES) {
    const { id, ...rest } = c;
    const ref = await addDoc(collection(db, PREP_COLLECTIONS.courses), {
      ...rest,
      serviceId: serviceIds.get(c.serviceId) ?? c.serviceId,
      createdAt: Date.now(),
    });
    courseIds.set(id, ref.id);
    count++;
  }
  for (const p of DEFAULT_PREP_POSTS) {
    const { id, ...rest } = p;
    const ref = await addDoc(collection(db, PREP_COLLECTIONS.posts), {
      ...rest,
      serviceId: serviceIds.get(p.serviceId) ?? p.serviceId,
      courseId: courseIds.get(p.courseId) ?? p.courseId,
      createdAt: Date.now(),
    });
    postIds.set(id, ref.id);
    count++;
  }
  for (const n of DEFAULT_PREP_NOTES) {
    const { id, ...rest } = n;
    await addDoc(collection(db, PREP_COLLECTIONS.notes), {
      ...rest,
      serviceId: serviceIds.get(n.serviceId) ?? n.serviceId,
      courseId: courseIds.get(n.courseId) ?? n.courseId,
      postId: postIds.get(n.postId) ?? n.postId,
      isPublished: n.isPublished === true,
      createdAt: Date.now(),
    });
    count++;
  }
  for (const m of DEFAULT_PREP_MODEL_SETS) {
    const { id, ...rest } = m;
    await addDoc(collection(db, PREP_COLLECTIONS.modelSets), {
      ...rest,
      serviceId: serviceIds.get(m.serviceId) ?? m.serviceId,
      courseId: courseIds.get(m.courseId) ?? m.courseId,
      postId: postIds.get(m.postId) ?? m.postId,
      isPublished: m.isPublished === true,
      createdAt: Date.now(),
    });
    count++;
  }
  return count;
}
