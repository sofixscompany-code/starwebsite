import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepCourse } from "@/lib/prep/types";
import { getPrepIcon } from "./prep-icons";

/** Course/group tile inside a service (e.g. जनपद प्रहरी). */
export function CourseCard({ course, to }: { course: PrepCourse; to: string }) {
  const Icon = getPrepIcon(course.icon);
  return (
    <Link
      to={to}
      aria-label={`${course.name} का पदहरू हेर्नुहोस्`}
      className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-red/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex rounded-lg bg-navy/10 p-2.5 text-navy">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">{course.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">कोर्स</p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-red"
          aria-hidden="true"
        />
      </div>
      {course.description ? (
        <p className="mt-3 text-sm text-slate-600">{course.description}</p>
      ) : null}
    </Link>
  );
}
