import { Link } from "react-router-dom";
import { useFeatureContent, type FeatureContentItem } from "@/hooks/use-feature-content";
import { Sparkles, ArrowRight } from "lucide-react";

type Props = {
  section?: string;
  title?: string;
  showTitle?: boolean;
};

export function FeatureStrip({
  section = "features",
  title = "Why Star Coaching?",
  showTitle = true,
}: Props) {
  const items = useFeatureContent(section);

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4">
        {showTitle && title && (
          <div className="text-center mb-8">
            <h2 className="font-display font-black text-2xl md:text-3xl text-navy dark:text-white">
              {title}
            </h2>
            <div className="w-16 h-1 bg-brand-red rounded-full mx-auto mt-3" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: FeatureContentItem }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700">
      {item.image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-bold text-navy dark:text-white text-base">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
            {item.description}
          </p>
        )}
        {item.buttonText && item.buttonLink && (
          <div className="mt-4">
            {item.buttonLink.startsWith("/") ? (
              <Link
                to={item.buttonLink}
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
              >
                {item.buttonText} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <a
                href={item.buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-red hover:underline"
              >
                {item.buttonText} <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
