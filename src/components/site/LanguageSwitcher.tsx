import { useState } from "react";
import { Globe2, ChevronDown } from "lucide-react";
import { useLanguage, LANG_LABELS, type Lang } from "@/hooks/use-language";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const langs: Lang[] = ["en", "ne", "hi"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white transition-colors"
        aria-label="Switch language"
      >
        <Globe2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px]">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition ${
                  lang === l ? "text-brand-red" : "text-navy"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
