/** Storage uploads using S3 presigned URLs issued by the API. */
import { api, awsConfig } from "./runtime";

export interface Storage {
  __aws?: true;
}
export interface StorageReference {
  path: string;
  bucket: string;
  name: string;
  fullPath: string;
}
export interface UploadResult {
  ref: StorageReference;
  metadata: Record<string, unknown>;
}

export function getStorage(_app?: unknown): Storage {
  return { __aws: true };
}

export function ref(_storage: Storage | unknown, pathOrUrl: string): StorageReference {
  let path = String(pathOrUrl || "");
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      path = decodeURIComponent(new URL(path).pathname).replace(/^\/+/, "");
    } catch {
      /* keep as-is */
    }
  }
  const clean = path.replace(/^\/+/, "");
  return {
    path: clean,
    bucket: awsConfig.mediaBase,
    name: clean.split("/").pop() || "",
    fullPath: clean,
  };
}

interface PresignResponse {
  ok: boolean;
  uploadUrl: string;
  publicUrl: string;
}

async function upload(
  refToUpload: StorageReference,
  data: Blob | Uint8Array,
): Promise<UploadResult> {
  const path = refToUpload.path.replace(/^media\//, "");
  const parts = path.split("/");
  const folder = parts.length > 1 ? parts[0] : "uploads";
  const name = parts[parts.length - 1];
  const blob = data as Blob;
  const presign = await api<PresignResponse>("storage", {
    folder,
    name,
    contentType: blob.type || "application/octet-stream",
    size: blob.size ?? 0,
  });
  const res = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: blob.type ? { "Content-Type": blob.type } : undefined,
    body: data as BodyInit,
  });
  if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
  uploadUrls.set(refToUpload.path, presign.publicUrl);
  return { ref: refToUpload, metadata: { fullPath: refToUpload.path, size: blob.size ?? 0 } };
}

const uploadUrls = new Map<string, string>();

export async function uploadBytes(
  refToUpload: StorageReference,
  data: Blob | Uint8Array,
  _metadata?: unknown,
): Promise<UploadResult> {
  return upload(refToUpload, data);
}

export interface UploadTask {
  snapshot: { ref: StorageReference; bytesTransferred: number; totalBytes: number };
  on: (
    event: string,
    next?: (snap: UploadTask["snapshot"]) => void,
    error?: (err: Error) => void,
    complete?: () => void,
  ) => () => void;
  then: Promise<UploadResult>["then"];
  catch: Promise<UploadResult>["catch"];
  finally: Promise<UploadResult>["finally"];
}

export function uploadBytesResumable(
  refToUpload: StorageReference,
  data: Blob | Uint8Array,
): UploadTask {
  const promise = upload(refToUpload, data);
  const handlers: {
    next?: (s: UploadTask["snapshot"]) => void;
    error?: (e: Error) => void;
    complete?: () => void;
  } = {};
  promise.then(() => handlers.complete?.()).catch((err: Error) => handlers.error?.(err));
  return {
    snapshot: { ref: refToUpload, bytesTransferred: 0, totalBytes: (data as Blob).size ?? 0 },
    on(_event, next, error, complete) {
      handlers.next = next;
      handlers.error = error;
      handlers.complete = complete;
      handlers.next?.(this.snapshot);
      return () => {};
    },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
}

export async function getDownloadURL(refToDownload: StorageReference): Promise<string> {
  const known = uploadUrls.get(refToDownload.path);
  if (known) return known;
  const clean = refToDownload.path.replace(/^\/+/, "");
  const key = clean.startsWith("media/") ? clean : `media/${clean}`;
  return `${awsConfig.mediaBase.replace(/\/$/, "")}/${key}`;
}

export async function deleteObject(refToDelete: StorageReference): Promise<void> {
  await api("storage", { action: "delete", path: refToDelete.path });
  uploadUrls.delete(refToDelete.path);
}
