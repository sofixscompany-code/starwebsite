import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "@/integrations/aws/firestore";
import {
  ShieldCheck,
  Stethoscope,
  Wrench,
  Monitor,
  GraduationCap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/integrations/aws/config";

export interface HomepageCategory {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  order?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Stethoscope,
  Wrench,
  Monitor,
  GraduationCap,
  BookOpen,
  Award: GraduationCap,
  Trophy: GraduationCap,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? BookOpen;
}

const FALLBACK_CATEGORIES: HomepageCategory[] = [
  {
    id: "fb-1",
    icon: "ShieldCheck",
    title: "Security Forces",
    desc: "Nepal Police · Army · Armed Police",
    color: "bg-blue-50 text-navy",
  },
  {
    id: "fb-2",
    icon: "Award",
    title: "Loksewa Aayog",
    desc: "Kharidar · Na.Su. · Officer",
    color: "bg-red-50 text-brand-red",
  },
  {
    id: "fb-3",
    icon: "Stethoscope",
    title: "Medical & Nursing",
    desc: "Staff Nurse · HA · CMA / ANM",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "fb-4",
    icon: "Wrench",
    title: "Engineering Diploma",
    desc: "Civil · Mechanical · IT · Electrical",
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "fb-5",
    icon: "Monitor",
    title: "Computer Training",
    desc: "Office · AutoCAD · C++",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "fb-6",
    icon: "BookOpen",
    title: "SEE Preparation",
    desc: "Class 8-10 All Subjects",
    color: "bg-purple-50 text-purple-700",
  },
];

export function useHomepageCategories() {
  const [categories, setCategories] = useState<HomepageCategory[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    const q = query(collection(db, "homepage_categories"), limit(20));
    getDocs(q)
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs.map((d) => ({
          id: d.id,
          icon: (d.data().icon as string) ?? "BookOpen",
          title: (d.data().title as string) ?? "",
          desc: (d.data().desc as string) ?? "",
          color: (d.data().color as string) ?? "bg-blue-50 text-navy",
          order: (d.data().order as number) ?? 9999,
        }));
        rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setCategories(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
