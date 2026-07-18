import {  } from "react-router-dom";
import { useState } from "react";
import {
  UserCog, Users, Sparkles, ShieldCheck, Download, Search, Filter, Plus,
  Eye, Edit, Trash2, Check, X, Key,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Modal } from "@/components/admin/ui";

const ROLES = [
  { id: "1", role: "Super Admin", users: 2, perms: "All", scope: "Global", updated: "2024-08-01", status: "System", description: "Full system access with all permissions" },
  { id: "2", role: "Teacher", users: 68, perms: "LMS, Homework", scope: "Course", updated: "2024-09-10", status: "System", description: "Teaching, assignments, and student management" },
  { id: "3", role: "Accountant", users: 6, perms: "Fees, Payroll", scope: "Branch", updated: "2024-09-15", status: "System", description: "Financial operations and reporting" },
  { id: "4", role: "Student", users: 240, perms: "Courses, Attendance", scope: "Student", updated: "2024-09-20", status: "System", description: "Course access, assignments, and grades" },
  { id: "5", role: "Parent", users: 180, perms: "View Only", scope: "Parent", updated: "2024-09-25", status: "System", description: "Track child progress, attendance, and fees" },
];

const PERMISSIONS = [
  { module: "Dashboard", view: true, create: true, edit: true, delete: true },
  { module: "Admissions", view: true, create: true, edit: true, delete: false },
  { module: "Students", view: true, create: true, edit: true, delete: false },
  { module: "Teachers", view: true, create: true, edit: true, delete: false },
  { module: "Parents", view: true, create: true, edit: true, delete: false },
  { module: "Accounting", view: true, create: true, edit: true, delete: false },
  { module: "Courses", view: true, create: true, edit: true, delete: true },
  { module: "LMS", view: true, create: true, edit: true, delete: false },
  { module: "Examinations", view: true, create: true, edit: true, delete: true },
  { module: "Attendance", view: true, create: true, edit: true, delete: false },
  { module: "Reports", view: true, create: false, edit: false, delete: false },
  { module: "Settings", view: true, create: false, edit: true, delete: false },
];

