import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Lightbulb, Zap, Building, Wrench } from "lucide-react";

export function LightManagerPage() {
  return (
    <FirestoreModulePage
      collectionName="light_manager"
      title="Light Manager"
      subtitle="Track campus lights, meters and maintenance across branches"
      stats={[
        { label: "Total Fixtures", value: 48, icon: Lightbulb, tone: "purple" },
        { label: "Active Meters", value: 6, icon: Zap, tone: "warning" },
        { label: "Locations", value: 5, icon: Building, tone: "info" },
        { label: "Maintenance Due", value: 3, icon: Wrench, tone: "danger" },
      ]}
      columns={[
        { key: "location", label: "Location" },
        { key: "fixtureType", label: "Fixture Type" },
        { key: "meterNo", label: "Meter No." },
        { key: "unitsConsumed", label: "Units (kWh)" },
        { key: "lastMaintenance", label: "Last Maintenance" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "location", label: "Location / Room", type: "text", required: true },
        {
          key: "fixtureType",
          label: "Fixture Type",
          type: "select",
          options: [
            { value: "LED Panel", label: "LED Panel" },
            { value: "Tube Light", label: "Tube Light" },
            { value: "CFL Bulb", label: "CFL Bulb" },
            { value: "LED Bulb", label: "LED Bulb" },
            { value: "Street Light", label: "Street Light" },
          ],
        },
        { key: "meterNo", label: "Meter Number", type: "text" },
        { key: "unitsConsumed", label: "Units Consumed (kWh)", type: "number" },
        { key: "lastMaintenance", label: "Last Maintenance Date", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Working", label: "Working" },
            { value: "Needs Repair", label: "Needs Repair" },
            { value: "Under Repair", label: "Under Repair" },
            { value: "Replaced", label: "Replaced" },
          ],
        },
      ]}
    />
  );
}
