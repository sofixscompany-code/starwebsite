import { useState } from "react";
import { Briefcase, FileText, Globe, Layers } from "lucide-react";
import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";

const SERVICE_OPTIONS = [
  { value: "nepal-police", label: "Nepal Police" },
  { value: "nepali-army", label: "Nepali Army" },
  { value: "apf", label: "Armed Police Force (APF)" },
  { value: "forest-guard", label: "Forest Guard" },
];

const SECTION_OPTIONS = [
  { value: "posts", label: "Available Posts" },
  { value: "eligibility", label: "Eligibility" },
  { value: "selection", label: "Selection Process" },
  { value: "written", label: "Written Exam" },
  { value: "physical", label: "Physical Test" },
  { value: "exam-pattern", label: "Exam Pattern" },
  { value: "syllabus", label: "Syllabus" },
  { value: "previous-questions", label: "Previous Questions" },
  { value: "preparation", label: "Preparation Materials" },
  { value: "faqs", label: "Frequently Asked Questions" },
  { value: "notices", label: "Official Notices" },
];

/**
 * CMS for the public career pages (/career/nepal-police, /career/nepali-army,
 * /career/apf, /career/forest-guard).
 *
 * Tab 1 — Content Sections: one Firestore doc per content block in
 *         `career_sections` (service + section + optional post grouping).
 * Tab 2 — Services: the four service docs in `career` (intro, apply links).
 */
export function CareerAdminPage() {
  const [tab, setTab] = useState<"sections" | "services">("sections");

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab("sections")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            tab === "sections"
              ? "bg-white shadow text-blue-700"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Content Sections
        </button>
        <button
          type="button"
          onClick={() => setTab("services")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            tab === "services"
              ? "bg-white shadow text-blue-700"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Services
        </button>
      </div>

      {tab === "sections" ? (
        <FirestoreModulePage
          key="career-sections"
          collectionName="career_sections"
          title="Career Content Sections"
          subtitle="Blocks shown on /career/* pages — choose a service + section; tag a Post (e.g. Inspector) to group content post-wise. Line starting with '-' = bullet, 'Label:' = sub-heading, URLs become link rows."
          stats={[
            { label: "Content Blocks", value: 0, icon: FileText, tone: "blue" },
            { label: "Services", value: 4, icon: Briefcase, tone: "purple" },
          ]}
          columns={[
            { key: "service", label: "Service" },
            { key: "section", label: "Section" },
            { key: "post", label: "Post" },
            { key: "title", label: "Title" },
            { key: "order", label: "Order" },
            {
              key: "body",
              label: "Body",
              sortable: false,
              render: (row) => (
                <span className="block max-w-md truncate text-xs text-gray-500">
                  {String(row.body ?? "").replace(/\n/g, " ") || "—"}
                </span>
              ),
            },
          ]}
          fields={[
            {
              key: "service",
              label: "Service",
              type: "select",
              options: SERVICE_OPTIONS,
              required: true,
            },
            {
              key: "section",
              label: "Section",
              type: "select",
              options: SECTION_OPTIONS,
              required: true,
            },
            {
              key: "post",
              label: "Post (optional — enables post-wise tabs)",
              type: "text",
              placeholder: "e.g. Inspector / ASI / Constable",
            },
            { key: "title", label: "Title", type: "text", required: true },
            {
              key: "body",
              label: "Body",
              type: "textarea",
              placeholder:
                "One item per line.\n- Start a line with '-' for bullets\nEducation: ... → sub-heading line\nLinks: Title — https://example.com",
            },
            { key: "order", label: "Display Order", type: "number", placeholder: "1" },
          ]}
          filters={[{ key: "service", label: "Service", options: SERVICE_OPTIONS }]}
          rows={[]}
        />
      ) : (
        <FirestoreModulePage
          key="career-services"
          collectionName="career"
          title="Career Services"
          subtitle="The four services behind /career/* — name, intro and official apply links shown in the page hero"
          stats={[
            { label: "Services", value: 4, icon: Globe, tone: "success" },
            { label: "Public Pages", value: 4, icon: Layers, tone: "blue" },
          ]}
          columns={[
            { key: "name", label: "Service" },
            { key: "slug", label: "Slug" },
            { key: "tagline", label: "Tagline" },
            { key: "order", label: "Order" },
          ]}
          fields={[
            { key: "name", label: "Service Name", type: "text", required: true },
            {
              key: "slug",
              label: "Slug (URL: /career/<slug>)",
              type: "text",
              required: true,
              placeholder: "nepal-police / nepali-army / apf / forest-guard",
            },
            { key: "tagline", label: "Tagline", type: "text" },
            { key: "intro", label: "Introduction", type: "textarea" },
            {
              key: "applyUrl",
              label: "Apply URL (online application portal)",
              type: "text",
              placeholder: "https://…",
            },
            {
              key: "officialUrl",
              label: "Official Website URL",
              type: "text",
              placeholder: "https://…",
            },
            { key: "order", label: "Display Order", type: "number", placeholder: "1" },
          ]}
          rows={[]}
        />
      )}
    </div>
  );
}
