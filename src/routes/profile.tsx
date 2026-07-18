import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, Building, Camera, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StarLogo } from '@/components/site/StarLogo';
import { firebaseAuth } from '@/integrations/firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { ChangePassword } from '@/components/auth/ChangePassword';

export function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    branch: '',
    photoURL: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await firebaseAuth.getUser();
      if (!data?.user) {
        navigate('/auth');
        return;
      }
      const uid = data.user.uid;
      setProfile(prev => ({ ...prev, email: data.user?.email || '', photoURL: data.user?.photoURL || '' }));

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          fullName: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || '',
          branch: userData.branch || '',
          photoURL: userData.photoURL || '',
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await firebaseAuth.getUser();
      if (!data?.user) return;
      const uid = data.user.uid;

      await updateDoc(doc(db, 'users', uid), {
        full_name: profile.fullName,
        phone: profile.phone,
        branch: profile.branch,
        updatedAt: new Date().toISOString(),
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: profile.fullName });
      }

      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    toast.info('Photo upload feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--ap-bg))]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--ap-blue))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--ap-bg))]">
      <SiteHeader />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-[hsl(var(--ap-border))] p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--ap-blue)/0.1)] flex items-center justify-center">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt={profile.fullName} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[hsl(var(--ap-blue))]" />
                  )}
                </div>
                <button onClick={handlePhotoUpload} className="absolute bottom-0 right-0 w-6 h-6 bg-[hsl(var(--ap-blue))] rounded-full flex items-center justify-center text-white">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">{profile.fullName}</h1>
                <p className="text-sm text-[hsl(var(--ap-muted))] capitalize">{profile.role.replace('_', ' ')} · {profile.branch}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type="text" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                    className="pl-10" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input type="email" value={profile.email} disabled className="pl-10 bg-gray-50" />
                </div>
                <p className="text-xs text-[hsl(var(--ap-muted))]">Email cannot be changed</p>
              </div>

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type="tel" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                    className="pl-10" 
                    placeholder="+977 98XXXXXXXX" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Branch</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--ap-muted))]" />
                  <Input 
                    type="text" 
                    value={profile.branch} 
                    onChange={(e) => setProfile({ ...profile, branch: e.target.value })} 
                    className="pl-10" 
                    placeholder="Main Branch" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
                <Button onClick={() => setShowChangePassword(true)} variant="outline" className="flex-1">
                  <Lock className="w-4 h-4 mr-2" /> Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />

      <ChangePassword open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
