import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Mail, Phone, Building, Camera, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarLogo } from "@/components/site/StarLogo";
import { firebaseAuth } from "@/integrations/firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { updateProfile } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { ChangePassword } from "@/components/auth/ChangePassword";

/** Read an image file and return a square, compressed JPEG data URL. */
function resizeToAvatarDataUrl(file: File, size = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        // Center-crop to a square before scaling
        const min = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - min) / 2,
          (img.height - min) / 2,
          min,
          min,
          0,
          0,
          size,
          size,
        );
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    branch: "",
    photoURL: "",
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Firebase restores persisted sessions asynchronously — wait for it so a
      // hard reload doesn't bounce an already-signed-in user to /auth.
      try {
        await auth.authStateReady();
      } catch {
        /* ignore — proceed with whatever is available */
      }
      if (!cancelled) await loadProfile();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await firebaseAuth.getUser();
      const uid = data?.user?.uid;
      if (!uid) {
        // Demo / localStorage-only sessions have no Firebase user object.
        let local: { email?: string; name?: string; full_name?: string } | null = null;
        try {
          local = JSON.parse(localStorage.getItem("auth_user") || "null");
        } catch {
          local = null;
        }
        if (!local?.email && !local?.name && !local?.full_name) {
          navigate("/auth");
          return;
        }
        setProfile((prev) => ({
          ...prev,
          email: local?.email || prev.email,
          fullName: local?.full_name || local?.name || prev.fullName,
        }));
        return;
      }
      setProfile((prev) => ({
        ...prev,
        email: data.user?.email || "",
        photoURL: data.user?.photoURL || "",
      }));

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          fullName: userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "",
          branch: userData.branch || "",
          photoURL: userData.photoURL || "",
        });
      }
    } catch {
      toast.error("Failed to load profile");
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

      // merge:true creates the doc if it's somehow missing (no silent failure)
      await setDoc(
        doc(db, "users", uid),
        {
          full_name: profile.fullName,
          phone: profile.phone,
          branch: profile.branch,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: profile.fullName });
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await resizeToAvatarDataUrl(file);
      const { data } = await firebaseAuth.getUser();
      const uid = data?.user?.uid;
      if (!uid) throw new Error("Not signed in");
      await setDoc(
        doc(db, "users", uid),
        { photoURL: dataUrl, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: dataUrl });
        } catch {
          /* Firestore copy already saved — Auth profile is best effort */
        }
      }
      setProfile((prev) => ({ ...prev, photoURL: dataUrl }));
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Could not update the photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
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
                    <img
                      src={profile.photoURL}
                      alt={profile.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-[hsl(var(--ap-blue))]" />
                  )}
                </div>
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  title="Change photo"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[hsl(var(--ap-blue))] rounded-full flex items-center justify-center text-white disabled:opacity-60"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoFile}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--ap-ink))]">{profile.fullName}</h1>
                <p className="text-sm text-[hsl(var(--ap-muted))] capitalize">
                  {profile.role.replace("_", " ")} · {profile.branch}
                </p>
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
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[hsl(var(--ap-blue))] hover:bg-[hsl(var(--ap-blue-light))]"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowChangePassword(true)}
                  variant="outline"
                  className="flex-1"
                >
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
