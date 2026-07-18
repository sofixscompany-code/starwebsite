import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserRole } from '@/lib/api-auth';
import { ROLE_DASHBOARD_ROUTES } from '@/hooks/use-user-role';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    const route = role && ROLE_DASHBOARD_ROUTES[role] ? ROLE_DASHBOARD_ROUTES[role] : ROLE_DASHBOARD_ROUTES.super_admin;
    navigate(route, { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
      </motion.div>
    </div>
  );
}
