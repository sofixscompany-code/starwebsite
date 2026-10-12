import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Eraser, Check, PenLine, Trash2, Upload, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
 * Blue-tick selectable control (checkbox/radio semantics,
 * square printed look) — spec §5/§16/§17: actual selectable
 * controls with a BLUE tick, never pills/toggles.
 * ──────────────────────────────────────────────────────────── */
export function BlueCheck({
  type = "checkbox",
  name,
  checked,
  onChange,
  label,
  disabled,
  error,
  ariaLabel,
}: {
  type?: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  error?: boolean;
  ariaLabel?: string;
}) {
  return (
    <label
      className={cn("sci-check", disabled && "sci-check-auto")}
      title={disabled ? "Set automatically from your municipality selection" : undefined}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sci-tick"
      />
      {label !== undefined && <span className="sci-check-label">{label}</span>}
      {error && <span className="sci-field-error">!</span>}
    </label>
  );
}

/* ────────────────────────────────────────────────────────────
 * Segmented character boxes (Student Name, Mobile Number) —
 * printed as individual letter/digit cells like the paper form.
 * ──────────────────────────────────────────────────────────── */
export function SegBoxes({
  value,
  onChange,
  length,
  numeric,
  uppercase,
  ariaLabel,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  length: number;
  numeric?: boolean;
  uppercase?: boolean;
  ariaLabel: string;
  disabled?: boolean;
  error?: boolean;
}) {
  const display = uppercase ? value.toUpperCase() : value;
  return (
    <div className={cn("sci-seg", error && "sci-seg-error", disabled && "sci-seg-disabled")}>
      {Array.from({ length }).map((_, i) => (
        <span key={i} className="sci-seg-box">
          {display[i] ?? ""}
        </span>
      ))}
      <input
        className="sci-seg-input"
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        inputMode={numeric ? "numeric" : "text"}
        autoComplete="off"
        onChange={(e) => {
          let v = e.target.value;
          if (numeric) v = v.replace(/\D/g, "");
          v = v.slice(0, length);
          onChange(uppercase ? v.toUpperCase() : v);
        }}
        onFocus={(e) => e.currentTarget.select()}
      />
    </div>
  );
}

/* Dotted fill-in line used across the printed form. */
export function Dotted({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn("sci-dotted", className)}>{children}</span>;
}

/* Section bullet marker (❖) used before every printed label. */
export function Bullet() {
  return <span className="sci-bullet">❖</span>;
}

/* ────────────────────────────────────────────────────────────
 * Document header — logo, institute name/address/phones/email,
 * Regd. No., and (page 1) photo box.
 * ──────────────────────────────────────────────────────────── */
export function DocumentHeader({ photoBox }: { photoBox?: ReactNode }) {
  return (
    <header className="sci-header">
      <img src="/favicon-180x180.jpg?v=2" alt="Star Coaching Institute logo" className="sci-logo" />
      <div className="sci-header-mid">
        <div className="sci-institute-name">Star Coaching Institute Pvt. Ltd.</div>
        <div className="sci-institute-addr">Zeromile-7, Janakpurdham</div>
        <div className="sci-institute-phones">9804899123, 9801670382, 9801699123</div>
        <div className="sci-institute-email">Email: starcoaching2021@gmail.com</div>
      </div>
      <div className="sci-header-right">
        <div className="sci-regd">Regd. No.: 269271/077/078</div>
        {photoBox}
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
 * Photo box — upload / preview / replace / remove (screen only,
 * hidden in print). Never stretches/distorts the photo.
 * ──────────────────────────────────────────────────────────── */
function readAndCompressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file."));
      img.onload = () => {
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoBox({
  src,
  onChange,
  disabled,
  error,
}: {
  src: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className={cn("sci-photo-wrap", error && "sci-photo-error")}>
      <div className="sci-photo-box">
        {src ? (
          <img src={src} alt="Student" className="sci-photo-img" />
        ) : (
          <span className="sci-photo-label">Photo</span>
        )}
      </div>
      {!disabled && (
        <div className="sci-photo-actions no-print">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              try {
                onChange(await readAndCompressPhoto(file));
              } catch {
                onChange("");
              } finally {
                setBusy(false);
              }
            }}
          />
          <button
            type="button"
            className="sci-photo-btn"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            title={src ? "Replace photo" : "Upload photo"}
          >
            {busy ? <Upload size={9} /> : src ? <RefreshCcw size={9} /> : <Upload size={9} />}
            {src ? "Replace" : "Upload"}
          </button>
          {src && (
            <button
              type="button"
              className="sci-photo-btn sci-photo-btn-danger"
              onClick={() => onChange("")}
              title="Remove photo"
            >
              <Trash2 size={9} />
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Signature capture modal (draw with pointer) — student & parent.
 * ──────────────────────────────────────────────────────────── */
export function SignatureModal({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial?: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    dirty.current = false;
    if (initial) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = initial;
    }
  }, [open, initial]);

  if (!open) return null;

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
  };

  return (
    <div className="sci-modal no-print" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sci-modal-card">
        <div className="sci-modal-head">
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="sci-sign-canvas"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            const ctx = e.currentTarget.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            dirty.current = true;
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = e.currentTarget.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.lineTo(x, y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            drawing.current = false;
          }}
          onPointerLeave={() => {
            drawing.current = false;
          }}
        />
        <div className="sci-modal-actions">
          <button type="button" className="sci-btn-ghost" onClick={clear}>
            <Eraser size={13} /> Clear
          </button>
          <div className="sci-modal-actions-right">
            <button type="button" className="sci-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="sci-btn-primary"
              onClick={() => {
                if (!dirty.current) {
                  onSave("");
                  return;
                }
                onSave(canvasRef.current!.toDataURL("image/png"));
              }}
            >
              <Check size={13} /> Use Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Institute office signatures — baked into every admission document's
 * Academic & Principal lines. A signature captured later by the office
 * (per-admission value) always overrides these defaults.
 */
export const OFFICE_SIGNATURES = {
  academic: "/site/signature-academic.png?v=3",
  principal: "/site/signature-principal.png?v=1",
} as const;

/* Signature line: dotted rule + drawn image (or blank for print). */
export function SignatureLine({
  label,
  value,
  editable,
  actionLabel,
  onAction,
  onClear,
  error,
}: {
  label: string;
  value: string;
  editable: boolean;
  actionLabel: string;
  onAction?: () => void;
  onClear?: () => void;
  error?: boolean;
}) {
  return (
    <div className={cn("sci-sign-line", error && "sci-sign-line-error")}>
      <div className="sci-sign-slot">
        {value ? <img src={value} alt={label} className="sci-sign-img" /> : <span />}
        {editable && (
          <div className="sci-sign-actions no-print">
            <button type="button" className="sci-photo-btn" onClick={onAction}>
              <PenLine size={9} /> {value ? "Redraw" : actionLabel}
            </button>
            {value && onClear && (
              <button
                type="button"
                className="sci-photo-btn sci-photo-btn-danger"
                onClick={onClear}
              >
                <Trash2 size={9} /> Clear
              </button>
            )}
          </div>
        )}
      </div>
      <div className="sci-sign-rule" />
      <div className="sci-sign-caption">{label}</div>
    </div>
  );
}
