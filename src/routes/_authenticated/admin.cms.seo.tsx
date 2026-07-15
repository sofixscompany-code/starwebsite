import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Search, TrendingUp, Target, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/seo")({
  component: () => (
    <ModulePage
      title="SEO"
      subtitle="On-page SEO, meta tags & sitemaps."
      addLabel="Add"
      stats={[
    { label: "Indexed", value: 124, icon: Search },
    { label: "Avg position", value: "8.2", icon: TrendingUp, tone: "success" },
    { label: "Keywords tracked", value: 482, icon: Target },
    { label: "Sitemap OK", value: "Yes", icon: CheckCircle2, tone: "success" }
      ]}
      columns={[
    { key: "page", label: "Page" },
    { key: "title", label: "Title" },
    { key: "desc", label: "Meta description" },
    { key: "score", label: "Score" },
    { key: "issues", label: "Issues" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","page":"/","title":"Star Coaching Institute — #1 in Nepal","desc":"Best coaching in Nepal for…","score":"92","issues":"0","status":"Active"},
    {"id":"2","page":"/courses","title":"All Courses — Star Coaching","desc":"Explore Nepal Police, Loksewa…","score":"88","issues":"1","status":"Active"},
    {"id":"3","page":"/about","title":"About Us — Star Coaching","desc":"Since 2005, we've helped…","score":"81","issues":"2","status":"Active"}
      ]}
    />
  ),
});
