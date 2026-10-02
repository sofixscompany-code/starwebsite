import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Library, Video } from "lucide-react";

export default function TeacherLearningMaterialsPage() {
  const { rows } = useModuleData("lms_lessons");

  const courses = new Set(rows.map((r) => String(r.courseId || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="lms_lessons"
      title="Learning Materials"
      subtitle="Upload and organize study materials"
      stats={[
        { label: "Lessons", value: rows.length, icon: Library, tone: "purple" },
        { label: "Courses", value: courses, icon: Video, tone: "info" },
      ]}
      columns={[
        { key: "title", label: "Lesson" },
        { key: "courseId", label: "Course ID" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "title",
          label: "Lesson Title",
          type: "text",
          required: true,
          placeholder: "Chapter 1: Core Concepts",
        },
        { key: "courseId", label: "Course ID", type: "text", placeholder: "lms course doc id" },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Short summary of the lesson",
        },
        { key: "videoUrl", label: "Video URL", type: "text", placeholder: "https://..." },
        { key: "documentUrl", label: "Document URL", type: "text", placeholder: "https://..." },
        { key: "order", label: "Order", type: "number", placeholder: "1" },
      ]}
    />
  );
}
