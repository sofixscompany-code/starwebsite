import { useRef, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import { pickAndUploadFile } from "./prep-shared";

/** Labeled form row — same shape as the admission-pricing module. */
export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/** isActive → green "सक्रिय" / gray "लुकेको". */
export function ActiveChip({ isActive }: { isActive: boolean }) {
  return <Badge tone={isActive ? "success" : "muted"}>{isActive ? "सक्रिय" : "लुकेको"}</Badge>;
}

/** isPublished → green "प्रकाशित" / gray "ड्राफ्ट". */
export function PublishedChip({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge tone={isPublished ? "success" : "muted"}>{isPublished ? "प्रकाशित" : "ड्राफ्ट"}</Badge>
  );
}

/**
 * URL text input + फाइल अपलोड button (hidden file picker).
 * Storage failures fall back to toast + manual URL paste.
 */
export function FileUrlField({
  label,
  required,
  hint,
  value,
  onChange,
  folder,
  accept,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** Storage sub-folder, e.g. "notes" / "model-sets" */
  folder: string;
  accept?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField label={label} required={required} hint={hint}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="ap-input w-full"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="ap-btn-secondary shrink-0"
          title="फाइल अपलोड गर्नुहोस्"
        >
          <Upload className="w-4 h-4" /> फाइल अपलोड
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void pickAndUploadFile(folder, file, onChange);
          e.target.value = "";
        }}
      />
    </FormField>
  );
}
