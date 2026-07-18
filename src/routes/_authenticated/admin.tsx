import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { getUserRole, isAuthenticated } from '@/lib/api-auth';

export function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth', { replace: true });
      return;
    }
    const role = getUserRole();
    if (role !== 'super_admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return <AdminShell />;
}
