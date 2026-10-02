/** Clean URL helpers for the Preparation Portal (`/services/*`). */

export const prepHome = "/services";

export const servicePath = (serviceSlug: string) => `/services/${serviceSlug}`;

export const coursePath = (serviceSlug: string, courseSlug: string) =>
  `${servicePath(serviceSlug)}/${courseSlug}`;

export const postPath = (serviceSlug: string, courseSlug: string, postSlug: string) =>
  `${coursePath(serviceSlug, courseSlug)}/${postSlug}`;

export const syllabusPath = (s: string, c: string, p: string) => `${postPath(s, c, p)}/syllabus`;

export const notesPath = (s: string, c: string, p: string) => `${postPath(s, c, p)}/notes`;

export const modelSetListPath = (s: string, c: string, p: string) =>
  `${postPath(s, c, p)}/model-set`;

export const modelSetDetailPath = (s: string, c: string, p: string, modelSetId: string) =>
  `${modelSetListPath(s, c, p)}/${modelSetId}`;
