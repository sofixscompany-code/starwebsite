import {  } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Mail, Phone, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/config";
import { firebaseAuth } from "@/integrations/firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ROLE_LABELS } from "@/hooks/use-user-role";
import type { Role } from "@/hooks/use-user-role";

type ManagedUser = {
  id: string;
  uid: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  branch: string;
  status: "active" | "inactive";
  photoURL?: string;
  createdAt: string;
};

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  branch: string;
  status: "active" | "inactive";
};

const emptyForm: FormData = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "student",
  branch: "Main Branch",
  status: "active",
};

const BRANCHES = ["Main Branch", "Birtamod Branch", "Online"];

export function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(
        snap.docs.map((d) => ({
          id: d.id,
          uid: d.data().uid || d.id,
          full_name: d.data().full_name || "",
          email: d.data().email || "",
          phone: d.data().phone || "",
          role: d.data().role || "student",
          branch: d.data().branch || "Main Branch",
          status: d.data().status || "active",
          photoURL: d.data().photoURL || "",
          createdAt: d.data().createdAt || "",
        }))
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditingId(u.id);
    setForm({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      password: "",
      role: u.role,
      branch: u.branch,
      status: u.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!editingId && !form.password) {
      toast.error("Password is required for new users");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updateData: Record<string, unknown> = {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          branch: form.branch,
          status: form.status,
        };
        await updateDoc(doc(db, "users", editingId), updateData);
        toast.success("User updated");
      } else {
        const { data: authData, error: authError } = await firebaseAuth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
              role: form.role,
              branch: form.branch,
              status: form.status,
            },
          },
        });
        if (authError) throw authError;
        if (authData?.user) {
          await updateDoc(doc(db, "users", authData.user.uid), {
            uid: authData.user.uid,
            role: form.role,
            branch: form.branch,
            status: form.status,
            phone: form.phone.trim(),
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            createdAt: new Date().toISOString(),
          });
        }
        toast.success("User created successfully");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("User deleted");
      loadUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-50 text-purple-700 border-purple-200",
    teacher: "bg-emerald-50 text-emerald-700 border-emerald-200",
    student: "bg-amber-50 text-amber-700 border-amber-200",
    parent: "bg-pink-50 text-pink-700 border-pink-200",
    accountant: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">User Management</h1>
          <p className="text-sm text-[hsl(var(--ap-muted))]">{users.length} total users</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--ap-blue))] text-white text-sm font-semibold hover:bg-[hsl(var(--ap-blue-light))] transition"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] bg-white text-sm text-[hsl(var(--ap-ink))] focus:outline-none focus:border-[hsl(var(--ap-blue))]"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] bg-white text-sm text-[hsl(var(--ap-ink))] focus:outline-none"
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--ap-blue))]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[hsl(var(--ap-muted))] text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-surface))]">
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Branch</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[hsl(var(--ap-ink))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[hsl(var(--ap-border))] last:border-0 hover:bg-[hsl(var(--ap-surface))] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--ap-blue)/0.1)] flex items-center justify-center text-xs font-bold text-[hsl(var(--ap-blue))]">
                          {u.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-[hsl(var(--ap-ink))]">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--ap-muted))]">{u.email}</td>
                    <td className="px-4 py-3 text-[hsl(var(--ap-muted))]">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${(u.role && roleColors[u.role]) || ""}`}>
                        {ROLE_LABELS[u.role as string] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--ap-muted))]">{u.branch}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-surface))] transition">
                          <Edit className="w-4 h-4 text-[hsl(var(--ap-muted))]" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)] transition">
                          <Trash2 className="w-4 h-4 text-[hsl(var(--ap-danger))]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setEditingId(null); }} />
          <div className="relative bg-white rounded-2xl border border-[hsl(var(--ap-border))] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--ap-border))]">
              <h2 className="text-lg font-bold text-[hsl(var(--ap-ink))]">
                {editingId ? "Edit User" : "Add New User"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-surface))]">
                <X className="w-5 h-5 text-[hsl(var(--ap-muted))]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                    placeholder="9800000000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">
                    Password {!editingId && "*"}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                    placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Role *</label>
                  <select
                    value={form.role || "student"}
                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-4 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm font-medium text-[hsl(var(--ap-muted))] hover:bg-[hsl(var(--ap-surface))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--ap-blue))] text-white text-sm font-semibold hover:bg-[hsl(var(--ap-blue-light))] disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


