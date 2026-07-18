import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Bell, Plus, Pencil, Trash2, Calendar, Megaphone, Newspaper, Search,
  Save, Loader2, Eye, Clock, Users, AlertCircle, CheckCircle, X,
  Image, Send, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge, Tabs, Modal, Skeleton } from "@/components/admin/ui";
import { useCmsNotices, useCmsEvents, useCmsBlogs, type CmsItem } from "@/hooks/use-notices-events-blogs";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "sonner";

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
          <button className="ap-btn-ghost"><Send className="w-4 h-4" /> Send Notification</button>
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

/* ================================================================ */
/*  NOTICES TAB                                                     */
/* ================================================================ */
export function NoticesTab() {
  const { items: notices, isLoading, addItem, updateItem, deleteItem, toggleItem } = useCmsNotices();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notices;
    return notices.filter((n) => filter === "published" ? n.isPublished : !n.isPublished);
  }, [notices, filter]);

  const openAdd = () => {
    setEditing({ title: "", description: "", imageUrl: "", link: "", order: notices.length, isActive: true, isPublished: true, category: "general" });
    setModalOpen(true);
  };

  const openEdit = (item: CmsItem) => { setEditing({ ...item }); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing.id) { await updateItem.mutateAsync(editing as CmsItem); toast.success("Notice updated"); }
      else { await addItem.mutateAsync(editing as Omit<CmsItem, "id">); toast.success("Notice created"); }
      setModalOpen(false); setEditing(null);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    await deleteItem.mutateAsync(id);
    toast.success("Notice deleted");
  };

  const priorityColor = (p?: string) => {
    switch (p) {
      case "urgent": return "danger";
      case "important": return "warning";
      default: return "info";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {["all", "published", "draft"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? "ap-grad text-white" : "ap-btn-ghost"}`}>{f}</button>
          ))}
        </div>
        <button onClick={openAdd} className="ap-btn"><Plus className="w-4 h-4" /> Add Notice</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel title="No notices yet" subtitle="Create your first notice">
          <div className="text-center py-8"><Bell className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice) => (
            <motion.div key={notice.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-info)/0.1)] flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-[hsl(var(--ap-info))]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{notice.title}</h3>
                  <Badge tone={notice.isPublished ? "success" : "muted"}>{notice.isPublished ? "Published" : "Draft"}</Badge>
                  {notice.category && <Badge tone={priorityColor(notice.category) as any}>{notice.category}</Badge>}
                </div>
                {notice.description && <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">{notice.description}</p>}
                {notice.createdAt && <p className="text-xs text-[hsl(var(--ap-muted))] mt-2">{notice.createdAt?.toDate?.() ? new Date(notice.createdAt.toDate()).toLocaleDateString() : "—"}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleItem.mutate({ id: notice.id, field: "isPublished", value: !notice.isPublished })} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]" title={notice.isPublished ? "Unpublish" : "Publish"}>
                  {notice.isPublished ? <Eye className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" />}
                </button>
                <button onClick={() => openEdit(notice)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(notice.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <NoticeModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} editing={editing} setEditing={setEditing} onSave={handleSave} saving={saving} />
    </>
  );
}

export function NoticeModal({ open, onClose, editing, setEditing, onSave, saving }: {
  open: boolean; onClose: () => void; editing: Partial<CmsItem> | null;
  setEditing: (c: Partial<CmsItem> | null) => void; onSave: () => void; saving: boolean;
}) {
  if (!editing) return null;
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <h2 className="text-lg font-bold mb-4">{editing.id ? "Edit Notice" : "Add Notice"}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="Notice title" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-24 resize-none" placeholder="Notice details..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select value={editing.category || "general"} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
              <option value="general">General</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Image</label>
            <ImageUpload value={editing.imageUrl || ""} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="notices" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isPublished ?? true} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="rounded" />
            Active
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="ap-btn-ghost">Cancel</button>
        <button onClick={onSave} disabled={saving} className="ap-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editing.id ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================ */
/*  EVENTS TAB                                                      */
/* ================================================================ */
export function EventsTab() {
  const { items: events, isLoading, addItem, updateItem, deleteItem, toggleItem } = useCmsEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ title: "", description: "", imageUrl: "", link: "", order: events.length, isActive: true, isPublished: true, eventDate: "", eventTime: "", location: "" });
    setModalOpen(true);
  };

  const openEdit = (item: CmsItem) => { setEditing({ ...item }); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing.id) { await updateItem.mutateAsync(editing as CmsItem); toast.success("Event updated"); }
      else { await addItem.mutateAsync(editing as Omit<CmsItem, "id">); toast.success("Event created"); }
      setModalOpen(false); setEditing(null);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteItem.mutateAsync(id);
    toast.success("Event deleted");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[hsl(var(--ap-muted))]">{events.length} events</p>
        <button onClick={openAdd} className="ap-btn"><Plus className="w-4 h-4" /> Add Event</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : events.length === 0 ? (
        <Panel title="No events yet" subtitle="Create your first event">
          <div className="text-center py-8"><Calendar className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <motion.div key={event.id} whileHover={{ y: -4 }} className="ap-card overflow-hidden">
              {event.imageUrl && (
                <div className="h-32 bg-gradient-to-br from-[hsl(var(--ap-blue)/0.2)] to-[hsl(var(--ap-orange)/0.2)]">
                  <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={event.isPublished ? "success" : "muted"}>{event.isPublished ? "Published" : "Draft"}</Badge>
                  {event.eventDate && <Badge tone="purple">{event.eventDate}</Badge>}
                </div>
                <h3 className="font-bold mt-2">{event.title}</h3>
                {event.description && <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">{event.description}</p>}
                {event.location && <p className="text-xs text-[hsl(var(--ap-muted))] mt-2"> {event.location}</p>}
                <div className="flex gap-1 mt-3">
                  <button onClick={() => toggleItem.mutate({ id: event.id, field: "isPublished", value: !event.isPublished })} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="lg">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Event" : "Add Event"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-20 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Event Date</label>
                <input type="date" value={editing.eventDate || ""} onChange={(e) => setEditing({ ...editing, eventDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Event Time</label>
                <input type="time" value={editing.eventTime || ""} onChange={(e) => setEditing({ ...editing, eventTime: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image</label>
              <ImageUpload value={editing.imageUrl || ""} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="events" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished ?? true} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
                Published
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); setEditing(null); }} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ================================================================ */
/*  BLOGS TAB                                                       */
/* ================================================================ */
export function BlogsTab() {
  const { items: blogs, isLoading, addItem, updateItem, deleteItem, toggleItem } = useCmsBlogs();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ title: "", description: "", imageUrl: "", link: "", order: blogs.length, isActive: true, isPublished: true, author: "", tags: [] });
    setModalOpen(true);
  };

  const openEdit = (item: CmsItem) => { setEditing({ ...item }); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing.id) { await updateItem.mutateAsync(editing as CmsItem); toast.success("Blog updated"); }
      else { await addItem.mutateAsync(editing as Omit<CmsItem, "id">); toast.success("Blog created"); }
      setModalOpen(false); setEditing(null);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await deleteItem.mutateAsync(id);
    toast.success("Blog deleted");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[hsl(var(--ap-muted))]">{blogs.length} blog posts</p>
        <button onClick={openAdd} className="ap-btn"><Plus className="w-4 h-4" /> Add Blog</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : blogs.length === 0 ? (
        <Panel title="No blogs yet" subtitle="Write your first blog post">
          <div className="text-center py-8"><Newspaper className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <motion.div key={blog.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-start gap-4">
              {blog.imageUrl && (
                <img src={blog.imageUrl} alt="" className="w-20 h-14 object-cover rounded-lg border border-[hsl(var(--ap-border))]" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{blog.title}</h3>
                  <Badge tone={blog.isPublished ? "success" : "muted"}>{blog.isPublished ? "Published" : "Draft"}</Badge>
                </div>
                {blog.description && <p className="text-sm text-[hsl(var(--ap-muted))] mt-1 line-clamp-1">{blog.description}</p>}
                {blog.author && <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">By {blog.author}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleItem.mutate({ id: blog.id, field: "isPublished", value: !blog.isPublished })} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => openEdit(blog)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(blog.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="lg">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Blog" : "Add Blog"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Author</label>
                <input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Image</label>
                <ImageUpload value={editing.imageUrl || ""} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="blogs" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished ?? true} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
                Published
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); setEditing(null); }} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}


