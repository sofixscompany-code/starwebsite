import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, Shield, GraduationCap, Users, Baby, Wallet, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StarLogo } from '@/components/site/StarLogo';
import { login, demoLogin, clearAuthData } from '@/lib/api-auth';
import { ROLE_DASHBOARD_ROUTES } from '@/hooks/use-user-role';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal';

const DEMO_ROLES = [
  { role: 'super_admin', label: 'Super Admin', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { role: 'teacher', label: 'Teacher', icon: Users, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { role: 'student', label: 'Student', icon: GraduationCap, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { role: 'parent', label: 'Parent', icon: Baby, color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { role: 'accountant', label: 'Accountant', icon: Wallet, color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
];

export function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  useEffect(() => {
    clearAuthData();
    const saved = localStorage.getItem('remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(email.trim(), password);
      if (rememberMe) localStorage.setItem('remember_email', email);
      else localStorage.removeItem('remember_email');
      toast.success(`Welcome back, ${user.name}!`);
      setTimeout(() => { window.location.href = user.dashboard; }, 300);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setDemoLoading(role);
    try {
      clearAuthData();
      const { user } = await demoLogin(role);
      toast.success(`Demo: ${user.name}`);
      setTimeout(() => { navigate(user.dashboard, { replace: true }); }, 300);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      toast.error('Please enter your email first');
      return;
    }
    setOtpEmail(email);
    setShowForgotPassword(true);
  };

  const handleOTPVerified = () => {
    setShowOTP(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--ap-bg))]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl border border-[hsl(var(--ap-border))] shadow-sm">
                <StarLogo size="lg" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">Welcome Back</h1>
            <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">Sign in to Star Coaching Institute ERP</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[hsl(var(--ap-ink))]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))] hover:text-[hsl(var(--ap-ink))]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-[hsl(var(--ap-border))] accent-[hsl(var(--ap-blue))]" />
                  <span className="text-sm text-[hsl(var(--ap-muted))]">Remember me</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-sm text-[hsl(var(--ap-blue))] hover:underline">
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))] text-white font-bold py-2.5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Quick Demo Access */}
          <div className="mt-6 bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--ap-blue)/0.08)] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[hsl(var(--ap-blue))]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(var(--ap-ink))]">Quick Demo Access</p>
                <p className="text-[11px] text-[hsl(var(--ap-muted))]">Preview each role's dashboard</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((d) => {
                const Icon = d.icon;
                const isLoading = demoLoading === d.role;
                return (
                  <button
                    key={d.role}
                    onClick={() => handleDemoLogin(d.role)}
                    disabled={demoLoading !== null}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50 ${d.color}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-[hsl(var(--ap-muted))] mt-6">
            © 2025 Star Coaching Institute, Janakpurdham
          </p>
          <p className="text-center text-[10px] text-[hsl(var(--ap-muted))] mt-1">
            Powered by <span className="font-semibold text-[hsl(var(--ap-blue))]">Sofixs</span>
          </p>
        </div>
      </main>
      <SiteFooter />

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
        email={otpEmail}
        onOTPVerified={handleOTPVerified}
      />
      <OTPVerificationModal 
        open={showOTP} 
        onClose={() => setShowOTP(false)} 
        email={otpEmail}
      />
    </div>
  );
}
