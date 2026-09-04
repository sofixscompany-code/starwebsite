import { useState, useMemo } from "react";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Newspaper,
  Loader2,
  Eye,
  CheckCircle,
  Save,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge, Tabs, Modal, Skeleton } from "@/components/admin/ui";
import { useModuleData, type ModuleRecord } from "@/hooks/use-module-data";
import { toast } from "sonner";

interface NoticeRecord extends ModuleRecord {
  title: string;
  body?: string;
  category?: string;
  isPublished?: boolean;
  publishedAt?: string;
}

interface EventRecord extends ModuleRecord {
  title: string;
  date?: string;
  startTime?: string;
  location?: string;
  description?: string;
  isPublished?: boolean;
}

interface BlogRecord extends ModuleRecord {
  title: string;
  body?: string;
  author?: string;
  date?: string;
}

export function NoticesEventsPage() {
  const [activeTab, setActiveTab] = useState("notices");

  const tabs = [
    { label: "Notices", value: "notices" },
    { label: "Events", value: "events" },
    { label: "Blogs", value: "blogs" },
  ];

  return (
    <div>
      <PageHeader
        title="Notices & Events"
        subtitle="Manage announcements, events, and blog posts."
        actions={
          <button className="ap-btn-ghost">
            <Send className="w-4 h-4" /> Send Notification
          </button>
        }
      />
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
      <div className="mt-4">
        {activeTab === "notices" && <NoticesTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "blogs" && <BlogsTab />}
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS = ["Exam", "Admission", "Scholarship", "Fees", "Event", "General"];

export function NoticesTab() {
  const { rows: notices, loading, create, update, remove } = useModuleData("notices");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<NoticeRecord> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notices;
    return notices.filter((n) => (filter === "published" ? n.isPublished : !n.isPublished));
  }, [notices, filter]);

  const openAdd = () => {
    setEditing({
      title: "",
      body: "",
      category: "General",
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item: NoticeRecord) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing;
        await update(id, {
          title: data.title ?? "",
          body: data.body ?? "",
          category: data.category ?? "General",
          isPublished: data.isPublished ?? true,
        });
        toast.success("Notice updated");
      } else {
        await create({
          title: editing.title,
          body: editing.body ?? "",
          category: editing.category ?? "General",
          isPublished: editing.isPublished ?? true,
          publishedAt: new Date().toISOString(),
        });
        toast.success("Notice created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    await remove(id);
    toast.success("Notice deleted");
  };

  const handleTogglePublish = async (notice: NoticeRecord) => {
    try {
      await update(notice.id, { isPublished: !notice.isPublished });
      toast.success(notice.isPublished ? "Notice unpublished" : "Notice published");
    } catch {
      toast.error("Failed to update");
    }
  };

  const categoryBadge = (cat?: string) => {
    switch (cat) {
      case "Exam":
        return "danger";
      case "Admission":
        return "warning";
      case "Scholarship":
        return "success";
      case "Fees":
        return "info";
      case "Event":
        return "purple";
      default:
        return "info";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {["all", "published", "draft"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? "ap-grad text-white" : "ap-btn-ghost"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="ap-btn">
          <Plus className="w-4 h-4" /> Add Notice
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Panel title="No notices yet" subtitle="Create your first notice">
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {(filtered as NoticeRecord[]).map((notice) => (
            <motion.div
              key={notice.id}
              whileHover={{ x: 4 }}
              className="ap-card p-4 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-info)/0.1)] flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-[hsl(var(--ap-info))]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{notice.title}</h3>
                  <Badge tone={notice.isPublished ? "success" : "muted"}>
                    {notice.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {notice.category && (
                    <Badge tone={categoryBadge(notice.category) as any}>{notice.category}</Badge>
                  )}
                </div>
                {notice.body && (
                  <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">
                    {notice.body}
                  </p>
                )}
                {notice.publishedAt && (
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-2">
                    {new Date(notice.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleTogglePublish(notice)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                  title={notice.isPublished ? "Unpublish" : "Publish"}
                >
                  {notice.isPublished ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(notice)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <NoticeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editing={editing}
        setEditing={setEditing}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

export function NoticeModal({
  open,
  onClose,
  editing,
  setEditing,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  editing: Partial<NoticeRecord> | null;
  setEditing: (c: Partial<NoticeRecord> | null) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (!editing) return null;
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <h2 className="text-lg font-bold mb-4">{editing.id ? "Edit Notice" : "Add Notice"}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <input
            value={editing.title || ""}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
            placeholder="Notice title"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Body</label>
          <textarea
            value={editing.body || ""}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-24 resize-none"
            placeholder="Notice details..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <select
            value={editing.category || "General"}
            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.isPublished ?? true}
              onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
              className="rounded"
            />
            Published
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="ap-btn-ghost">
          Cancel
        </button>
        <button onClick={onSave} disabled={saving} className="ap-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editing.id ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
}

export function EventsTab() {
  const { rows: events, loading, create, update, remove } = useModuleData("events");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<EventRecord> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({
      title: "",
      description: "",
      date: "",
      startTime: "",
      location: "",
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item: EventRecord) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing;
        await update(id, {
          title: data.title ?? "",
          description: data.description ?? "",
          date: data.date ?? "",
          startTime: data.startTime ?? "",
          location: data.location ?? "",
          isPublished: data.isPublished ?? true,
        });
        toast.success("Event updated");
      } else {
        await create({
          title: editing.title,
          description: editing.description ?? "",
          date: editing.date ?? "",
          startTime: editing.startTime ?? "",
          location: editing.location ?? "",
          isPublished: editing.isPublished ?? true,
        });
        toast.success("Event created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await remove(id);
    toast.success("Event deleted");
  };

  const handleTogglePublish = async (event: EventRecord) => {
    try {
      await update(event.id, { isPublished: !event.isPublished });
      toast.success(event.isPublished ? "Event unpublished" : "Event published");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[hsl(var(--ap-muted))]">{events.length} events</p>
        <button onClick={openAdd} className="ap-btn">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Panel title="No events yet" subtitle="Create your first event">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(events as EventRecord[]).map((event) => (
            <motion.div key={event.id} whileHover={{ y: -4 }} className="ap-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={event.isPublished ? "success" : "muted"}>
                    {event.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {event.date && <Badge tone="purple">{event.date}</Badge>}
                </div>
                <h3 className="font-bold mt-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.location && (
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-2">{event.location}</p>
                )}
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => handleTogglePublish(event)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(event)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        size="lg"
      >
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Event" : "Add Event"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <input
                  type="date"
                  value={editing.date || ""}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Start Time</label>
                <input
                  type="time"
                  value={editing.startTime || ""}
                  onChange={(e) => setEditing({ ...editing, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input
                  value={editing.location || ""}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isPublished ?? true}
                  onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                  className="rounded"
                />
                Published
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            className="ap-btn-ghost"
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export function BlogsTab() {
  const { rows: blogs, loading, create, update, remove } = useModuleData("blogs");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BlogRecord> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({
      title: "",
      body: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const openEdit = (item: BlogRecord) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing;
        await update(id, {
          title: data.title ?? "",
          body: data.body ?? "",
          author: data.author ?? "",
          date: data.date ?? "",
        });
        toast.success("Blog updated");
      } else {
        await create({
          title: editing.title,
          body: editing.body ?? "",
          author: editing.author ?? "",
          date: editing.date ?? new Date().toISOString().split("T")[0],
        });
        toast.success("Blog created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await remove(id);
    toast.success("Blog deleted");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[hsl(var(--ap-muted))]">{blogs.length} blog posts</p>
        <button onClick={openAdd} className="ap-btn">
          <Plus className="w-4 h-4" /> Add Blog
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <Panel title="No blogs yet" subtitle="Write your first blog post">
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {(blogs as BlogRecord[]).map((blog) => (
            <motion.div
              key={blog.id}
              whileHover={{ x: 4 }}
              className="ap-card p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{blog.title}</h3>
                </div>
                {blog.body && (
                  <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-1">
                    {blog.body}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {blog.author && (
                    <p className="text-xs text-[hsl(var(--ap-muted))]">By {blog.author}</p>
                  )}
                  {blog.date && <p className="text-xs text-[hsl(var(--ap-muted))]">{blog.date}</p>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(blog)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        size="lg"
      >
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Blog" : "Add Blog"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Body</label>
              <textarea
                value={editing.body || ""}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-24 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Author</label>
                <input
                  value={editing.author || ""}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <input
                  type="date"
                  value={editing.date || ""}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm"
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            className="ap-btn-ghost"
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}
