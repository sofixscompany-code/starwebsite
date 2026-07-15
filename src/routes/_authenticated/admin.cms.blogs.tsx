import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Newspaper, PenSquare, TrendingUp, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/blogs")({
  component: () => (
    <ModulePage
      title="Blog"
      subtitle="Educational content & SEO articles."
      addLabel="Add"
      stats={[
    { label: "Posts", value: 82, icon: Newspaper },
    { label: "Drafts", value: 6, icon: PenSquare, tone: "warning" },
    { label: "Views MTD", value: "46K", icon: TrendingUp, tone: "info" },
    { label: "Authors", value: 4, icon: UserCog }
      ]}
      columns={[
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "cat", label: "Category" },
    { key: "date", label: "Published" },
    { key: "views", label: "Views" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","title":"How to crack Nepal Police exam","author":"Kabita S.","cat":"Guide","date":"2024-09-28","views":"4,812","status":"Active"},
    {"id":"2","title":"Loksewa syllabus 2081/82","author":"Ram B.","cat":"Syllabus","date":"2024-09-20","views":"8,214","status":"Active"},
    {"id":"3","title":"Bank PO study plan","author":"Anita R.","cat":"Guide","date":"2024-09-15","views":"2,412","status":"Active"}
      ]}
    />
  ),
});
