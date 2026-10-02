import { useEffect } from "react";

const SITE_NAME = "STAR COACHING INSTITUTE";
const DEFAULT_ORIGIN = "https://starcoachinginstitute.com.np";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-page SEO: title, description, canonical and Open Graph tags.
 * (No helmet in this stack — plain DOM meta management.)
 */
export function usePageMeta(options: {
  title: string;
  description?: string;
  /** path starting with "/" — becomes the canonical URL */
  path?: string;
  ogType?: string;
}) {
  const { title, description, path, ogType } = options;
  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    if (description) setMeta("name", "description", description);
    const canonical = path ? `${DEFAULT_ORIGIN}${path}` : undefined;
    if (canonical) {
      setLink("canonical", canonical);
      setMeta("property", "og:url", canonical);
    }
    setMeta("property", "og:title", document.title);
    if (description) setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType ?? "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [title, description, path, ogType]);
}
