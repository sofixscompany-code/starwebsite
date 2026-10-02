import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepService } from "@/lib/prep/types";
import { getPrepIcon } from "./prep-icons";
import { servicePath } from "./prep-paths";

/** Gradient service tile (Nepal Police, Nepali Army, APF, Forest Guard…). */
export function ServiceCard({ service }: { service: PrepService }) {
  const Icon = getPrepIcon(service.icon);
  return (
    <Link
      to={servicePath(service.slug)}
      className={`group block rounded-2xl bg-gradient-to-br ${service.color} p-6 text-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-xl bg-white/15 p-3">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <ArrowRight
          className="h-5 w-5 opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-4 text-lg font-bold">{service.name}</h3>
      {service.description ? (
        <p className="mt-1 text-sm text-white/80">{service.description}</p>
      ) : null}
      <span className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
        कोर्स हेर्नुहोस् →
      </span>
    </Link>
  );
}
