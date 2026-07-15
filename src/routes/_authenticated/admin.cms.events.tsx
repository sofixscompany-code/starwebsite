import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Calendar, Radio, History, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/events")({
  component: () => (
    <ModulePage
      title="News & Events"
      subtitle="Announcements & campus events."
      addLabel="Add"
      stats={[
    { label: "Upcoming", value: 8, icon: Calendar },
    { label: "Live", value: 1, icon: Radio, tone: "warning" },
    { label: "Past", value: 124, icon: History },
    { label: "Attendees", value: "4,812", icon: Users }
      ]}
      columns={[
    { key: "name", label: "Event" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
    { key: "venue", label: "Venue" },
    { key: "rsvp", label: "RSVPs" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Free demo — Nepal Police","type":"Demo","date":"2024-10-08","venue":"Kathmandu Branch","rsvp":"42","status":"Scheduled"},
    {"id":"2","name":"Loksewa Q&A session","type":"Webinar","date":"2024-10-10","venue":"Online","rsvp":"124","status":"Scheduled"},
    {"id":"3","name":"Parent-teacher meet","type":"Meeting","date":"2024-10-12","venue":"Auditorium","rsvp":"286","status":"Scheduled"}
      ]}
    />
  ),
});
