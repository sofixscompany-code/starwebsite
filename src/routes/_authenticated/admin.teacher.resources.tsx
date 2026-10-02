import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { BookOpen, FileVideo } from "lucide-react";

export default function TeacherResourcesPage() {
  const { rows } = useModuleData("teacher_content");

  const types = new Set(rows.map((r) => String(r.type || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="teacher_content"
      title="Resources"
      subtitle="Create and share teaching resources with students"
      stats={[
        { label: "Resources", value: rows.length, icon: BookOpen, tone: "purple" },
        { label: "Content Types", value: types, icon: FileVideo, tone: "info" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "courseName", label: "Course" },
        { key: "isPublished", label: "Published" },
      ]}
      fields={[
        {
          key: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Quadratic Equations Video",
        },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "video", label: "Video" },
            { value: "notes", label: "Notes" },
            { value: "assignment", label: "Assignment" },
            { value: "quiz", label: "Quiz" },
            { value: "announcement", label: "Announcement" },
          ],
        },
        {
          key: "courseName",
          label: "Course",
          type: "text",
          required: true,
          placeholder: "Mathematics",
        },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Brief description of this resource",
        },
        {
          key: "fileUrl",
          label: "File / Video URL",
          type: "text",
          placeholder: "https://example.com/resource.pdf",
        },
        {
          key: "isPublished",
          label: "Published",
          type: "select",
          options: [
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ],
        },
      ]}
    />
  );
}
