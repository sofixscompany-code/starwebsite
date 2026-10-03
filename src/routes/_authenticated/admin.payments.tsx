/**
 * Universal Payment & Invoice system — the central payments page.
 *
 * Finance roles (super_admin / accountant):
 *   Ledger | Transactions | Invoices | Teacher & Staff Pay | Reports
 * Student / parent / teacher:
 *   read-only "My Payments" scoped to themselves (or their children).
 */

import { useState } from "react";
import { PageHeader } from "@/components/admin/AdminShell";
import { EmptyState, Tabs } from "@/components/admin/ui";
import { AlertCircle } from "lucide-react";
import { getUserRole } from "@/lib/api-auth";
import { useAdminT } from "@/lib/admin-i18n";
import { useFinanceData } from "@/hooks/use-finance";
import type { ModuleRecord } from "@/hooks/use-module-data";
import type { PaymentTxn } from "@/lib/finance";
import { LedgerTab } from "@/components/payments/LedgerTab";
import { TransactionsTab } from "@/components/payments/TransactionsTab";
import { InvoicesTab } from "@/components/payments/InvoicesTab";
import { PayrollTab } from "@/components/payments/PayrollTab";
import { ReportsTab } from "@/components/payments/ReportsTab";
import { MyPayments } from "@/components/payments/MyPayments";
import {
  PayableModal,
  RecordPaymentModal,
  type PaymentPrefill,
} from "@/components/payments/modals";
import { ReceiptModal } from "@/components/payments/Printable";

export function PaymentsPage() {
  const { t } = useAdminT();
  const role = getUserRole();
  const isFinance = role === "super_admin" || role === "accountant";

  if (isFinance) return <FinancePayments />;
  return (
    <div className="space-y-6">
      <PageHeader title={t("myPaymentsTitle")} subtitle={t("myPaymentsSub")} />
      <MyPayments />
    </div>
  );
}

function FinancePayments() {
  const { t } = useAdminT();
  const data = useFinanceData();
  const [tab, setTab] = useState("ledger");
  const [recordOpen, setRecordOpen] = useState(false);
  const [prefill, setPrefill] = useState<PaymentPrefill | undefined>(undefined);
  const [payableOpen, setPayableOpen] = useState(false);
  const [payableEditing, setPayableEditing] = useState<ModuleRecord | null>(null);
  const [receipt, setReceipt] = useState<PaymentTxn | null>(null);

  const openRecord = (p?: PaymentPrefill) => {
    setPrefill(p);
    setRecordOpen(true);
  };

  const payrollCount = data.ledger.filter(
    (r) => r.personRole === "teacher" || r.personRole === "staff",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader title={t("paymentsInvoices")} subtitle={t("paymentsInvoicesSub")} />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: t("ledgerTab"), value: "ledger", badge: data.ledger.length },
          { label: t("transactionsTab"), value: "transactions", badge: data.txns.length },
          { label: t("invoicesTab"), value: "invoices", badge: data.invoices.length },
          { label: t("payrollTab"), value: "payroll", badge: payrollCount },
          { label: t("reportsTab"), value: "reports" },
        ]}
      />

      {data.error && !data.loading ? (
        <EmptyState
          icon={AlertCircle}
          title={t("errorLoad")}
          desc={t("paymentsErrorDesc")}
          action={{ label: t("tryAgain"), onClick: () => window.location.reload() }}
        />
      ) : (
        <>
          {tab === "ledger" && <LedgerTab data={data} onRecord={openRecord} />}
          {tab === "transactions" && <TransactionsTab data={data} onRecord={openRecord} />}
          {tab === "invoices" && <InvoicesTab data={data} />}
          {tab === "payroll" && (
            <PayrollTab
              data={data}
              onRecord={openRecord}
              onAddPayable={() => {
                setPayableEditing(null);
                setPayableOpen(true);
              }}
              onEditPayable={(doc) => {
                setPayableEditing(doc);
                setPayableOpen(true);
              }}
            />
          )}
          {tab === "reports" && <ReportsTab data={data} />}
        </>
      )}

      <RecordPaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        data={data}
        prefill={prefill}
        onSaved={(txn) => setReceipt(txn)}
      />
      <PayableModal
        open={payableOpen}
        onClose={() => setPayableOpen(false)}
        data={data}
        editing={payableEditing}
      />
      <ReceiptModal txn={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
