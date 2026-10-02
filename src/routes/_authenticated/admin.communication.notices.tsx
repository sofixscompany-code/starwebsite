import { ModulePage, type FieldDef } from "@/components/admin/ModulePage";
import { useModuleData } from "@/hooks/use-module-data";

/**
 * Single implementation of the `notices` editor (also used by `/admin/notices`).
 *
 * Built directly on ModulePage + useModuleData (instead of FirestoreModulePage)
 * so the create handler can stamp `publishedAt` — the field the live homepage
 * ticker (`useLiveNotices`) reads first — and default `isPublished` to true.
 */
const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "body", label: "Body" },
  { key: "category", label: "Category" },
  { key: "isPublished", label: "Published" },
  { key: "publishedAt", label: "Published At" },
];

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Notice title" },
  { key: "body", label: "Body", type: "textarea", placeholder: "Notice details..." },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "Exam", label: "Exam" },
      { value: "Admission", label: "Admission" },
      { value: "Scholarship", label: "Scholarship" },
      { value: "Fees", label: "Fees" },
      { value: "Event", label: "Event" },
      { value: "General", label: "General" },
    ],
  },
];

export default function CommunicationNoticesPage() {
  const { rows, create, update, remove, bulkDelete, bulkUpdate } = useModuleData("notices");

  return (
    <ModulePage
      title="Communication Notices"
      subtitle="Publish notices and announcements for students, parents, and staff"
      columns={COLUMNS}
      fields={FIELDS}
      rows={rows}
      onCreate={async (data) => {
        await create({
          ...data,
          category: data?.category || "General",
          isPublished: true,
          publishedAt: new Date().toISOString(),
        });
      }}
      onUpdate={(id, data) => update(id, data)}
      onDelete={remove}
      onBulkDelete={bulkDelete}
      onBulkUpdate={bulkUpdate}
    />
  );
}
