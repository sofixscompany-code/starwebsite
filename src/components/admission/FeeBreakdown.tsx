import type { PricingSnapshot } from "@/lib/admission-form/types";

/**
 * Screen-only fee breakdown — automatic totals from the selected
 * course package (spec §57). Styled with thin borders + red heading
 * like the institute's printed fee tables; never shown in print
 * (the printed document keeps the original paper layout).
 */
export function FeeBreakdown({ pricing }: { pricing: PricingSnapshot | null }) {
  const rows: Array<[string, number | undefined]> = [
    ["Admission Fee ( भर्नी शुल्क)", pricing?.admissionFee],
    ["Tuition Fee (पढाई शुल्क)", pricing?.tuitionFee],
    ["Exam Fee (परीक्षा शुल्क)", pricing?.examFee],
    ["Physical ( फिजिकल शुल्क)", pricing?.physicalFee],
    ["Additional Fee", pricing?.additionalFee],
  ];

  return (
    <div className="sci-fee-panel no-print">
      <table className="sci-fee-table">
        <thead>
          <tr>
            <th colSpan={2}>Fee Breakdown</th>
          </tr>
          {pricing && (
            <tr>
              <th colSpan={2} className="sci-fee-course">
                {pricing.course} — {pricing.package}
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          {rows.map(([label, val]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className="sci-fee-num">
                Rs. {val === undefined ? "—" : val.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
          <tr className="sci-fee-total">
            <td>Total Fee (जम्मा शुल्क)</td>
            <td className="sci-fee-num">
              Rs. {pricing ? pricing.totalFee.toLocaleString("en-IN") : "—"}
            </td>
          </tr>
        </tbody>
      </table>
      {!pricing && (
        <p className="sci-fee-hint">
          Select <strong>Organization → Post → Course → Package</strong> on the form to calculate
          fees automatically.
        </p>
      )}
    </div>
  );
}
