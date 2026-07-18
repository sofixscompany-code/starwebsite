import { ModulePage } from "@/components/admin/ModulePage";
import { Library, BookOpen, AlertCircle, Wallet } from "lucide-react";

export function LibraryPage() {
  return (
    <ModulePage
      title="Library"
      subtitle="Manage books, issues and returns for the institute library"
      stats={[
        { label: "Total Books", value: 2480, icon: Library, tone: "purple" },
        { label: "Currently Issued", value: 186, icon: BookOpen, tone: "info" },
        { label: "Overdue Returns", value: 14, icon: AlertCircle, tone: "warning" },
        { label: "Fines Collected", value: "₹4,200", icon: Wallet, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Book" },
        { key: "author", label: "Author" },
        { key: "copies", label: "Copies" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "HC Verma – Physics", author: "H.C. Verma", copies: 15, status: "Available" },
        { name: "RD Sharma – Maths", author: "R.D. Sharma", copies: 12, status: "Available" },
        { name: "NCERT Chemistry Class 12", author: "NCERT", copies: 20, status: "Issued" },
        { name: "Trueman's Biology", author: "M.P. Tyagi", copies: 8, status: "Low Stock" },
      ]}
    />
  );
}
