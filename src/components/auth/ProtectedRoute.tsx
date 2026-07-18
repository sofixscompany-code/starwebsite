import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/lib/api-auth';
import { ROLE_DASHBOARD_ROUTES } from '@/hooks/use-user-role';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setRedirect('/auth');
        setChecking(false);
        return;
      }

      const userRole = getUserRole();
      
      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        setRedirect('/403');
        setChecking(false);
        return;
      }

      // Role-based redirect: if user tries to access wrong dashboard
      if (userRole && ROLE_DASHBOARD_ROUTES[userRole]) {
        const expectedPath = ROLE_DASHBOARD_ROUTES[userRole];
        const currentPath = location.pathname;
        
        if (currentPath.startsWith('/dashboard/') && currentPath !== expectedPath && !currentPath.startsWith('/admin')) {
          setRedirect(expectedPath);
          setChecking(false);
          return;
        }
      }

      setAuthorized(true);
      setChecking(false);
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--ap-bg))]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--ap-blue))]" />
          <p className="text-sm text-[hsl(var(--ap-muted))]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return authorized ? <Outlet /> : null;
}
