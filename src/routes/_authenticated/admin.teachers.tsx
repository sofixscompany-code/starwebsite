import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Users, CalendarCheck, CalendarOff, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/teachers")({
  component: () => (
    <ModulePage
      title="Teachers"
      subtitle="68 active faculty across all branches."
      addLabel="Add"
      stats={[
    { label: "Total", value: 68, icon: Users },
    { label: "Present today", value: 61, icon: CalendarCheck },
    { label: "On leave", value: 4, icon: CalendarOff },
    { label: "Top rated", value: 12, icon: Star }
      ]}
      columns={[
    { key: "name", label: "Teacher" },
    { key: "dept", label: "Department" },
    { key: "subj", label: "Subject" },
    { key: "exp", label: "Experience" },
    { key: "rating", label: "Rating" },
    { key: "salary", label: "Salary" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Ram Bahadur K.C.","dept":"Public Service","subj":"GK & Mental Ability","exp":"12 yrs","rating":"4.9","salary":"₹65,000","status":"Active"},
    {"id":"2","name":"Sunita Neupane","dept":"Language","subj":"English & Nepali","exp":"8 yrs","rating":"4.8","salary":"₹58,000","status":"Active"},
    {"id":"3","name":"Bishal Rai","dept":"Math","subj":"Quantitative Aptitude","exp":"10 yrs","rating":"4.7","salary":"₹62,000","status":"Active"},
    {"id":"4","name":"Kabita Shrestha","dept":"Public Service","subj":"Constitution","exp":"6 yrs","rating":"4.6","salary":"₹52,000","status":"Active"},
    {"id":"5","name":"Prakash Adhikari","dept":"Science","subj":"General Science","exp":"9 yrs","rating":"4.5","salary":"₹56,000","status":"Active"},
    {"id":"6","name":"Anju Rana","dept":"IT","subj":"Computer","exp":"5 yrs","rating":"4.4","salary":"₹48,000","status":"Active"}
      ]}
    />
  ),
});
