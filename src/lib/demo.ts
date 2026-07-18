import type { ComponentType } from "react";
import { Shield, LayoutDashboard, Users, Wallet, MessageCircle, GraduationCap, Eye, Bell } from "lucide-react";

export type DemoRole = "super_admin" | "student" | "teacher" | "parent" | "whatsapp" | "admission" | "accountant" | "reception";

const isBrowser = typeof window !== "undefined";

function safeGetItem(key: string) {
  if (!isBrowser) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveItem(key: string) {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const DEMO_ROLES: { icon: ComponentType<{ className?: string }>; label: string; desc: string; to: string; role: DemoRole; color: string }[] = [
  { icon: Shield, label: "Super Admin", desc: "Full system access", to: "/dashboard/super-admin", role: "super_admin", color: "from-purple-600 to-purple-800" },
  { icon: Users, label: "Teacher", desc: "LMS & homework", to: "/dashboard/teacher", role: "teacher", color: "from-orange-500 to-orange-700" },
  { icon: LayoutDashboard, label: "Student", desc: "Dashboard & courses", to: "/dashboard/student", role: "student", color: "from-blue-500 to-blue-700" },
  { icon: Wallet, label: "Accountant", desc: "Fees & ledger", to: "/dashboard/accountant", role: "accountant", color: "from-indigo-500 to-indigo-700" },
  { icon: MessageCircle, label: "WhatsApp", desc: "Marketing & broadcast", to: "/admin/marketing/whatsapp", role: "whatsapp", color: "from-green-600 to-green-800" },
  { icon: GraduationCap, label: "Admission", desc: "Public admission form", to: "/admission", role: "admission", color: "from-red-500 to-red-700" },
  { icon: Eye, label: "Parent", desc: "Child progress", to: "/dashboard/student", role: "parent", color: "from-green-500 to-green-700" },
  { icon: Bell, label: "Reception", desc: "Visitors & inquiries", to: "/admin", role: "reception", color: "from-cyan-500 to-cyan-700" },
];

export function setDemoMode(role: DemoRole, redirectTo: string) {
  // Demo mode disabled — no-op to avoid stale demo sessions
  return;
}

export function clearDemoMode() {
  // No-op
  return;
}

export function getDemoRole(): DemoRole | null {
  return null;
}

export function getDemoRedirect(): string | null {
  return null;
}

export function isDemoMode(): boolean {
  return false;
}
