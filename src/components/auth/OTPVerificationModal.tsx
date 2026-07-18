import { useState, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OTPVerificationModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function OTPVerificationModal({ open, onClose, email }: OTPVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP verified successfully!');
      onClose();
    } catch {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // Simulate resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP resent successfully!');
      setCountdown(60);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[hsl(var(--ap-ink))] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--ap-blue))]" />
            Verify OTP
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-[hsl(var(--ap-muted))]">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </div>

          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold"
              />
            ))}
          </div>

          <Button onClick={handleVerify} disabled={loading} className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
          </Button>

          <div className="text-center text-sm">
            {countdown > 0 ? (
              <span className="text-[hsl(var(--ap-muted))]">Resend OTP in {countdown}s</span>
            ) : (
              <button 
                onClick={handleResend} 
                disabled={resendLoading}
                className="text-[hsl(var(--ap-blue))] hover:underline disabled:opacity-50"
              >
                {resendLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
