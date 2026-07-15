import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Star Coaching Institute" },
      {
        name: "description",
        content:
          "Photos and moments from Star Coaching Institute — classes, physical training, celebrations and student life.",
      },
    ],
  }),
  component: GalleryPage,
});

// Placeholder gradient tiles until real gallery images are uploaded.
const tiles = [
  { title: "Nepal Police physical training", gradient: "from-navy to-brand-red" },
  { title: "Classroom in session", gradient: "from-brand-red to-amber-500" },
  { title: "Loksewa mock test day", gradient: "from-navy to-indigo-600" },
  { title: "Staff Nurse practical", gradient: "from-emerald-600 to-navy" },
  { title: "Result celebration", gradient: "from-gold to-brand-red" },
  { title: "Faculty session", gradient: "from-navy to-slate-700" },
  { title: "Hostel — Boys & Girls", gradient: "from-purple-600 to-brand-red" },
  { title: "Computer lab", gradient: "from-indigo-600 to-navy" },
  { title: "Bridge Course batch", gradient: "from-brand-red to-navy" },
];

function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Life at Star</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">Photo Gallery</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Snapshots from our classrooms, physical training, mock tests and celebrations.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {tiles.map((t, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-gradient-to-br ${t.gradient} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <Camera className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs md:text-sm font-bold text-center opacity-80">
                    {t.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Real photos coming soon.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
