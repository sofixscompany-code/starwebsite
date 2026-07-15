import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { CheckCircle2, Users, AlertCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  component: () => (
    <ModulePage
      title="Attendance"
      subtitle="Daily, biometric & QR-scan attendance."
      addLabel="Add"
      stats={[
    { label: "Today %", value: "92%", icon: CheckCircle2, tone: "success" },
    { label: "Present", value: "1,181", icon: Users },
    { label: "Absent", value: 103, icon: AlertCircle, tone: "danger" },
    { label: "Late", value: 24, icon: Clock, tone: "warning" }
      ]}
      columns={[
    { key: "batch", label: "Batch" },
    { key: "course", label: "Course" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "late", label: "Late" },
    { key: "pct", label: "%" },
    { key: "mode", label: "Mode" }
      ]}
      rows={[
    {"id":"1","batch":"B-12","course":"Nepal Police","present":"42","absent":"3","late":"1","pct":"93%","mode":"Biometric"},
    {"id":"2","batch":"L-04","course":"Loksewa","present":"38","absent":"2","late":"0","pct":"95%","mode":"QR"},
    {"id":"3","batch":"A-08","course":"APF","present":"30","absent":"5","late":"2","pct":"82%","mode":"Manual"},
    {"id":"4","batch":"BK-02","course":"Bank PO","present":"28","absent":"1","late":"1","pct":"93%","mode":"Biometric"},
    {"id":"5","batch":"N-05","course":"Nepal Army","present":"25","absent":"4","late":"0","pct":"86%","mode":"Biometric"}
      ]}
    />
  ),
});
