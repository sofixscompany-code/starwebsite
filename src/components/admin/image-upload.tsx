import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/integrations/firebase/config";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, folder = "uploads" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    setUploading(true);
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => {},
          reject,
          () => resolve()
        );
      });
      const url = await getDownloadURL(storageRef);
      onChange(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Upload className="w-4 h-4 inline mr-1" />}
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {value && (
        <div className="relative group">
          <img src={value} alt="" className="w-10 h-10 rounded-lg object-cover border" />
          <button type="button" onClick={() => onChange("")} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
