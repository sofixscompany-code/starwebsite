import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  IndianRupee,
  ArrowRight,
  Search,
  Layers,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, getDocs } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { useLanguage } from "@/hooks/use-language";

type Course = {
  id: string;
  title?: string;
  category?: string;
  shortDescription?: string;
  duration?: string;
  feeNpr?: number;
  eligibility?: string;
  seats?: number;
  batchStarts?: string;
};

// Static fallback so the page is never empty while the Firestore
// `courses` collection (managed from /admin/courses) is being seeded.
const FALLBACK_COURSES: Course[] = [
  {
    id: "police-constable",
    title: "Nepal Police (Constable) Preparation",
    category: "Uniform Services",
    shortDescription:
      "Written + physical preparation for Nepal Police constable selection — Nepali, English, Math, GK and daily physical training.",
    duration: "6 months",
    feeNpr: 15000,
    eligibility: "SEE passed",
    seats: 60,
  },
  {
    id: "police-si",
    title: "Nepal Police (SI) Preparation",
    category: "Uniform Services",
    shortDescription:
      "Advanced Loksewa-level preparation for Police SI — optional subjects, interview and personality test practice.",
    duration: "8 months",
    feeNpr: 25000,
    eligibility: "+2 passed",
    seats: 40,
  },
  {
    id: "army-apf",
    title: "Nepali Army / APF Preparation",
    category: "Uniform Services",
    shortDescription:
      "Complete army & armed police force preparation including 3200m run, push-ups, sit-ups, chin-ups and written exams.",
    duration: "6 months",
    feeNpr: 15000,
    eligibility: "SEE passed",
    seats: 60,
  },
  {
    id: "loksewa",
    title: "Loksewa Aayog (Non-Gazetted)",
    category: "Loksewa & Administrative",
    shortDescription:
      "Non-gazetted first/second level preparation — service-related knowledge, English, Nepali, Math and interview.",
    duration: "4 months",
    feeNpr: 12000,
    eligibility: "SEE / +2 passed",
    seats: 50,
  },
  {
    id: "staff-nurse",
    title: "Staff Nurse (PCL Nursing) Entrance",
    category: "Medical & Health",
    shortDescription:
      "Entrance preparation for PCL Nursing — Biology, Chemistry, Physics, English, Math with regular mock tests.",
    duration: "4 months",
    feeNpr: 18000,
    eligibility: "SEE passed (C+ in Science)",
    seats: 45,
  },
  {
    id: "ha-entrance",
    title: "Health Assistant (HA) Entrance",
    category: "Medical & Health",
    shortDescription:
      "Focused HA entrance preparation with subject-wise notes, OMR practice and mocks from past entrance papers.",
    duration: "4 months",
    feeNpr: 15000,
    eligibility: "SEE passed",
    seats: 50,
  },
  {
    id: "cma-anm",
    title: "CMA / ANM Entrance",
    category: "Medical & Health",
    shortDescription:
      "Short-term intensive preparation for CMA and ANM entrance exams with solved question banks.",
    duration: "3 months",
    feeNpr: 12000,
    eligibility: "SEE passed",
    seats: 50,
  },
  {
    id: "engineering-diploma",
    title: "Engineering Diploma (CTEVT) Entrance",
    category: "Technical",
    shortDescription:
      "CTEVT engineering diploma entrance preparation — Math, Physics, Chemistry in both Nepali and English medium.",
    duration: "4 months",
    feeNpr: 12000,
    eligibility: "SEE passed",
    seats: 45,
  },
  {
    id: "computer",
    title: "Computer Training & Office Skills",
    category: "Technical",
    shortDescription:
      "Practical computer training — MS Office, typing, internet, and basic Tally for job readiness.",
    duration: "3 months",
    feeNpr: 8000,
    eligibility: "Anyone",
    seats: 30,
  },
  {
    id: "school-tuition",
    title: "SEE / +2 Tuition (Maths, English, Science)",
    category: "School Tuition",
    shortDescription:
      "Class 8–12 tuition for Math, English and Science with weekly tests, assignments and report cards for parents.",
    duration: "Ongoing",
    feeNpr: 3000,
    eligibility: "Class 8–12",
    seats: 40,
  },
];

export function CoursesPage() {
  const { t } = useLanguage();
  const { data: remote = [] } = useQuery({
    queryKey: ["courses-all"],
    queryFn: async () => {
      // Composite-index-free: fetch all courses, filter/sort client-side.
      const snap = await getDocs(collection(db, "courses"));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return docs
        .filter((c) => (c as { isActive?: boolean }).isActive !== false)
        .sort(
          (a, b) =>
            Number((a as { sortOrder?: number }).sortOrder ?? 9999) -
            Number((b as { sortOrder?: number }).sortOrder ?? 9999),
        ) as Course[];
    },
  });

  const courses = remote.length ? remote : FALLBACK_COURSES;

  const [queryText, setQueryText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.category && set.add(c.category));
    return ["All", ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return courses.filter((c) => {
      if (activeCategory !== "All" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.shortDescription ?? "").toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [courses, queryText, activeCategory]);

  const grouped = filtered.reduce<Record<string, Course[]>>((acc, c) => {
    const category = c.category || "Other";
    (acc[category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {t("ourCourses")}
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("coursesHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("coursesHeroSub")}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 space-y-10">
            {/* Toolbar: search + category filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder={t("searchCoursesPlaceholder")}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      activeCategory === cat
                        ? "bg-navy text-navy-foreground border-navy"
                        : "bg-white text-navy border-border hover:border-navy/40"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    {cat === "All" ? t("allFilter") : cat}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="font-display font-black text-xl text-navy">{t("noCoursesMatch")}</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t("noCoursesMatchSub")}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red hover:underline"
                >
                  {t("talkToUs")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              Object.entries(grouped).map(([category, list]) => (
                <div key={category}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-display font-black text-xl md:text-2xl text-navy">
                      {category}
                    </h2>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {list.length} {list.length === 1 ? t("courseOne") : t("courseMany")}
                    </span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-border p-5 hover:border-brand-red/40 hover:shadow-md transition flex flex-col"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">
                            {c.category || t("Courses")}
                          </span>
                          {c.seats ? (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" /> {c.seats} {t("seatsLabel")}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display font-bold text-lg text-navy leading-tight mt-3">
                          {c.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 flex-1">
                          {c.shortDescription}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground/70">
                          {c.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {c.duration}
                            </span>
                          )}
                          {c.batchStarts && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {c.batchStarts}
                            </span>
                          )}
                          {c.feeNpr ? (
                            <span className="flex items-center gap-1 font-semibold text-brand-red">
                              <IndianRupee className="w-3.5 h-3.5" />
                              Rs. {c.feeNpr.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        {c.eligibility ? (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {t("eligibilityLabel")}: {c.eligibility}
                          </p>
                        ) : null}

                        <Button
                          asChild
                          className="mt-5 w-full bg-navy hover:bg-navy/90 text-navy-foreground font-bold"
                        >
                          <Link to={`/admission?course=${c.id}`}>
                            {t("applyForCourse")} <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
