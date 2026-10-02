import { ModulePage } from "@/components/admin/ModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { toast } from "sonner";
import { KeyRound, CheckCircle2, XCircle, Copy } from "lucide-react";

/** Generate a cryptographically random API key client-side. */
function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(4));
  return `sci_${Array.from(bytes, (n) => n.toString(36)).join("")}`;
}

export function ApiKeysPage() {
  const { rows, create, update, remove, bulkDelete, bulkUpdate } = useModuleData("api_keys");

  const total = rows.length;
  const active = rows.filter((r) => String(r.status ?? "") === "Active").length;
  const revoked = rows.filter((r) => {
    const s = String(r.status ?? "");
    return s === "Revoked" || s === "Inactive";
  }).length;

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Could not copy the API key");
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    const requestedStatus = typeof data.status === "string" && data.status ? data.status : "Active";
    // `create` from useModuleData persists to Firestore (addDoc) and stamps createdAt.
    await create({ ...data, key: generateApiKey(), status: requestedStatus });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Revoked" : "Active";
    try {
      await update(id, { status: nextStatus });
      toast.success(`Key ${nextStatus === "Active" ? "reactivated" : "revoked"}`);
    } catch {
      toast.error("Could not update key status");
    }
  };

  return (
    <ModulePage
      title="API Keys"
      subtitle="Manage API keys for external integrations"
      stats={[
        { label: "Total Keys", value: total, icon: KeyRound, tone: "purple" },
        { label: "Active", value: active, icon: CheckCircle2, tone: "success" },
        { label: "Revoked / Inactive", value: revoked, icon: XCircle, tone: "danger" },
      ]}
      columns={[
        { key: "name", label: "Key Name" },
        { key: "service", label: "Service" },
        {
          key: "key",
          label: "API Key",
          render: (row: any) => {
            const key = typeof row.key === "string" ? row.key : "";
            if (!key) return <span className="text-gray-400">—</span>;
            return (
              <span className="inline-flex items-center gap-2">
                <code className="font-mono text-xs">{`${key.slice(0, 10)}…`}</code>
                <button
                  type="button"
                  onClick={() => copyKey(key)}
                  title="Copy API key"
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </span>
            );
          },
        },
        {
          key: "status",
          label: "Status",
          render: (row: any) => {
            const status = String(row.status ?? "Active");
            const nextStatus = status === "Active" ? "Revoked" : "Active";
            const isActive = status === "Active";
            return (
              <button
                type="button"
                onClick={() => toggleStatus(String(row.id), status)}
                title={`Set status to ${nextStatus}`}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition ${
                  isActive
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                }`}
              >
                {status}
              </button>
            );
          },
        },
        { key: "lastUsed", label: "Last Used" },
      ]}
      rows={rows}
      fields={[
        { key: "name", label: "Key Name", type: "text", required: true },
        { key: "service", label: "Service", type: "text", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
            { value: "Revoked", label: "Revoked" },
          ],
        },
      ]}
      onCreate={handleCreate}
      onUpdate={async (id, data) => update(id, data)}
      onDelete={remove}
      onBulkDelete={bulkDelete}
      onBulkUpdate={bulkUpdate}
    />
  );
}
