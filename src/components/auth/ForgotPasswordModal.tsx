import { useState } from 'react';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onOTPVerified: () => void;
}

export function ForgotPasswordModal({ open, onClose, email, onOTPVerified }: ForgotPasswordModalProps) {
  const [resetEmail, setResetEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[hsl(var(--ap-ink))]">
            {sent ? 'Check Your Email' : 'Forgot Password?'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!sent ? (
            <>
              <div className="text-sm text-[hsl(var(--ap-muted))]">
                Enter your email address and we'll send you a link to reset your password.
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type="email" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    className="pl-10" 
                    placeholder="you@example.com" 
                  />
                </div>
              </div>
              <Button onClick={handleSendReset} disabled={loading} className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-[hsl(var(--ap-muted))]">
                We've sent a password reset link to <strong>{resetEmail}</strong>. Please check your inbox and follow the instructions.
              </div>
              <Button onClick={() => { setSent(false); onClose(); }} className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
