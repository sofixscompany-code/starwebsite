import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { IdCard, Clock, AlertCircle, Layers } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/id-cards")({
  component: () => (
    <ModulePage
      title="ID Cards"
      subtitle="QR-enabled ID card builder."
      addLabel="Add"
      stats={[
    { label: "Issued", value: "1,284", icon: IdCard },
    { label: "Pending print", value: 32, icon: Clock },
    { label: "Reprints", value: 14, icon: AlertCircle, tone: "warning" },
    { label: "Templates", value: 6, icon: Layers }
      ]}
      columns={[
    { key: "roll", label: "Roll #" },
    { key: "name", label: "Student" },
    { key: "course", label: "Course" },
    { key: "issued", label: "Issued" },
    { key: "expiry", label: "Expiry" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","roll":"SCI-2024-001","name":"Aarav Sharma","course":"Nepal Police","issued":"2024-01-15","expiry":"2025-01-15","status":"Active"},
    {"id":"2","roll":"SCI-2024-002","name":"Priya Karki","course":"Loksewa","issued":"2024-01-15","expiry":"2025-01-15","status":"Active"}
      ]}
    />
  ),
});
