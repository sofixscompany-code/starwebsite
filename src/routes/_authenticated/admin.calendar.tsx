import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GraduationCap,
  FileText,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAgenda, type AgendaItem } from "@/hooks/use-agenda";

const KIND_STYLE: Record<AgendaItem["kind"], string> = {
  event: "bg-purple-100 text-purple-700",
  exam: "bg-amber-100 text-amber-700",
  homework: "bg-blue-100 text-blue-700",
};

const KIND_LABEL: Record<AgendaItem["kind"], string> = {
  event: "Event",
  exam: "Exam",
  homework: "Assignment",
};

const KIND_ICON: Record<AgendaItem["kind"], typeof CalendarDays> = {
  event: CalendarDays,
  exam: GraduationCap,
  homework: FileText,
};

function groupByDate(items: AgendaItem[]) {
  const map = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

export default function CalendarPage() {
  const items = useAgenda();
  const [monthOffset, setMonthOffset] = useState(0);

  const anchor = new Date();
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + monthOffset);
  const monthKey = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthItems = groupByDate(items.filter((i) => i.date.startsWith(monthKey)));

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" subtitle="Schedule events, exams and assignments" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((v) => v - 1)}
            className="p-2 rounded-lg border border-border hover:bg-secondary/60 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-lg text-navy w-48 text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => setMonthOffset((v) => v + 1)}
            className="p-2 rounded-lg border border-border hover:bg-secondary/60 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">{monthItems.length} item(s)</span>
      </div>

      {monthItems.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground text-sm">
          <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
          No events scheduled for this month.
        </Card>
      ) : (
        <div className="space-y-4">
          {monthItems.map(([date, dayItems]) => {
            const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            return (
              <Card key={date} className="p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-navy mb-3">
                  {dateLabel}
                </p>
                <div className="space-y-2">
                  {dayItems.map((item) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-semibold text-navy flex-1 truncate">
                          {item.title}
                        </span>
                        {item.details ? (
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {item.details}
                          </span>
                        ) : null}
                        <Badge variant="secondary" className={`${KIND_STYLE[item.kind]}`}>
                          {KIND_LABEL[item.kind]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
