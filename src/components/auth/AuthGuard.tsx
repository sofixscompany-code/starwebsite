import { Outlet, Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/api-auth';

export function AuthGuard() {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
