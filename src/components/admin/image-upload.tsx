import { useState, useRef } from "react";
import { Upload, X, Loader2, Link2 } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { storage, db } from "@/integrations/firebase/config";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

function getImageSize(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Client-side image compression → JPEG data-URL. Used as a fallback when
 * Firebase Storage isn't enabled on this project, so image fields keep
 * working (banners already use this pattern) instead of failing the form.
 */
function compressToDataUrl(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read the image"));
    };
    img.src = url;
  });
}

export function ImageUpload({ value, onChange, folder = "uploads" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
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
          () => resolve(),
        );
      });
      const url = await getDownloadURL(storageRef);
      onChange(url);
      toast.success("Image uploaded");
      try {
        const category =
          folder === "uploads" ? "Other" : folder.charAt(0).toUpperCase() + folder.slice(1);
        const dims = await getImageSize(url);
        await addDoc(collection(db, "media_library"), {
          fileName: file.name,
          fileUrl: url,
          type: file.type,
          category,
          size: file.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Media library logging is best-effort; the upload itself still succeeded.
      }
    } catch (err: unknown) {
      // Storage unavailable (not enabled / no bucket) → compress inline so the
      // form still gets a working image instead of a dead end.
      try {
        const dataUrl = await compressToDataUrl(file);
        onChange(dataUrl);
        toast.success("Image attached (stored inline) — enable Firebase Storage for full uploads");
      } catch {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(/bucket|not enabled|does not exist|storage/i.test(msg) ? "Upload failed" : msg);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith("data:image/")) {
      toast.error("Enter a valid image URL (https://… or data:image/…)");
      return;
    }
    onChange(url);
    setUrlDraft("");
    setUrlMode(false);
    toast.success("Image URL applied");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
          ) : (
            <Upload className="w-4 h-4 inline mr-1" />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
        >
          <Link2 className="w-4 h-4 inline mr-1" />
          Paste URL
        </button>
        {value && (
          <div className="relative group">
            <img src={value} alt="" className="w-10 h-10 rounded-lg object-cover border" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {urlMode && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
