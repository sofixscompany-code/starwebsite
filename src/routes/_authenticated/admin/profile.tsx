import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Camera, Save, Loader2, Shield, Mail, Phone, Building, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/config";
import { firebaseAuth } from "@/integrations/firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ROLE_LABELS, fetchUserRole, routeForRole } from "@/hooks/use-user-role";
import type { Role } from "@/hooks/use-user-role";

export function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(null);
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [createdAt, setCreatedAt] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await firebaseAuth.getUser();
      if (!data?.user) {
        navigate("/auth");
        return;
      }
      const uid = data.user.uid;
      setEmail(data.user.email || "");
      setPhotoURL(data.user.photoURL || "");

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const d = userDoc.data();
        setFullName(d.full_name || data.user.displayName || "");
        setPhone(d.phone || "");
        setRole(d.role || "student");
        setBranch(d.branch || "");
        setStatus(d.status || "active");
        setCreatedAt(d.createdAt || "");
        if (d.photoURL) setPhotoURL(d.photoURL);
      } else {
        setFullName(data.user.displayName || "");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await firebaseAuth.getUser();
      if (!data?.user) throw new Error("Not authenticated");
      const uid = data.user.uid;

      await updateDoc(doc(db, "users", uid), {
        full_name: fullName.trim(),
        phone: phone.trim(),
        branch,
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      if (currentPassword) {
        const { error: reauthError } = await firebaseAuth.reauthenticate(currentPassword);
        if (reauthError) throw new Error("Current password is incorrect");
      }

      const { error } = await firebaseAuth.updatePassword(newPassword);
      if (error) throw error;

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--ap-blue))]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">My Profile</h1>
        <p className="text-sm text-[hsl(var(--ap-muted))]">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] overflow-hidden">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-[hsl(var(--ap-blue))] to-[hsl(var(--ap-blue-light))]" />

        {/* Avatar & Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[hsl(var(--ap-blue))]">
                    {fullName?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 sm:pb-1">
              <h2 className="text-xl font-bold text-[hsl(var(--ap-ink))]">{fullName}</h2>
              <p className="text-sm text-[hsl(var(--ap-muted))]">{email}</p>
            </div>
            <div className="flex items-center gap-4 sm:pb-1 text-xs text-[hsl(var(--ap-muted))]">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {ROLE_LABELS[role || ""] || role}
              </span>
              {branch && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {branch}
                </span>
              )}
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-6">
        <h3 className="text-lg font-bold text-[hsl(var(--ap-ink))] mb-4">Edit Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm bg-[hsl(var(--ap-surface))] text-[hsl(var(--ap-muted))]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                placeholder="9800000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Branch</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none"
              >
                <option value="Main Branch">Main Branch</option>
                <option value="Birtamod Branch">Birtamod Branch</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type="text"
                disabled
                value={ROLE_LABELS[role || ""] || role || ""}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm bg-[hsl(var(--ap-surface))] text-[hsl(var(--ap-muted))]"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--ap-blue))] text-white text-sm font-semibold hover:bg-[hsl(var(--ap-blue-light))] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-6">
        <h3 className="text-lg font-bold text-[hsl(var(--ap-ink))] mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--ap-ink))] mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={changingPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--ap-ink))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
}


