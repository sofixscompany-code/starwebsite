/**
 * Modals for the universal Payment & Invoice system:
 *  - RecordPaymentModal → creates a `payments` doc with unique Transaction ID +
 *    Receipt No + recorded-by audit fields; optionally settles a fee invoice.
 *  - PayableModal       → defines/edits a payable (teacher/staff salary or a
 *    manual fee) in the `payables` collection.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Save, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui";
import { getStoredAuthUser } from "@/hooks/use-dashboard-data";
import {
  fmtRs,
  invoiceStatusAfterPaid,
  newReceiptNumber,
  newTransactionId,
  normalizePayment,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  PERSON_ROLES,
  type PaymentTxn,
} from "@/lib/finance";
import { useAdminT } from "@/lib/admin-i18n";
import type { FinanceData } from "@/hooks/use-finance";

const LABEL = "text-sm font-medium mb-1 block";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

/* ═══════════════════════ RECORD PAYMENT ═══════════════════════ */

export interface PaymentPrefill {
  personRole?: string;
  personId?: string;
  personName?: string;
  personEmail?: string;
  paymentType?: string;
  amount?: number;
}

export function RecordPaymentModal({
  open,
  onClose,
  data,
  prefill,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  data: FinanceData;
  prefill?: PaymentPrefill;
  onSaved: (txn: PaymentTxn) => void;
}) {
  const { t } = useAdminT();
  const [saving, setSaving] = useState(false);
  const [personRole, setPersonRole] = useState("student");
  const [personKey, setPersonKey] = useState(""); // "" = manual entry
  const [manualName, setManualName] = useState("");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [paymentType, setPaymentType] = useState("tuition");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceId, setInvoiceId] = useState("");

  useEffect(() => {
    if (!open) return;
    setPersonRole(prefill?.personRole || "student");
    setPersonKey("");
    setManualName("");
    setPersonId(prefill?.personId || "");
    setPersonName(prefill?.personName || "");
    setPersonEmail(prefill?.personEmail || "");
    setPaymentType(prefill?.paymentType || "tuition");
    setAmount(prefill?.amount || 0);
    setMethod("cash");
    setReference("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setInvoiceId("");
    setSaving(false);
  }, [open, prefill]);

  const isStudent = personRole === "student";

  // Person pickers: students from `students`, others from defined payables.
  const studentOptions = data.students
    .map((s) => ({
      key: s.id,
      label: `${String(s.fullName || s.name || "Student")}${
        s.course || s.batch ? ` · ${String(s.course || s.batch)}` : ""
      }`,
      personId: s.id,
      personName: String(s.fullName || s.name || ""),
      personEmail: String(s.email || ""),
    }))
    .filter((o) => o.personName);

  const payablePersonOptions = data.payables
    .filter((p) => String(p.personRole || "") === personRole)
    .map((p) => ({
      key: p.id,
      label: String(p.personName || ""),
      personId: String(p.personId || ""),
      personName: String(p.personName || ""),
      personEmail: String(p.personEmail || ""),
    }))
    .filter((o, i, arr) => arr.findIndex((x) => x.personName === o.personName) === i);

  const options = isStudent ? studentOptions : payablePersonOptions;

  const openInvoices = isStudent
    ? data.invoices.filter((i) => {
        const status = String(i.status || "pending");
        if (status === "paid" || status === "cancelled") return false;
        if (!personName && !personId) return false;
        return (
          (personId && String(i.studentId || "") === personId) ||
          (personName && String(i.studentName || "") === personName)
        );
      })
    : [];

  const handlePersonChange = (key: string) => {
    setPersonKey(key);
    setInvoiceId("");
    if (!key) {
      setPersonId("");
      setPersonName("");
      setPersonEmail("");
      return;
    }
    const opt = options.find((o) => o.key === key);
    if (opt) {
      setPersonId(opt.personId);
      setPersonName(opt.personName);
      setPersonEmail(opt.personEmail);
      setAmount((a) => a || 0);
    }
  };

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = data.invoices.find((i) => i.id === id);
    if (inv) {
      const paidBefore = data.rawPayments
        .filter(
          (p) =>
            p.invoiceId === id &&
            !["failed", "refunded", "cancelled", "void"].includes(
              String(p.status || "").toLowerCase(),
            ),
        )
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      const remaining = Math.max(Number(inv.totalAmount || inv.amount || 0) - paidBefore, 0);
      if (remaining > 0) setAmount(remaining);
      setPersonId(String(inv.studentId || "") || personId);
      setPersonName(String(inv.studentName || "") || personName);
      setPaymentType("tuition");
    }
  };

  const handleSave = async () => {
    const finalName = personName || manualName.trim();
    if (!finalName) {
      toast.error(t("enterPersonError"));
      return;
    }
    if (!amount || amount <= 0) {
      toast.error(t("enterAmountError"));
      return;
    }
    setSaving(true);
    try {
      const actor = getStoredAuthUser();
      const now = new Date();
      const payload: Record<string, unknown> = {
        transactionId: newTransactionId(),
        receiptNumber: newReceiptNumber(),
        invoiceId,
        invoiceNumber: String(data.invoices.find((i) => i.id === invoiceId)?.invoiceNumber || ""),
        personId,
        personName: finalName,
        personRole,
        personEmail,
        paymentType,
        amount: Number(amount),
        method,
        reference,
        notes,
        date: now.toISOString(),
        paymentDate: date,
        status: "completed",
        recordedBy: actor?.name || actor?.email || "Unknown user",
        recordedById: actor?.uid || "",
        recordedByRole: actor?.role || "",
        // Legacy fields so old dashboards keep working.
        studentName: isStudent ? finalName : "",
        studentId: isStudent ? personId : "",
      };
      await data.createPayment(payload);

      if (invoiceId) {
        const inv = data.invoices.find((i) => i.id === invoiceId);
        if (inv) {
          const paid =
            data.rawPayments
              .filter(
                (p) =>
                  p.invoiceId === invoiceId &&
                  !["failed", "refunded", "cancelled", "void"].includes(
                    String(p.status || "").toLowerCase(),
                  ),
              )
              .reduce((s, p) => s + Number(p.amount || 0), 0) + Number(amount);
          const status = invoiceStatusAfterPaid(
            Number(inv.totalAmount || inv.amount || 0),
            paid,
            String(inv.dueDate || ""),
            String(inv.status || "pending"),
          );
          await data.updateInvoice(invoiceId, { status, paidAmount: paid });
        }
      }

      const txn = normalizePayment({ id: "new", ...payload });
      toast.success(t("paymentRecordedMsg"));
      onSaved(txn);
      onClose();
    } catch {
      toast.error(t("paymentFailedMsg"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title={t("recordPaymentTitle")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("roleLabel")}>
            <select
              value={personRole}
              onChange={(e) => {
                setPersonRole(e.target.value);
                setPersonKey("");
                setPersonId("");
                setPersonName("");
                setPersonEmail("");
                setInvoiceId("");
              }}
              className="ap-input"
            >
              {PERSON_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`role_${r}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("paymentTypeLabel")}>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="ap-input"
            >
              {PAYMENT_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`ptype_${tp}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t("personLabel")}>
          <div className="space-y-2">
            <select
              value={personKey}
              onChange={(e) => handlePersonChange(e.target.value)}
              className="ap-input"
            >
              <option value="">{t("enterManually")}</option>
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            {!personKey && (
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder={t("personNamePlaceholder")}
                className="ap-input"
              />
            )}
          </div>
        </Field>

        {isStudent && openInvoices.length > 0 && (
          <Field label={t("linkInvoiceLabel")}>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="ap-input"
            >
              <option value="">{t("noInvoiceOption")}</option>
              {openInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {String(i.invoiceNumber)} — {String(i.studentName)} (
                  {fmtRs(Number(i.totalAmount || i.amount || 0))})
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label={`${t("amountLabel")} (Rs)`}>
            <input
              type="number"
              min={0}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="ap-input"
            />
          </Field>
          <Field label={t("methodLabel")}>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="ap-input">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {t(`method_${m}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("dateLabel")}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="ap-input"
            />
          </Field>
          <Field label={t("referenceLabel")}>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="—"
              className="ap-input"
            />
          </Field>
        </div>

        <Field label={t("notesLabel")}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="—"
            className="ap-input"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="ap-btn-ghost">
          {t("cancelLabel")}
        </button>
        <button onClick={handleSave} disabled={saving} className="ap-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t("recordPayment")}
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ PAYABLE (define total) ═══════════════════════ */

export function PayableModal({
  open,
  onClose,
  data,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  data: FinanceData;
  editing?: { id: string; [k: string]: unknown } | null;
}) {
  const { t } = useAdminT();
  const [saving, setSaving] = useState(false);
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("teacher");
  const [personEmail, setPersonEmail] = useState("");
  const [paymentType, setPaymentType] = useState("salary");
  const [totalAmount, setTotalAmount] = useState(0);
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setPersonName(String(editing?.personName || ""));
    setPersonRole(String(editing?.personRole || "teacher"));
    setPersonEmail(String(editing?.personEmail || ""));
    setPaymentType(String(editing?.paymentType || "salary"));
    setTotalAmount(Number(editing?.totalAmount || 0));
    setPeriod(String(editing?.period || ""));
    setNotes(String(editing?.notes || ""));
    setSaving(false);
  }, [open, editing]);

  const handleSave = async () => {
    if (!personName.trim()) {
      toast.error(t("enterPersonError"));
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      toast.error(t("enterAmountError"));
      return;
    }
    setSaving(true);
    try {
      const actor = getStoredAuthUser();
      const payload = {
        personName: personName.trim(),
        personRole,
        personEmail: personEmail.trim(),
        paymentType,
        totalAmount: Number(totalAmount),
        period: period.trim(),
        notes: notes.trim(),
        createdByName: actor?.name || actor?.email || "",
      };
      if (editing?.id) await data.updatePayable(editing.id, payload);
      else await data.createPayable(payload);
      toast.success(editing?.id ? t("payableUpdatedMsg") : t("payableCreatedMsg"));
      onClose();
    } catch {
      toast.error(t("paymentFailedMsg"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={editing?.id ? t("editPayableTitle") : t("addPayableTitle")}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("definePayableHint")}</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("roleLabel")}>
            <select
              value={personRole}
              onChange={(e) => setPersonRole(e.target.value)}
              className="ap-input"
            >
              {PERSON_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`role_${r}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("paymentTypeLabel")}>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="ap-input"
            >
              {PAYMENT_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`ptype_${tp}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("personNameLabel")}>
            <input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="ap-input"
            />
          </Field>
          <Field label={t("emailLabel")}>
            <input
              type="email"
              value={personEmail}
              onChange={(e) => setPersonEmail(e.target.value)}
              placeholder="—"
              className="ap-input"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={`${t("totalAmountLabel")} (Rs)`}>
            <input
              type="number"
              min={0}
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="ap-input"
            />
          </Field>
          <Field label={t("periodLabel")}>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2082/083"
              className="ap-input"
            />
          </Field>
        </div>
        <Field label={t("notesLabel")}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="—"
            className="ap-input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="ap-btn-ghost">
          {t("cancelLabel")}
        </button>
        <button onClick={handleSave} disabled={saving} className="ap-btn">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : editing?.id ? (
            <Pencil className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {editing?.id ? t("saveLabel") : t("definePayable")}
        </button>
      </div>
    </Modal>
  );
}
