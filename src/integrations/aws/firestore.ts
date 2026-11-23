/* eslint-disable @typescript-eslint/no-explicit-any */
/** Firestore-compatible document API backed by the AWS Lambda data endpoint. */
import { api, randomId } from "./runtime";

export interface Firestore {
  __aws?: true;
}
export interface CollectionReference<T = any> {
  __kind: "collection";
  path: string;
  type?: T;
}
export interface DocumentReference<T = any> {
  __kind: "doc";
  path: string;
  id: string;
  type?: T;
}
export interface Query<T = any> extends CollectionReference<T> {
  constraints: QueryConstraint[];
}
export type QueryConstraint =
  | { type: "where"; field: string; op: string; value: unknown }
  | { type: "orderBy"; field: string; direction: "asc" | "desc" }
  | { type: "limit"; count: number };

export interface DocumentSnapshot<T = any> {
  id: string;
  exists: () => boolean;
  data: () => any;
}
export interface QuerySnapshot<T = any> {
  docs: DocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach: (cb: (doc: DocumentSnapshot<T>) => void) => void;
}

interface ApiDoc {
  id: string;
  data: Record<string, unknown>;
}

const snapshot = <T>(item: ApiDoc): DocumentSnapshot<T> => ({
  id: item.id,
  exists: () => true,
  data: () => item.data as T,
});

const querySnapshot = <T>(docs: ApiDoc[]): QuerySnapshot<T> => ({
  docs: docs.map((d) => snapshot<T>(d)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: (cb) => docs.forEach((d) => cb(snapshot<T>(d))),
});

export function getFirestore(_app?: unknown): Firestore {
  return { __aws: true };
}

export function collection<T = any>(
  _db: Firestore,
  path: string,
  ...segments: string[]
): CollectionReference<T> {
  return { __kind: "collection", path: [path, ...segments].filter(Boolean).join("/") };
}

export function doc<T = any>(
  dbOrRef: Firestore | CollectionReference<T> | DocumentReference<T>,
  ...segments: string[]
): DocumentReference<T> {
  const base = "__kind" in dbOrRef ? dbOrRef.path : "";
  const parts = [...(base ? [base] : []), ...segments.filter(Boolean)];
  if (parts.length % 2 !== 0) parts.push(randomId());
  return { __kind: "doc", path: parts.join("/"), id: parts[parts.length - 1] };
}

export function query<T = any>(
  ref: CollectionReference<T>,
  ...constraints: QueryConstraint[]
): Query<T> {
  return { ...ref, constraints };
}

export function where(field: string, op: string, value: unknown): QueryConstraint {
  return { type: "where", field, op, value };
}

export function orderBy(field: string, direction: "asc" | "desc" = "asc"): QueryConstraint {
  return { type: "orderBy", field, direction };
}

export function limit(count: number): QueryConstraint {
  return { type: "limit", count };
}

export function serverTimestamp(): any {
  return { __sentinel: "serverTimestamp" };
}

function target(ref: CollectionReference | DocumentReference): { collection: string; id?: string } {
  const parts = ref.path.split("/");
  const id = ref.__kind === "doc" ? parts.pop() : undefined;
  return { collection: parts.join("/"), id };
}

export async function getDocs<T = any>(
  ref: Query<T> | CollectionReference<T>,
): Promise<QuerySnapshot<T>> {
  const { collection: name } = target(ref);
  const res = await api<{ ok: boolean; docs: ApiDoc[] }>("data", {
    op: "query",
    collection: name,
    constraints: "constraints" in ref ? ref.constraints : [],
  });
  return querySnapshot<T>(res.docs || []);
}

export async function getDoc<T = any>(ref: DocumentReference<T>): Promise<DocumentSnapshot<T>> {
  const { collection: name, id } = target(ref);
  const res = await api<{ ok: boolean; doc: ApiDoc | null }>("data", {
    op: "get",
    collection: name,
    id,
  });
  return res.doc
    ? snapshot<T>(res.doc)
    : { id: id || "", exists: () => false, data: () => ({}) as T };
}

export async function setDoc<T = any>(
  ref: DocumentReference<T>,
  data: Record<string, unknown>,
  options?: { merge?: boolean },
): Promise<void> {
  const { collection: name, id } = target(ref);
  await api("data", { op: "set", collection: name, id, data, merge: options?.merge === true });
}

export async function addDoc<T = any>(
  ref: CollectionReference<T>,
  data: Record<string, unknown>,
): Promise<DocumentReference<T>> {
  const id = randomId();
  await setDoc(doc(ref, id) as DocumentReference<T>, data);
  return doc(ref, id) as DocumentReference<T>;
}

export async function updateDoc<T = any>(
  ref: DocumentReference<T>,
  data: Record<string, unknown>,
): Promise<void> {
  const { collection: name, id } = target(ref);
  await api("data", { op: "update", collection: name, id, data });
}

export async function deleteDoc<T = any>(ref: DocumentReference<T>): Promise<void> {
  const { collection: name, id } = target(ref);
  await api("data", { op: "delete", collection: name, id });
}

export function writeBatch(_db: Firestore) {
  const ops: Record<string, unknown>[] = [];
  return {
    set(ref: DocumentReference, data: Record<string, unknown>) {
      const t = target(ref);
      ops.push({ op: "set", collection: t.collection, id: t.id, data });
      return this;
    },
    update(ref: DocumentReference, data: Record<string, unknown>) {
      const t = target(ref);
      ops.push({ op: "update", collection: t.collection, id: t.id, data });
      return this;
    },
    delete(ref: DocumentReference) {
      const t = target(ref);
      ops.push({ op: "delete", collection: t.collection, id: t.id });
      return this;
    },
    async commit() {
      if (ops.length) await api("data", { op: "batch", ops });
    },
  };
}

interface ListenerOptions<T> {
  next: (snap: T) => void;
  error?: (err: Error) => void;
}

export function onSnapshot<T = any>(
  ref: Query<T> | CollectionReference<T>,
  next: (snap: QuerySnapshot<T>) => void,
  error?: (err: Error) => void,
): () => void;
export function onSnapshot<T = any>(
  ref: Query<T> | CollectionReference<T>,
  options: ListenerOptions<QuerySnapshot<T>>,
): () => void;
export function onSnapshot<T = any>(
  ref: DocumentReference<T>,
  next: (snap: DocumentSnapshot<T>) => void,
  error?: (err: Error) => void,
): () => void;
export function onSnapshot<T = any>(
  ref: DocumentReference<T>,
  options: ListenerOptions<DocumentSnapshot<T>>,
): () => void;
export function onSnapshot(
  ref: Query | CollectionReference | DocumentReference,
  nextOrOptions: ((snap: any) => void) | ListenerOptions<any>,
  onError?: (err: Error) => void,
): () => void {
  const next = typeof nextOrOptions === "function" ? nextOrOptions : nextOrOptions.next;
  const error = typeof nextOrOptions === "function" ? onError : nextOrOptions.error || onError;
  let stopped = false;
  const isDoc = ref.__kind === "doc";

  const tick = async () => {
    if (stopped) return;
    try {
      if (isDoc) {
        const snap = await getDoc(ref as DocumentReference);
        if (!stopped) next(snap);
      } else {
        const snap = await getDocs(ref as Query | CollectionReference);
        if (!stopped) next(snap);
      }
    } catch (err) {
      if (!stopped && error) error(err instanceof Error ? err : new Error(String(err)));
    }
  };

  void tick();
  const timer = setInterval(tick, 5000);
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