export function RolesPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = ROLES.filter(
    (r) => !q || r.role.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Role-based access control with granular permissions."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Create Role</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Roles" value={12} icon={UserCog} tone="purple" />
        <StatCard label="Total Users" value={148} icon={Users} tone="info" />
        <StatCard label="Custom Roles" value={4} icon={Sparkles} tone="orange" />
        <StatCard label="System Roles" value={8} icon={ShieldCheck} tone="success" />
      </div>

      <Tabs
        tabs={[
          { label: "Roles", value: "roles" },
          { label: "Permissions", value: "permissions" },
          { label: "Users", value: "users" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "roles" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles..." className="ap-input pl-9" />
              </div>
              <div className="flex gap-1 p-1 bg-[hsl(var(--ap-border)/0.3)] rounded-xl">
                {["All", "System", "Custom"].map((t) => (
                  <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${t === "All" ? "ap-grad text-white" : "text-[hsl(var(--ap-muted))] hover:text-[hsl(var(--ap-ink))]"}`}>{t}</button>
                ))}
              </div>
            </Toolbar>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="ap-card p-5 hover:shadow-lg transition cursor-pointer group"
                  onClick={() => setSelectedRole(r)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <Badge tone={r.status === "System" ? "purple" : "orange"}>{r.status}</Badge>
                  </div>
                  <h3 className="font-bold">{r.role}</h3>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">{r.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--ap-border))] text-xs">
                    <span className="text-[hsl(var(--ap-muted))]">{r.users} users</span>
                    <span className="text-[hsl(var(--ap-muted))]">{r.scope}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "permissions" && (
          <Panel title="Permission Matrix" subtitle="Super Admin role permissions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--ap-border))]">
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">Module</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">View</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">Create</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">Edit</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((p) => (
                    <tr key={p.module} className="border-b border-[hsl(var(--ap-border))] hover:bg-[hsl(var(--ap-purple)/0.04)]">
                      <td className="py-2.5 px-4 font-semibold">{p.module}</td>
                      <td className="text-center py-2.5 px-4">{p.view ? <Check className="w-4 h-4 text-[hsl(var(--ap-success))] mx-auto" /> : <X className="w-4 h-4 text-[hsl(var(--ap-danger))] mx-auto" />}</td>
                      <td className="text-center py-2.5 px-4">{p.create ? <Check className="w-4 h-4 text-[hsl(var(--ap-success))] mx-auto" /> : <X className="w-4 h-4 text-[hsl(var(--ap-danger))] mx-auto" />}</td>
                      <td className="text-center py-2.5 px-4">{p.edit ? <Check className="w-4 h-4 text-[hsl(var(--ap-success))] mx-auto" /> : <X className="w-4 h-4 text-[hsl(var(--ap-danger))] mx-auto" />}</td>
                      <td className="text-center py-2.5 px-4">{p.delete ? <Check className="w-4 h-4 text-[hsl(var(--ap-success))] mx-auto" /> : <X className="w-4 h-4 text-[hsl(var(--ap-danger))] mx-auto" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {activeTab === "users" && (
          <Panel title="User Assignments" subtitle="Users assigned to roles">
            <DataTable
              rows={[
                { id: "1", name: "Super Admin", email: "admin@star.edu", role: "Super Admin", lastLogin: "Today", status: "Active" },
                { id: "2", name: "Ram K.C.", email: "ram.kc@star.edu", role: "Teacher", lastLogin: "2h ago", status: "Active" },
                { id: "3", name: "Accountant", email: "accounts@star.edu", role: "Accountant", lastLogin: "1d ago", status: "Active" },
                { id: "4", name: "Student Demo", email: "demo_student@sofixs.com", role: "Student", lastLogin: "3d ago", status: "Active" },
                { id: "5", name: "Parent Demo", email: "demo_parent@sofixs.com", role: "Parent", lastLogin: "1w ago", status: "Active" },
              ]}
              columns={[
                { key: "name", label: "User", render: (r) => <span className="font-bold">{r.name}</span> },
                { key: "email", label: "Email", className: "font-mono text-xs" },
                { key: "role", label: "Role", render: (r) => <Badge tone="purple">{r.role}</Badge> },
                { key: "lastLogin", label: "Last Login" },
                { key: "status", label: "Status", render: () => <Badge tone="success">Active</Badge> },
              ]}
              actions={() => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Key className="w-3.5 h-3.5" /></button>
                </div>
              )}
            />
          </Panel>
        )}
      </div>

      {/* Role Detail Modal */}
      <Modal open={!!selectedRole} onClose={() => setSelectedRole(null)} size="lg">
        {selectedRole && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl ap-grad flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">{selectedRole.role}</h2>
                <p className="text-sm text-[hsl(var(--ap-muted))]">{selectedRole.description}</p>
                <div className="flex gap-2 mt-1">
                  <Badge tone={selectedRole.status === "System" ? "purple" : "orange"}>{selectedRole.status}</Badge>
                  <Badge tone="info">{selectedRole.scope}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="ap-card p-3 text-center">
                <p className="text-2xl font-black text-[hsl(var(--ap-purple))]">{selectedRole.users}</p>
                <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Users</p>
              </div>
              <div className="ap-card p-3 text-center">
                <p className="text-2xl font-black text-[hsl(var(--ap-success))]">{selectedRole.perms}</p>
                <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Permissions</p>
              </div>
              <div className="ap-card p-3 text-center">
                <p className="text-2xl font-black text-[hsl(var(--ap-orange))]">{selectedRole.updated}</p>
                <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Updated</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Role Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">Create New Role</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Define a custom role with specific permissions.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Role Name</span>
            <input placeholder="e.g., Marketing Manager" className="ap-input mt-1" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Description</span>
            <textarea placeholder="Describe the role responsibilities..." rows={2} className="ap-input mt-1" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Scope</span>
            <select className="ap-input mt-1"><option>Global</option><option>Branch</option><option>Course</option></select>
          </label>
          <Panel title="Permissions">
            <div className="space-y-2">
              {PERMISSIONS.map((p) => (
                <div key={p.module} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.3)]">
                  <span className="text-sm font-semibold">{p.module}</span>
                  <div className="flex gap-3">
                    {["View", "Create", "Edit", "Delete"].map((perm) => (
                      <label key={perm} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-[hsl(var(--ap-purple))]" />
                        <span>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">Cancel</button>
          <button className="ap-btn"><Plus className="w-4 h-4" /> Create Role</button>
        </div>
      </Modal>
    </div>
  );
}


