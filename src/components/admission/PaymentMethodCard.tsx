import {
  Loader2,
  Wallet,
  Smartphone,
  QrCode,
  Landmark,
  Banknote,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/admission-form/types";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site-config";

/** Admin-uploaded payment config — Firestore `site_settings/payment_qr` (public read). */
export interface PaymentQrSettings {
  esewa: string;
  khalti: string;
  fonepay: string;
  bankDetails: string;
}

const EMPTY_QR: PaymentQrSettings = { esewa: "", khalti: "", fonepay: "", bankDetails: "" };

export function usePaymentQrSettings() {
  return useQuery({
    queryKey: ["payment-qr-settings"],
    queryFn: async (): Promise<PaymentQrSettings> => {
      try {
        const snap = await getDoc(doc(db, "site_settings", "payment_qr"));
        const d = snap.data() ?? {};
        return {
          esewa: typeof d.esewa === "string" ? d.esewa : "",
          khalti: typeof d.khalti === "string" ? d.khalti : "",
          fonepay: typeof d.fonepay === "string" ? d.fonepay : "",
          bankDetails: typeof d.bankDetails === "string" ? d.bankDetails : "",
        };
      } catch {
        return EMPTY_QR;
      }
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

const ICONS: Record<PaymentMethod, typeof Wallet> = {
  esewa: Wallet,
  khalti: Smartphone,
  fonepay: QrCode,
  bank: Landmark,
  cod: Banknote,
};

interface PaymentMethodCardProps {
  value: PaymentMethod | "";
  reference: string;
  /** Total fee from the pricing snapshot — shown on QR panels. */
  amount?: number | null;
  error?: string;
  onChange: (m: PaymentMethod) => void;
  onReferenceChange: (v: string) => void;
}

/**
 * Admission-form sidebar card: choose how to pay — eSewa/Khalti/FonePay QR
 * (admin-uploaded images), bank transfer, or COD (cash at office). Whatever
 * is chosen (including COD) is recorded with the application.
 */
export function PaymentMethodCard({
  value,
  reference,
  amount,
  error,
  onChange,
  onReferenceChange,
}: PaymentMethodCardProps) {
  const { data: qr, isLoading } = usePaymentQrSettings();
  const selected = PAYMENT_METHODS.find((m) => m.value === value);
  const isQr = selected?.kind === "qr";
  const qrSrc =
    isQr && selected ? (qr?.[selected.value as "esewa" | "khalti" | "fonepay"] ?? "") : "";
  const amountLabel = amount ? `Rs. ${amount.toLocaleString("en-IN")}` : "";

  const waContact = (
    <a
      href={whatsappHref(site.whatsapp)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-bold text-green-700 hover:underline"
    >
      <MessageCircle size={13} /> WhatsApp सम्पर्क
    </a>
  );

  return (
    <div className="sci-side-card" data-sci-field="paymentMethod">
      <p className="sci-side-title">
        Payment Method <span className="font-normal opacity-70">— भुक्तानी विधि</span>
      </p>

      <div className="mt-2 space-y-1.5" role="radiogroup" aria-label="Payment method">
        {PAYMENT_METHODS.map((m) => {
          const Icon = ICONS[m.value];
          const active = value === m.value;
          return (
            <label
              key={m.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                active
                  ? "border-brand-red bg-brand-red/5 text-navy"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="sci-payment-method"
                className="accent-brand-red"
                checked={active}
                onChange={() => onChange(m.value)}
              />
              <Icon size={14} className={active ? "text-brand-red" : "text-gray-400"} />
              {m.label}
            </label>
          );
        })}
      </div>

      {error && <p className="sci-error-msg mt-2 text-[11px] font-semibold">{error}</p>}

      {/* ── Selected method details ── */}
      {selected && (
        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-2.5 text-[11px] leading-relaxed text-gray-600">
          {isQr && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : qrSrc ? (
                <div className="text-center">
                  <img
                    src={qrSrc}
                    alt={`${selected.label} payment QR`}
                    className="mx-auto h-40 w-40 rounded-lg border bg-white object-contain p-1"
                  />
                  <p className="mt-1.5">
                    <b>{selected.label}</b> स्क्यान गरी
                    {amountLabel && (
                      <>
                        {" "}
                        <b>{amountLabel}</b>
                      </>
                    )}{" "}
                    भुक्तानी गर्नुहोस्।
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 text-center">
                  <p className="font-bold text-amber-700">
                    {selected.label} QR अहिले कन्फिगर गरिएको छैन।
                  </p>
                  <p>
                    तपाईं COD (क्यास एट अफिस) रोजेर फार्म पेश गर्न सक्नुहुन्छ — वा भुक्तानीका लागि{" "}
                    {waContact}
                  </p>
                </div>
              )}
              <input
                type="text"
                value={reference}
                onChange={(e) => onReferenceChange(e.target.value)}
                placeholder="Transaction / Reference ID (optional)"
                maxLength={40}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-brand-red"
              />
            </>
          )}

          {selected.kind === "bank" && (
            <>
              {qr?.bankDetails ? (
                <p className="whitespace-pre-wrap text-gray-700">{qr.bankDetails}</p>
              ) : (
                <p className="text-center">
                  बैंक विवरण अहिले उपलब्ध छैन — {waContact} मार्फत बैंक खाता जान्नुहोस् वा अफिसमा
                  सोध्नुहोस्।
                </p>
              )}
              <input
                type="text"
                value={reference}
                onChange={(e) => onReferenceChange(e.target.value)}
                placeholder="Voucher / Transaction ID (optional)"
                maxLength={40}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-brand-red"
              />
            </>
          )}

          {selected.kind === "cod" && (
            <p>
              <b className="text-green-700">COD — कुनै अग्रिम भुक्तानी छैन।</b> फार्म पेश गर्नुहोस्
              र भुक्तानी अफिसमा पहुँदा गर्नुहुनेछ। तपाईंको भुक्तानी विधि (COD) र फार्म — दुवै रेकर्ड
              हुन्छन्; अफिसले भुक्तानी आएपछि <b>Paid</b> मा मार्क गर्छ।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
