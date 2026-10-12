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

/**
 * Institute WhatsApp "click-to-chat" message link (owner-provided).
 *
 * Used for every general "chat with us" button (header, footer, hero,
 * floating chat, contact, payment card…). Number-based links
 * (whatsappNumberHref) are kept ONLY where the page must prefill the message
 * text (?text=…): the enquiry / admission forms sending form details.
 */
export const WHATSAPP_CHAT_LINK = "https://wa.me/message/546YHQNR6APQA1";

export function whatsappHref(_raw?: string): string {
  return WHATSAPP_CHAT_LINK;
}

/** Number-based wa.me link — only for prefilled form-detail messages. */
export function whatsappNumberHref(raw: string | undefined): string {
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
