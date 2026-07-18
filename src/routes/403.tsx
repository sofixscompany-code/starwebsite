import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '@/lib/api-auth';
import { Button } from '@/components/ui/button';

export function AccessDeniedPage() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearAuthData();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--ap-bg))] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--ap-danger)/0.1)] mx-auto flex items-center justify-center mb-6">
          <ShieldOff className="w-10 h-10 text-[hsl(var(--ap-danger))]" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--ap-ink))] mb-2">Access Denied</h1>
        <p className="text-[hsl(var(--ap-muted))] mb-8">
          You don't have permission to access this page. Contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button onClick={handleSignOut} className="bg-[hsl(var(--ap-danger))] hover:bg-[hsl(var(--ap-danger)/0.9)] gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
