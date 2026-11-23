import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarLogo } from "@/components/site/StarLogo";
import { createUserWithEmailAndPassword, sendEmailVerification } from "@/integrations/aws/auth";
import { auth, db } from "@/integrations/aws/config";
import { doc, setDoc, collection, getDocs } from "@/integrations/aws/firestore";

// Public self-registration is for students only. Staff and parent accounts are
// issued by the institute (super admin) — they are never self-assignable here.
const ROLES = [{ value: "student", label: "Student" }];

const FALLBACK_BRANCHES = ["Main Branch"];

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    role: "student",
    branch: "Main Branch",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [branches, setBranches] = useState<string[]>(FALLBACK_BRANCHES);

  // Live branches from admin (/admin/branches → Firestore `branches`)
  useEffect(() => {
    let cancelled = false;
    getDocs(collection(db, "branches"))
      .then((snap) => {
        if (cancelled) return;
        const names = snap.docs
          .map((d) => String((d.data().name as string) || "").trim())
          .filter(Boolean);
        if (names.length) setBranches(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the select valid even if the default isn't in the live list.
  const selectedBranch = branches.includes(formData.branch)
    ? formData.branch
    : (branches[0] ?? "Main Branch");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          student_id: formData.studentId || "",
          role: formData.role,
          branch: selectedBranch,
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (docErr) {
        // Roll back the Auth account so no half-created profile is left behind.
        try {
          await user.delete();
        } catch {
          /* best effort */
        }
        throw docErr;
      }

      // Best effort — the account works even if the email fails to send.
      try {
        await sendEmailVerification(user);
      } catch {
        /* non-fatal */
      }

      setSuccess(true);
      toast.success("Account created successfully!");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setErrors({ email: "Email already registered" });
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(var(--ap-bg))]">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-8 shadow-sm">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[hsl(var(--ap-ink))] mb-2">
                Account Created!
              </h2>
              <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">
                Welcome, {formData.fullName}! You can now sign in.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/auth")}
                  className="flex-1 bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      phone: "",
                      password: "",
                      confirmPassword: "",
                      studentId: "",
                      role: "student",
                      branch: "Main Branch",
                      status: "active",
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Register Another
                </Button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--ap-bg))]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl border border-[hsl(var(--ap-border))] shadow-sm">
                <StarLogo size="lg" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">Create Account</h1>
            <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">
              Join Star Coaching Institute today
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">
                  Student ID{" "}
                  <span className="text-[hsl(var(--ap-muted))] font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="pl-10"
                    placeholder="e.g. SCI-2083-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Role</Label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Branch</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                    <select
                      value={selectedBranch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full pl-10 px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                    >
                      {branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))] text-white font-bold py-2.5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-[hsl(var(--ap-muted))] mt-4">
            Already have an account?{" "}
            <Link to="/auth" className="text-[hsl(var(--ap-blue))] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-center text-xs text-[hsl(var(--ap-muted))] mt-6">
            © {new Date().getFullYear()} Star Coaching Institute, Janakpurdham
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
