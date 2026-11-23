import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Skeleton } from "@/components/admin/ui";
import { Users, Phone, Mail, GraduationCap } from "lucide-react";
import { db } from "@/integrations/aws/config";
import { collection, getDocs } from "@/integrations/aws/firestore";

type StudentDoc = {
  studentId?: string;
  name?: string;
  email?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  courseName?: string;
  className?: string;
  grade?: string;
};

type ParentWithChildren = {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  children: { name?: string; courseName?: string; className?: string; grade?: string }[];
};

const CONTACTS = [
  { label: "Call", prefix: "tel:", icon: Phone, tone: "info" },
  { label: "Email", prefix: "mailto:", icon: Mail, tone: "orange" },
] as const;

export default function TeacherParentsPage() {
  const { data: students, isLoading } = useQuery({
    queryKey: ["teacher", "parents"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "students"));
      return snap.docs.map((d) => ({ ...(d.data() as StudentDoc), id: d.id }));
    },
  });

  const parents = useMemo(() => {
    const map = new Map<string, ParentWithChildren>();
    students?.forEach((s) => {
      if (!s.parentEmail) return;
      const key = s.parentEmail.toLowerCase();
      const existing = map.get(key);
      const child = {
        name: s.name,
        courseName: s.courseName,
        className: s.className,
        grade: s.grade,
      };
      if (existing) {
        existing.children.push(child);
      } else {
        map.set(key, {
          parentName: s.parentName || "Parent",
          parentEmail: s.parentEmail,
          parentPhone: s.parentPhone || "",
          children: [child],
        });
      }
    });
    return Array.from(map.values());
  }, [students]);

  const anyLoading = isLoading;

  return (
    <div>
      <PageHeader
        title="Parents"
        subtitle="Parents of your students — reach out for guardianship, feedback and updates."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Parents" value={parents.length} icon={Users} tone="purple" />
        <StatCard
          label="Linked Students"
          value={parents.reduce((n, p) => n + p.children.length, 0)}
          icon={GraduationCap}
          tone="info"
        />
        <StatCard
          label="With Phone"
          value={parents.filter((p) => p.parentPhone).length}
          icon={Phone}
          tone="success"
        />
        <StatCard
          label="With Email"
          value={parents.filter((p) => p.parentEmail).length}
          icon={Mail}
          tone="orange"
        />
      </div>

      {anyLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : parents.length === 0 ? (
        <Panel title="No Parents Yet">
          <p className="text-sm text-[hsl(var(--ap-muted))]">
            Parents appear here once their child has a <code className="api-chip">parentEmail</code>{" "}
            in the students collection.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {parents.map((p) => (
            <Panel key={p.parentEmail} title={p.parentName || "Parent"}>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {CONTACTS.map((c) => {
                    const Icon = c.icon;
                    const value = c.label === "Call" ? p.parentPhone : p.parentEmail;
                    if (!value) return null;
                    return (
                      <a
                        key={c.label}
                        href={`${c.prefix}${value}`}
                        className="ap-btn text-xs !px-3 !py-1.5"
                      >
                        <Icon className="w-3.5 h-3.5" /> {c.label}
                      </a>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                    Children in your care
                  </p>
                  {p.children.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--ap-border)/0.3)]"
                    >
                      <span className="text-sm font-semibold">{c.name || "Unnamed Student"}</span>
                      <Badge tone="purple">{c.courseName || c.className || "General"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
