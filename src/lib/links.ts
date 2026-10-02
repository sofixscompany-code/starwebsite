/**
 * Shared public-site link helpers.
 */

/**
 * Build a wa.me link that survives any admin-entered format:
 * "9804899123", "09804899123", "+977-9804899123" all resolve correctly
 * (never produces wa.me/977977… duplicates).
 */
export function whatsappDigits(raw: string | undefined): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("977") ? digits : `977${digits.slice(-10)}`;
}

export function whatsappHref(raw: string | undefined): string {
  const digits = whatsappDigits(raw);
  return digits ? `https://wa.me/${digits}` : "https://wa.me/";
}

/** "Er. Bablu Yadav" → "BY" (max 2 letters). */
export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
