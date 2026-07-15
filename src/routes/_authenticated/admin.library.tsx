import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Library, BookOpen, AlertCircle, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/library")({
  component: () => (
    <ModulePage
      title="Library"
      subtitle="Books · issues · barcode scan."
      addLabel="Add"
      stats={[
    { label: "Books", value: "3,412", icon: Library },
    { label: "Issued", value: 842, icon: BookOpen },
    { label: "Overdue", value: 46, icon: AlertCircle, tone: "danger" },
    { label: "Fines", value: "₹4,820", icon: Wallet, tone: "warning" }
      ]}
      columns={[
    { key: "book", label: "Book" },
    { key: "author", label: "Author" },
    { key: "issued", label: "Issued to" },
    { key: "date", label: "Issue date" },
    { key: "due", label: "Due date" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","book":"Nepal Constitution","author":"Bipin Adhikari","issued":"Aarav Sharma","date":"2024-09-15","due":"2024-10-15","status":"Active"},
    {"id":"2","book":"English Grammar in Use","author":"Raymond Murphy","issued":"Priya Karki","date":"2024-09-20","due":"2024-10-20","status":"Active"},
    {"id":"3","book":"Quantitative Aptitude","author":"R.S. Aggarwal","issued":"Sita Rana","date":"2024-08-10","due":"2024-09-10","status":"Overdue"}
      ]}
    />
  ),
});
