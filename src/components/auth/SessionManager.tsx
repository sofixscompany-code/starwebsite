import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '@/lib/api-auth';
import { toast } from 'sonner';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutes before timeout

interface SessionManagerProps {
  isActive: boolean;
}

export function SessionManager({ isActive }: SessionManagerProps) {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => {
        toast.warning('Session expiring in 5 minutes. Please save your work.', {
          duration: 10000,
        });
      }, SESSION_TIMEOUT - WARNING_TIMEOUT);

      timerRef.current = setTimeout(() => {
        toast.info('Session expired. Please login again.');
        clearAuthData();
        navigate('/auth', { replace: true });
      }, SESSION_TIMEOUT);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isActive, navigate]);

  return null;
}
