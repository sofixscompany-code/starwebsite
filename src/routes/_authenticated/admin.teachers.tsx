import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Users, BookOpen, Calendar, FileText, Upload, Download, Search, Filter,
  Plus, Edit, Trash2, Eye, Clock, CheckCircle, TrendingUp, BarChart3,
  PlayCircle, File, Bell, Settings, Save, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, ProgressBar, Modal, Skeleton } from "@/components/admin/ui";
import { useTeacherClasses, useTeacherStudentProgress, useTeacherContent, useTeacherStats } from "@/hooks/use-teacher";
import { useCourses } from "@/hooks/use-lms";
import { toast } from "sonner";

const DEMO_TEACHER_ID = "demo_teacher_001";

export function TeacherPortalPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = useTeacherStats(DEMO_TEACHER_ID);

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "My Classes", value: "classes" },
    { label: "Students", value: "students" },
    { label: "Content", value: "content" },
    { label: "Grading", value: "grading" },
  ];

  return (
    <div>
      <PageHeader
        title="Teacher Portal"
        subtitle="Manage your classes, track student progress, and create content."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="My Classes" value={stats?.totalClasses ?? 0} icon={Calendar} tone="purple" />
            <StatCard label="Students" value={stats?.totalStudents ?? 0} icon={Users} tone="info" />
            <StatCard label="Content Items" value={stats?.totalContent ?? 0} icon={FileText} tone="orange" />
            <StatCard label="Published" value={stats?.publishedContent ?? 0} icon={CheckCircle} tone="success" />
          </>
        )}
      </div>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "classes" && <ClassesTab />}
        {activeTab === "students" && <StudentsTab />}
        {activeTab === "content" && <ContentTab />}
        {activeTab === "grading" && <GradingTab />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                    */
/* ================================================================ */
export function OverviewTab() {
  const { classes, getTodayClasses, isLoading: classesLoading } = useTeacherClasses(DEMO_TEACHER_ID);
  const { students, isLoading: studentsLoading } = useTeacherStudentProgress(DEMO_TEACHER_ID);
  const { content, isLoading: contentLoading } = useTeacherContent(DEMO_TEACHER_ID);

  const todayClasses = getTodayClasses();
  const recentContent = content.slice(0, 3);
  const topStudents = [...students].sort((a, b) => b.avgMarks - a.avgMarks).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Today's Classes */}
      <Panel title="Today's Classes">
        {classesLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : todayClasses.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No classes today</p>
        ) : (
          <div className="space-y-2">
            {todayClasses.map((cls) => (
              <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--ap-blue)/0.04)] border border-[hsl(var(--ap-blue)/0.1)]">
                <div className="w-10 h-10 rounded-lg ap-grad flex items-center justify-center text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{cls.courseName}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{cls.startTime} - {cls.endTime} · {cls.room}</p>
                </div>
                <span className="text-xs font-bold text-[hsl(var(--ap-muted))]">{cls.studentCount} students</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Top Students */}
      <Panel title="Top Students">
        {studentsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : topStudents.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No student data yet</p>
        ) : (
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.2)]">
                <span className="text-xs font-bold text-[hsl(var(--ap-muted))] w-4">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.studentName}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{s.courseName}</p>
                </div>
                <span className="text-sm font-bold">{s.avgMarks}%</span>
                <Badge tone={s.status === "excellent" ? "success" : s.status === "good" ? "info" : s.status === "needs_improvement" ? "warning" : "danger"}>
                  {s.status === "needs_improvement" ? "Needs Work" : s.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Recent Content */}
      <Panel title="Recent Content">
        {contentLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : recentContent.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No content yet</p>
        ) : (
          <div className="space-y-2">
            {recentContent.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--ap-blue)/0.08)] flex items-center justify-center">
                  {c.type === "video" ? <PlayCircle className="w-4 h-4 text-[hsl(var(--ap-blue))]" /> :
                   c.type === "notes" ? <FileText className="w-4 h-4 text-[hsl(var(--ap-orange))]" /> :
                   <File className="w-4 h-4 text-[hsl(var(--ap-muted))]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{c.courseName}</p>
                </div>
                <Badge tone={c.isPublished ? "success" : "muted"}>{c.isPublished ? "Published" : "Draft"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Class Summary */}
      <Panel title="Class Summary" className="lg:col-span-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Classes", value: classes.length, icon: Calendar, tone: "purple" },
            { label: "Active Students", value: students.length, icon: Users, tone: "info" },
            { label: "Avg Attendance", value: `${students.length > 0 ? Math.round(students.reduce((s, st) => s + st.attendanceRate, 0) / students.length) : 0}%`, icon: CheckCircle, tone: "success" },
            { label: "Avg Marks", value: `${students.length > 0 ? Math.round(students.reduce((s, st) => s + st.avgMarks, 0) / students.length) : 0}%`, icon: TrendingUp, tone: "orange" },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-[hsl(var(--ap-border)/0.2)]">
              <item.icon className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--ap-muted))]" />
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))]">{item.label}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  CLASSES TAB                                                     */
/* ================================================================ */
export function ClassesTab() {
  const { classes, isLoading, addClass, updateClass, deleteClass } = useTeacherClasses(DEMO_TEACHER_ID);
  const { courses } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ teacherId: DEMO_TEACHER_ID, courseId: "", courseName: "", day: "Monday", startTime: "09:00", endTime: "10:00", room: "", studentCount: 0, type: "lecture", isActive: true });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.courseId) {
      toast.error("Please select a course");
      return;
    }
    setSaving(true);
    try {
      const course = courses.find((c) => c.id === editing.courseId);
      const data = { ...editing, courseName: course?.title || editing.courseName };
      if (editing.id) {
        await updateClass.mutateAsync(data);
        toast.success("Class updated");
      } else {
        await addClass.mutateAsync(data);
        toast.success("Class created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    await deleteClass.mutateAsync(id);
    toast.success("Class deleted");
  };

  return (
    <>
      <Toolbar>
        <button onClick={openAdd} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Add Class</button>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : classes.length === 0 ? (
        <Panel title="No classes yet" subtitle="Add your first class to get started">
          <div className="text-center py-8"><Calendar className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <motion.div key={cls.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-center gap-4">
              <div className="w-14 text-center">
                <p className="text-xs text-[hsl(var(--ap-muted))]">{cls.day.slice(0, 3)}</p>
                <p className="text-sm font-bold">{cls.startTime}</p>
              </div>
              <div className="w-px h-10 bg-[hsl(var(--ap-border))]" />
              <div className="flex-1">
                <p className="font-semibold">{cls.courseName}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">Room {cls.room} · {cls.studentCount} students</p>
              </div>
              <Badge tone={cls.type === "lecture" ? "purple" : cls.type === "lab" ? "orange" : "info"}>{cls.type}</Badge>
              <span className="text-xs text-[hsl(var(--ap-muted))]">{cls.startTime} - {cls.endTime}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cls); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(cls.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="md">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Class" : "Add Class"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course *</label>
              <select value={editing.courseId || ""} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Day</label>
                <select value={editing.day || "Monday"} onChange={(e) => setEditing({ ...editing, day: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select value={editing.type || "lecture"} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Time</label>
                <input type="time" value={editing.startTime || ""} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Time</label>
                <input type="time" value={editing.endTime || ""} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Room</label>
                <input value={editing.room || ""} onChange={(e) => setEditing({ ...editing, room: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="e.g. Room 101" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Students</label>
                <input type="number" value={editing.studentCount || 0} onChange={(e) => setEditing({ ...editing, studentCount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
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
/*  STUDENTS TAB                                                    */
/* ================================================================ */
export function StudentsTab() {
  const { students, isLoading } = useTeacherStudentProgress(DEMO_TEACHER_ID);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search || s.studentName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, search, filterStatus]);

  const statusColor = (s: string) => {
    switch (s) {
      case "excellent": return "success";
      case "good": return "info";
      case "needs_improvement": return "warning";
      case "at_risk": return "danger";
      default: return "muted";
    }
  };

  return (
    <>
      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="ap-input pl-9" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="ap-input max-w-[160px]">
          <option value="all">All Status</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_improvement">Needs Improvement</option>
          <option value="at_risk">At Risk</option>
        </select>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: "studentName", label: "Student", render: (r) => <span className="font-bold">{r.studentName}</span> },
            { key: "courseName", label: "Course" },
            { key: "attendanceRate", label: "Attendance", render: (r) => (
              <div className="flex items-center gap-2">
                <ProgressBar value={r.attendanceRate} tone={r.attendanceRate >= 80 ? "success" : r.attendanceRate >= 60 ? "warning" : "danger"} />
                <span className="text-xs font-bold w-8">{r.attendanceRate}%</span>
              </div>
            )},
            { key: "avgMarks", label: "Avg Marks", render: (r) => <span className="font-bold">{r.avgMarks}%</span> },
            { key: "assignmentsCompleted", label: "Assignments", render: (r) => `${r.assignmentsCompleted}/${r.assignmentsTotal}` },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusColor(r.status) as any}>{r.status === "needs_improvement" ? "Needs Work" : r.status}</Badge> },
          ]}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  CONTENT TAB                                                     */
/* ================================================================ */
export function ContentTab() {
  const { content, isLoading, addContent, updateContent, deleteContent } = useTeacherContent(DEMO_TEACHER_ID);
  const { courses } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return content;
    return content.filter((c) => c.type === typeFilter);
  }, [content, typeFilter]);

  const openAdd = () => {
    setEditing({ teacherId: DEMO_TEACHER_ID, courseId: "", courseName: "", title: "", type: "notes", description: "", fileUrl: "", isPublished: false });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const course = courses.find((c) => c.id === editing.courseId);
      const data = { ...editing, courseName: course?.title || editing.courseName };
      if (editing.id) {
        await updateContent.mutateAsync(data);
        toast.success("Content updated");
      } else {
        await addContent.mutateAsync(data);
        toast.success("Content created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await deleteContent.mutateAsync(id);
    toast.success("Content deleted");
  };

  const typeIcon = (t: string) => {
    switch (t) {
      case "video": return <PlayCircle className="w-4 h-4 text-[hsl(var(--ap-blue))]" />;
      case "notes": return <FileText className="w-4 h-4 text-[hsl(var(--ap-orange))]" />;
      case "assignment": return <File className="w-4 h-4 text-[hsl(var(--ap-success))]" />;
      case "quiz": return <BarChart3 className="w-4 h-4 text-[hsl(var(--ap-purple))]" />;
      case "announcement": return <Bell className="w-4 h-4 text-[hsl(var(--ap-danger))]" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Toolbar>
        <div className="flex gap-1">
          {["all", "video", "notes", "assignment", "quiz", "announcement"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${typeFilter === t ? "ap-grad text-white" : "ap-btn-ghost"}`}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Add Content</button>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel title="No content yet" subtitle="Create your first content item">
          <div className="text-center py-8"><FileText className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <motion.div key={item.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--ap-blue)/0.08)] flex items-center justify-center">
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.title}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{item.courseName} · {item.type}</p>
              </div>
              <Badge tone={item.isPublished ? "success" : "muted"}>{item.isPublished ? "Published" : "Draft"}</Badge>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(item); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="md">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Content" : "Add Content"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="Content title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Course</label>
                <select value={editing.courseId || ""} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select value={editing.type || "notes"} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="video">Video</option>
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-20 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File URL</label>
              <input value={editing.fileUrl || ""} onChange={(e) => setEditing({ ...editing, fileUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="https://..." />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isPublished ?? false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
              Published
            </label>
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
/*  GRADING TAB                                                     */
/* ================================================================ */
export function GradingTab() {
  const { students, isLoading } = useTeacherStudentProgress(DEMO_TEACHER_ID);

  return (
    <Panel title="Student Grading" subtitle="View and manage student grades">
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : students.length === 0 ? (
        <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-8">No students to grade yet</p>
      ) : (
        <DataTable
          rows={students}
          columns={[
            { key: "studentName", label: "Student", render: (r) => <span className="font-bold">{r.studentName}</span> },
            { key: "courseName", label: "Course" },
            { key: "avgMarks", label: "Average", render: (r) => (
              <div className="flex items-center gap-2">
                <ProgressBar value={r.avgMarks} tone={r.avgMarks >= 70 ? "success" : r.avgMarks >= 50 ? "warning" : "danger"} />
                <span className="text-xs font-bold w-8">{r.avgMarks}%</span>
              </div>
            )},
            { key: "attendanceRate", label: "Attendance", render: (r) => <span className="font-bold">{r.attendanceRate}%</span> },
            { key: "status", label: "Status", render: (r) => (
              <Badge tone={r.status === "excellent" ? "success" : r.status === "good" ? "info" : r.status === "needs_improvement" ? "warning" : "danger"}>
                {r.status === "needs_improvement" ? "Needs Work" : r.status}
              </Badge>
            )},
          ]}
        />
      )}
    </Panel>
  );
}


