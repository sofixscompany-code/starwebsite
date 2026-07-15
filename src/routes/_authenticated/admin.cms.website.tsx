import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Globe, Layers, Image, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/website")({
  component: () => (
    <ModulePage
      title="Website Builder"
      subtitle="Public pages · sections · SEO."
      addLabel="Add"
      stats={[
    { label: "Pages", value: 14, icon: Globe },
    { label: "Sections", value: 62, icon: Layers },
    { label: "Media", value: 482, icon: Image },
    { label: "Published", value: 12, icon: CheckCircle2, tone: "success" }
      ]}
      columns={[
    { key: "page", label: "Page" },
    { key: "slug", label: "Slug" },
    { key: "updated", label: "Updated" },
    { key: "author", label: "Author" },
    { key: "views", label: "30-day views" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","page":"Home","slug":"/","updated":"2h ago","author":"Admin","views":"24,812","status":"Active"},
    {"id":"2","page":"About","slug":"/about","updated":"1d ago","author":"Admin","views":"6,412","status":"Active"},
    {"id":"3","page":"Courses","slug":"/courses","updated":"3d ago","author":"Admin","views":"18,412","status":"Active"},
    {"id":"4","page":"Contact","slug":"/contact","updated":"1w ago","author":"Admin","views":"2,182","status":"Active"}
      ]}
    />
  ),
});
