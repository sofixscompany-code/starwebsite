import { useState } from 'react';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePassword({ open, onClose }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (newPassword === currentPassword) newErrors.newPassword = 'New password must be different';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        toast.error('No user logged in');
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      setSuccess(true);
      toast.success('Password updated successfully!');
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strengthLabel = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const strengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[hsl(var(--ap-ink))] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[hsl(var(--ap-blue))]" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--ap-ink))]">Password Updated!</h3>
              <p className="text-sm text-[hsl(var(--ap-muted))] mt-2">Your password has been changed successfully.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type={showCurrent ? 'text' : 'password'} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    className={`pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`} 
                    placeholder="Enter current password" 
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.currentPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type={showNew ? 'text' : 'password'} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`} 
                    placeholder="Enter new password" 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor(passwordStrength(newPassword))} transition-all`} style={{ width: `${(passwordStrength(newPassword) / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-[hsl(var(--ap-muted))]">{strengthLabel(passwordStrength(newPassword))}</span>
                  </div>
                )}
                {errors.newPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.newPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type={showConfirm ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} 
                    placeholder="Confirm new password" 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              </div>

              <Button onClick={handleChange} disabled={loading} className="w-full bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
