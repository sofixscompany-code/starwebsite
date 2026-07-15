import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { UserPlus, Phone, ClipboardList, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reception")({
  component: () => (
    <ModulePage
      title="Reception"
      subtitle="Walk-in visitors, inquiries, quick fee collection."
      addLabel="Add"
      stats={[
    { label: "Visitors today", value: 32, icon: UserPlus },
    { label: "Inquiries", value: 18, icon: Phone },
    { label: "Admissions today", value: 6, icon: ClipboardList },
    { label: "Collected", value: "₹42,500", icon: Wallet }
      ]}
      columns={[
    { key: "time", label: "Time" },
    { key: "name", label: "Visitor" },
    { key: "purpose", label: "Purpose" },
    { key: "contact", label: "Contact" },
    { key: "handled", label: "Handled by" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","time":"09:12 AM","name":"Ram Prasad Bhattarai","purpose":"Course inquiry","contact":"9812345001","handled":"Reception A","status":"Completed"},
    {"id":"2","time":"09:45 AM","name":"Sunita Dahal","purpose":"Admission Nepal Police","contact":"9812345002","handled":"Reception B","status":"Completed"},
    {"id":"3","time":"10:20 AM","name":"Kiran Basnet","purpose":"Fee payment","contact":"9812345003","handled":"Reception A","status":"Completed"},
    {"id":"4","time":"11:05 AM","name":"Nabin Poudel","purpose":"Certificate collection","contact":"9812345004","handled":"Reception A","status":"Pending"},
    {"id":"5","time":"11:40 AM","name":"Prem Rai","purpose":"Demo class","contact":"9812345005","handled":"Reception B","status":"Scheduled"}
      ]}
    />
  ),
});
