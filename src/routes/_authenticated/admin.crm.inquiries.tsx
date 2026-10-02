import { useState } from "react";
import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Modal } from "@/components/admin/ui";
import { useModuleData, type ModuleRecord } from "@/hooks/use-module-data";
import { Phone, Clock, CheckCircle2, Mail, MessageSquare, ExternalLink } from "lucide-react";

const formatDate = (v: unknown) => {
  if (!v) return "—";
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
};

export function InquiriesPage() {
  const { rows: inquiries } = useModuleData("inquiries");
  const [detail, setDetail] = useState<ModuleRecord | null>(null);

  const count = (statuses: string[]) =>
    inquiries.filter((r) => statuses.includes(String(r.status || "").toLowerCase())).length;

  const stats = [
    { label: "Total Inquiries", value: inquiries.length, icon: Phone, tone: "purple" },
    {
      label: "New / Pending",
      value: count(["new", "pending"]),
      icon: Clock,
      tone: "warning",
    },
    { label: "Contacted", value: count(["contacted"]), icon: MessageSquare, tone: "info" },
    { label: "Converted", value: count(["converted"]), icon: CheckCircle2, tone: "success" },
  ];

  const phone = String(detail?.phone ?? "").replace(/[^\d+]/g, "");
  const waLink = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "";

  return (
    <div className="space-y-4">
      <FirestoreModulePage
        collectionName="inquiries"
        title="Inquiries"
        subtitle="Track and respond to prospective student inquiries — open an inquiry to read the full message and contact them"
        stats={stats}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          {
            key: "parentName",
            label: "Parent",
            render: (row) => {
              const pName = String(row.parentName ?? "");
              const pPhone = String(row.parentPhone ?? "");
              if (!pName && !pPhone) return <span>—</span>;
              return (
                <span className="block max-w-[160px] truncate text-[hsl(var(--ap-muted))]">
                  {[pName, pPhone].filter(Boolean).join(" · ")}
                </span>
              );
            },
          },
          {
            key: "message",
            label: "Message",
            render: (row) => (
              <span className="block max-w-[260px] truncate text-[hsl(var(--ap-muted))]">
                {row.message ? String(row.message) : "—"}
              </span>
            ),
          },
          { key: "course", label: "Course" },
          { key: "source", label: "Source" },
          { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
          { key: "status", label: "Status" },
          {
            key: "_details",
            label: "Details",
            render: (row) => (
              <button
                className="ap-btn-ghost text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetail(row);
                }}
              >
                View
              </button>
            ),
          },
        ]}
        fields={[
          { key: "name", label: "Name", type: "text", required: true, placeholder: "Full name" },
          { key: "email", label: "Email", type: "email", placeholder: "name@example.com" },
          { key: "phone", label: "Phone", type: "tel", placeholder: "9800000000" },
          {
            key: "parentName",
            label: "Parent Name",
            type: "text",
            placeholder: "Parent / guardian full name",
          },
          {
            key: "parentPhone",
            label: "Parent Phone",
            type: "tel",
            placeholder: "9800000000",
          },
          {
            key: "province",
            label: "Province",
            type: "text",
            placeholder: "e.g. Madhesh Province",
          },
          { key: "district", label: "District", type: "text", placeholder: "e.g. Dhanusha" },
          {
            key: "municipality",
            label: "Municipality",
            type: "text",
            placeholder: "e.g. Janakpurdham",
          },
          { key: "ward", label: "Ward", type: "text", placeholder: "e.g. Ward 7" },
          { key: "message", label: "Message", type: "textarea", placeholder: "What did they ask?" },
          { key: "course", label: "Course Interest", type: "text", placeholder: "JEE Advanced" },
          {
            key: "source",
            label: "Source",
            type: "select",
            options: [
              { value: "Website", label: "Website" },
              { value: "Referral", label: "Referral" },
              { value: "Walk-in", label: "Walk-in" },
              { value: "Social Media", label: "Social Media" },
              { value: "Other", label: "Other" },
            ],
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "New", label: "New" },
              { value: "Contacted", label: "Contacted" },
              { value: "Pending", label: "Pending" },
              { value: "Converted", label: "Converted" },
            ],
          },
        ]}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Inquiry details" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Name
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {String(detail.name || "—")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Status
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {String(detail.status || "—")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white break-all">
                  {String(detail.email || "—")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-white">{String(detail.phone || "—")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Parent Name
                </p>
                <p className="text-gray-900 dark:text-white">{String(detail.parentName || "—")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Parent Phone
                </p>
                <p className="text-gray-900 dark:text-white">{String(detail.parentPhone || "—")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Address
                </p>
                <p className="text-gray-900 dark:text-white">
                  {[
                    detail.province,
                    detail.district,
                    detail.municipality,
                    detail.ward ? `Ward ${String(detail.ward).replace(/^Ward\s+/i, "")}` : "",
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Course
                </p>
                <p className="text-gray-900 dark:text-white">{String(detail.course || "—")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Date
                </p>
                <p className="text-gray-900 dark:text-white">{formatDate(detail.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Message
              </p>
              <div className="rounded-xl border border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-surface))] p-3 text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200 max-h-64 overflow-y-auto">
                {String(detail.message || "No message provided.")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-[hsl(var(--ap-border))]">
              {detail.email ? (
                <a href={`mailto:${String(detail.email)}`} className="ap-btn">
                  <Mail className="w-4 h-4" /> Reply by email
                </a>
              ) : null}
              {detail.phone ? (
                <a href={`tel:${phone}`} className="ap-btn-ghost">
                  <Phone className="w-4 h-4" /> Call
                </a>
              ) : null}
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="ap-btn-ghost">
                  <ExternalLink className="w-4 h-4" /> WhatsApp
                </a>
              ) : null}
              <button className="ap-btn-ghost ml-auto" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
