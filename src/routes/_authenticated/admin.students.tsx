import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap, TrendingUp, UserPlus, Download, Search, Filter, MoreVertical,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: StudentsPage,
});

const DUMMY = [
  { id: "1", roll: "SCI-2024-001", name: "Aarav Sharma", course: "Nepal Police", batch: "B-12", attend: 94, fee: "Paid", phone: "9812345678", status: "Active" },
  { id: "2", roll: "SCI-2024-002", name: "Priya Karki", course: "Loksewa Officer", batch: "L-04", attend: 88, fee: "Partial", phone: "9803344556", status: "Active" },
  { id: "3", roll: "SCI-2024-003", name: "Rohan Thapa", course: "APF Constable", batch: "A-08", attend: 76, fee: "Paid", phone: "9861122334", status: "Active" },
  { id: "4", roll: "SCI-2024-004", name: "Sita Rana", course: "Bank PO", batch: "BK-02", attend: 91, fee: "Pending", phone: "9840001111", status: "Active" },
  { id: "5", roll: "SCI-2024-005", name: "Bikash Gurung", course: "Nepal Army", batch: "N-05", attend: 82, fee: "Paid", phone: "9855667788", status: "Active" },
  { id: "6", roll: "SCI-2024-006", name: "Anisha Magar", course: "Loksewa Section Officer", batch: "L-04", attend: 96, fee: "Paid", phone: "9800112233", status: "Active" },
  { id: "7", roll: "SCI-2024-007", name: "Suman Poudel", course: "Nepal Police", batch: "B-12", attend: 71, fee: "Pending", phone: "9866778899", status: "Warning" },
  { id: "8", roll: "SCI-2024-008", name: "Nisha Basnet", course: "Bank Assistant", batch: "BK-03", attend: 89, fee: "Paid", phone: "9877665544", status: "Active" },
  { id: "9", roll: "SCI-2024-009", name: "Krishna Adhikari", course: "APF Officer", batch: "A-09", attend: 93, fee: "Paid", phone: "9812344567", status: "Active" },
  { id: "10", roll: "SCI-2024-010", name: "Manisha Shrestha", course: "Nepal Army", batch: "N-05", attend: 85, fee: "Partial", phone: "9823456780", status: "Active" },
];

function StudentsPage() {
  const [q, setQ] = useState("");
  const filtered = DUMMY.filter(
    (s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.roll.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="1,284 enrolled across 24 courses and 5 branches."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><UserPlus className="w-4 h-4" /> Enroll student</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={1284} delta={12} icon={GraduationCap} tone="purple" />
        <StatCard label="Active this month" value={1198} delta={4} icon={TrendingUp} tone="success" />
        <StatCard label="New (30d)" value={86} delta={22} icon={UserPlus} tone="orange" />
        <StatCard label="At risk" value={42} delta={-3} icon={GraduationCap} tone="danger" />
      </div>

      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or roll #" className="ap-input pl-9" />
        </div>
        <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
        <select className="ap-input max-w-[180px]"><option>All courses</option><option>Nepal Police</option><option>Loksewa</option><option>Bank PO</option></select>
        <select className="ap-input max-w-[160px]"><option>All batches</option><option>B-12</option><option>L-04</option></select>
      </Toolbar>

      <DataTable
        rows={filtered}
        columns={[
          {
            key: "name", label: "Student",
            render: (r) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full ap-grad flex items-center justify-center text-white text-xs font-bold">
                  {r.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))] font-mono">{r.roll}</p>
                </div>
              </div>
            ),
          },
          { key: "course", label: "Course" },
          { key: "batch", label: "Batch", render: (r) => <Badge tone="info">{r.batch}</Badge> },
          {
            key: "attend", label: "Attendance",
            render: (r) => (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--ap-border))]">
                  <div
                    className="h-1.5 rounded-full ap-grad"
                    style={{ width: `${r.attend}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{r.attend}%</span>
              </div>
            ),
          },
          {
            key: "fee", label: "Fee",
            render: (r) => <Badge tone={r.fee === "Paid" ? "success" : r.fee === "Partial" ? "warning" : "danger"}>{r.fee}</Badge>,
          },
          { key: "phone", label: "Phone", className: "font-mono text-xs" },
          {
            key: "status", label: "Status",
            render: (r) => <Badge tone={r.status === "Warning" ? "warning" : "success"}>{r.status}</Badge>,
          },
        ]}
        actions={() => (
          <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><MoreVertical className="w-4 h-4" /></button>
        )}
      />
    </div>
  );
}
