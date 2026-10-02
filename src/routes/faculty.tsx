import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useFaculty } from "@/hooks/use-faculty";
import { useLanguage } from "@/hooks/use-language";

export function FacultyPage() {
  const faculty = useFaculty();
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">{t("Faculty")}</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("facultyHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("facultyHeroSub")}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f) => (
              <div
                key={f.name}
                className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-brand-red/40 transition"
              >
                {f.photoUrl ? (
                  <img
                    src={f.photoUrl}
                    alt={f.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-red/20 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-navy/70 text-navy-foreground flex items-center justify-center font-display font-black text-lg shrink-0">
                    {f.initials}
                  </div>
                )}
                <div>
                  <h3 className="font-display font-bold text-lg text-navy leading-tight">
                    {f.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-brand-red font-bold mt-1">
                    {f.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{f.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
