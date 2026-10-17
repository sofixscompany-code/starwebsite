import type { PricingSnapshot } from "@/lib/admission-form/types";

/**
 * Screen-only fee breakdown — automatic totals from the selected
 * course package (spec §57). Styled with thin borders + red heading
 * like the institute's printed fee tables; never shown in print
 * (the printed document keeps the original paper layout).
 *
 * Convention (shared with the enquiry form): course fees in red,
 * hostel fee in green. Discount/payable rows appear only once the
 * institute has granted a discount (office-only field).
 */
export function FeeBreakdown({
  pricing,
  hostelFee = 0,
  hostelName = "",
  discount = 0,
}: {
  pricing: PricingSnapshot | null;
  hostelFee?: number;
  hostelName?: string;
  discount?: number;
}) {
  const rows: Array<[string, number | undefined]> = [
    ["Admission Fee ( भर्नी शुल्क)", pricing?.admissionFee],
    ["Tuition Fee (पढाई शुल्क)", pricing?.tuitionFee],
    ["Exam Fee (परीक्षा शुल्क)", pricing?.examFee],
    ["Physical ( फिजिकल शुल्क)", pricing?.physicalFee],
    ["Additional Fee", pricing?.additionalFee],
  ];
  const courseTotal = pricing?.totalFee ?? 0;
  const total = courseTotal + hostelFee;
  const payable = Math.max(total - discount, 0);

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
          {hostelFee > 0 && (
            <tr className="sci-fee-hostel">
              <td>
                Hostel Fee (छात्रावास शुल्क)
                {hostelName ? <span className="sci-fee-sub"> {hostelName}</span> : null}
              </td>
              <td className="sci-fee-num">Rs. {hostelFee.toLocaleString("en-IN")}</td>
            </tr>
          )}
          <tr className="sci-fee-total">
            <td>Total Fee (जम्मा शुल्क)</td>
            <td className="sci-fee-num">Rs. {total ? total.toLocaleString("en-IN") : "—"}</td>
          </tr>
          {discount > 0 && (
            <>
              <tr className="sci-fee-discount">
                <td>Discount (छुट)</td>
                <td className="sci-fee-num">− Rs. {discount.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="sci-fee-total">
                <td>Payable (दिनुपर्ने)</td>
                <td className="sci-fee-num">Rs. {payable.toLocaleString("en-IN")}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      {!pricing && (
        <p className="sci-fee-hint">
          Select <strong>Organization → Post → Course → Package</strong> in Step 1 to calculate fees
          automatically.
        </p>
      )}
    </div>
  );
}
