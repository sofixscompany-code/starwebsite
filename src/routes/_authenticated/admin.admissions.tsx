import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar } from "@/components/admin/ui";
import { ClipboardList, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/admissions")({
  component: AdmissionsPage,
});

function AdmissionsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-admissions"],
    queryFn: async () => {
      const { data } = await supabase.from("admissions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("admissions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-admissions"] });
  };

  const stats = {
    total: data.length,
    pending: data.filter((a) => a.status === "pending").length,
    approved: data.filter((a) => a.status === "approved").length,
    rejected: data.filter((a) => a.status === "rejected").length,
  };

  return (
    <div>
      <PageHeader
        title="Admissions"
        subtitle="Review, approve, and manage all applications."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn">+ New Admission</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} icon={ClipboardList} tone="purple" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="danger" />
      </div>

      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input placeholder="Search admission #, name, phone…" className="ap-input pl-9" />
        </div>
        <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
        <select className="ap-input max-w-[160px]">
          <option>All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
      </Toolbar>

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : data.length === 0 ? (
        <Panel><p className="text-center py-6 text-[hsl(var(--ap-muted))]">No applications yet.</p></Panel>
      ) : (
        <DataTable
          rows={data}
          columns={[
            { key: "admission_number", label: "Admission #", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-purple))]">{r.admission_number}</span> },
            { key: "full_name", label: "Name", render: (r) => <span className="font-semibold">{r.full_name}</span> },
            { key: "course_title", label: "Course" },
            { key: "phone", label: "Phone" },
            {
              key: "status", label: "Status",
              render: (r) => <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}>{r.status}</Badge>,
            },
          ]}
          actions={(r) => (
            <select
              value={r.status}
              onChange={(e) => updateStatus(r.id, e.target.value)}
              className="ap-input !py-1 text-xs w-32"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        />
      )}
    </div>
  );
}
