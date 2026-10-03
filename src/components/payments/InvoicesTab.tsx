/**
 * Invoices tab — student fee invoices from `fee_invoices` with paid/pending
 * computed live from payments, plus print-to-PDF per invoice.
 */

import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Printer, FileText, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, DataTable, EmptyState, StatCard, Toolbar } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import { downloadCsv, fmtRs, invoiceStatusAfterPaid, paidAgainstInvoice } from "@/lib/finance";
import { printArea, InvoiceModal, type InvoiceDocData } from "./Printable";
import type { FinanceData } from "@/hooks/use-finance";

type InvoiceRow = InvoiceDocData & { id: string; createdAtMs: number };

const STATUS_TONE = (s: string): "success" | "warning" | "danger" | "info" | "muted" =>
  s === "paid"
    ? "success"
    : s === "partial"
      ? "warning"
      : s === "cancelled"
        ? "muted"
        : s === "overdue"
          ? "danger"
          : "info";

export function InvoicesTab({ data }: { data: FinanceData }) {
  const { t } = useAdminT();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [invoiceDoc, setInvoiceDoc] = useState<InvoiceDocData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<InvoiceRow[]>(() => {
    const needle = q.trim().toLowerCase();
    return data.invoices
      .map((i) => {
        const paid = paidAgainstInvoice(data.rawPayments, String(i.id));
        const total = Number(i.totalAmount || i.amount || 0);
        const status = invoiceStatusAfterPaid(
          total,
          paid,
          String(i.dueDate || ""),
          String(i.status || "pending"),
        );
        return {
          id: String(i.id),
          invoiceNumber: String(i.invoiceNumber || "—"),
          studentName: String(i.studentName || "—"),
          courseName: String(i.courseName || ""),
          totalAmount: total,
          dueDate: String(i.dueDate || ""),
          status,
          notes: String(i.notes || ""),
          items: Array.isArray(i.items) ? (i.items as InvoiceDocData["items"]) : [],
          paid,
          createdAtMs: Number(i.createdAt) || Date.parse(String(i.createdAt || "")) || 0,
        } as InvoiceRow;
      })
      .filter((r) => {
        if (
          needle &&
          !`${r.invoiceNumber} ${r.studentName} ${r.courseName}`.toLowerCase().includes(needle)
        )
          return false;
        if (statusF !== "all" && r.status !== statusF) return false;
        return true;
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [data.invoices, data.rawPayments, q, statusF]);

  const billed = rows.reduce((s, r) => s + r.totalAmount, 0);
  const paidSum = rows.reduce((s, r) => s + r.paid, 0);
  const pendingSum = rows.reduce((s, r) => s + Math.max(r.totalAmount - r.paid, 0), 0);

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error(t("nothingToExport"));
      return;
    }
    downloadCsv(
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Invoice No",
        "Student",
        "Course",
        "Total (Rs)",
        "Paid (Rs)",
        "Pending (Rs)",
        "Due Date",
        "Status",
      ],
      rows.map((r) => [
        r.invoiceNumber,
        r.studentName,
        r.courseName,
        r.totalAmount,
        r.paid,
        Math.max(r.totalAmount - r.paid, 0),
        r.dueDate,
        r.status,
      ]),
    );
    toast.success(t("exportedMsg"));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t("invoicesTab")} value={rows.length} icon={FileText} tone="blue" />
        <StatCard label={t("billedLabel")} value={fmtRs(billed)} icon={FileText} tone="purple" />
        <StatCard label={t("paidLabel")} value={fmtRs(paidSum)} icon={Download} tone="success" />
        <StatCard
          label={t("pendingLabel")}
          value={fmtRs(pendingSum)}
          icon={Printer}
          tone="danger"
        />
      </div>

      <Toolbar>
        <div className="w-64">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchInvoices")}
            className="ap-input"
          />
        </div>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="ap-input !w-36"
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="pending">{t("status_pending")}</option>
          <option value="partial">{t("status_partial")}</option>
          <option value="paid">{t("status_paid")}</option>
          <option value="overdue">{t("status_overdue")}</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/admin/accounting" className="ap-btn">
            <FilePlus2 className="w-4 h-4" /> {t("createInvoiceLabel")}
          </Link>
          <button onClick={exportCsv} className="ap-btn-secondary">
            <Download className="w-4 h-4" /> {t("exportCsvLabel")}
          </button>
          <button onClick={() => printArea(printRef.current)} className="ap-btn-ghost">
            <Printer className="w-4 h-4" /> {t("printLabel")}
          </button>
        </div>
      </Toolbar>

      <div ref={printRef}>
        <div className="hidden print:block text-center mb-3 font-bold text-lg">
          {t("invoicesTab")} — {new Date().toISOString().slice(0, 10)}
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("noInvoicesYet")}
            desc={t("noInvoicesYetDesc")}
            action={{
              label: t("createInvoiceLabel"),
              onClick: () => navigate("/admin/accounting"),
            }}
          />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              {
                key: "invoiceNumber",
                label: t("invoiceNoLabel"),
                render: (r: InvoiceRow) => (
                  <span className="font-mono font-bold text-navy">{r.invoiceNumber}</span>
                ),
              },
              {
                key: "studentName",
                label: t("Student"),
                render: (r: InvoiceRow) => (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{r.studentName}</p>
                    {r.courseName && <p className="text-[11px] text-gray-400">{r.courseName}</p>}
                  </div>
                ),
              },
              {
                key: "totalAmount",
                label: t("totalAmountLabel"),
                render: (r: InvoiceRow) => (
                  <span className="font-semibold">{fmtRs(r.totalAmount)}</span>
                ),
              },
              {
                key: "paid",
                label: t("paidLabel"),
                render: (r: InvoiceRow) => (
                  <span className="font-semibold text-emerald-600">{fmtRs(r.paid)}</span>
                ),
              },
              {
                key: "pending",
                label: t("pendingLabel"),
                render: (r: InvoiceRow) => (
                  <span
                    className={`font-semibold ${
                      r.totalAmount - r.paid > 0 ? "text-brand-red" : "text-gray-400"
                    }`}
                  >
                    {fmtRs(Math.max(r.totalAmount - r.paid, 0))}
                  </span>
                ),
              },
              {
                key: "dueDate",
                label: t("dueDateLabel"),
                render: (r: InvoiceRow) => r.dueDate || "—",
              },
              {
                key: "status",
                label: t("statusLabel"),
                render: (r: InvoiceRow) => (
                  <Badge tone={STATUS_TONE(r.status)}>{t(`status_${r.status}`)}</Badge>
                ),
              },
            ]}
            actions={(r: InvoiceRow) => (
              <button onClick={() => setInvoiceDoc(r)} className="ap-btn-ghost whitespace-nowrap">
                <Printer className="w-4 h-4" /> {t("printInvoiceLabel")}
              </button>
            )}
          />
        )}
      </div>

      <InvoiceModal invoice={invoiceDoc} onClose={() => setInvoiceDoc(null)} />
    </div>
  );
}
