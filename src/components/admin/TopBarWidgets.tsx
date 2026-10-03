import { useEffect, useState } from "react";
import { CalendarDays, Languages } from "lucide-react";
import { formatClock, useAdminT, type AdminLang } from "@/lib/admin-i18n";

/**
 * Live day / date / time for the admin top bar.
 *
 * Re-renders itself every second (isolated from the shell so the whole header
 * does not tick), uses the browser's local timezone, and never falls back to a
 * hardcoded string.
 */
export function LiveClock() {
  const { lang } = useAdminT();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { weekday, date, time } = formatClock(now, lang);

  return (
    <div
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-right"
      aria-live="off"
    >
      <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
      <div className="leading-tight">
        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
          {weekday}, {date}
        </p>
        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
          {time}
        </p>
      </div>
    </div>
  );
}

const LANG_OPTIONS: { value: AdminLang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
];

/** Global EN | नेपाली switcher (shared `app_lang` preference). */
export function LangSwitcher() {
  const { lang, setLang, t } = useAdminT();

  return (
    <div
      className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5"
      role="group"
      aria-label={t("language")}
      title={t("language")}
    >
      <Languages className="w-3.5 h-3.5 text-gray-400 mx-1.5" aria-hidden />
      {LANG_OPTIONS.map((opt) => {
        const active = lang === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLang(opt.value)}
            aria-pressed={active}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              active
                ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
