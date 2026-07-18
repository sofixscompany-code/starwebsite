import { Outlet, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/lib/api-auth';
import { ROLE_DASHBOARD_ROUTES } from '@/hooks/use-user-role';

export function AuthGuard() {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = getUserRole();

  // Redirect non-super-admin users away from /admin
  if (userRole && userRole !== 'super_admin') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      return <Navigate to={ROLE_DASHBOARD_ROUTES[userRole] || '/auth'} replace />;
    }
  }

  return <Outlet />;
}
