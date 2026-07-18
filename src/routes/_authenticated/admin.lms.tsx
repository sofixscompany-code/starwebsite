import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  PlayCircle, BookOpen, FileText, PenSquare, Award, Download, Search, Filter,
  Eye, Edit, Trash2, Play, Clock, Users, Star, Video, Plus, FolderOpen, Bookmark,
  GraduationCap, BarChart3, CheckCircle, XCircle, ArrowLeft, Save,
  Loader2, GripVertical, HelpCircle, ToggleLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, ProgressBar, Modal, Skeleton } from "@/components/admin/ui";
import { useCourses, useLessons, useQuizzes, useEnrollments, useQuizAttempts, useLmsStats, type Course, type Lesson, type Quiz } from "@/hooks/use-lms";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "sonner";

/* ================================================================ */
/*  MAIN LMS PAGE                                                   */
/* ================================================================ */
export function LMSPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const { data: stats, isLoading: statsLoading } = useLmsStats();

  const tabs = [
    { label: "Courses", value: "courses" },
    { label: "Lessons", value: "lessons" },
    { label: "Quizzes", value: "quizzes" },
    { label: "Enrollments", value: "enrollments" },
    { label: "Analytics", value: "analytics" },
  ];

  return (
    <div>
      <PageHeader
        title="Learning Management System"
        subtitle="Manage courses, lessons, quizzes, enrollments & student progress."
        actions={
          <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
        }
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
            <StatCard label="Total Courses" value={stats?.totalCourses ?? 0} icon={BookOpen} tone="purple" />
            <StatCard label="Active Enrollments" value={stats?.activeEnrollments ?? 0} icon={GraduationCap} tone="info" />
            <StatCard label="Total Lessons" value={stats?.totalLessons ?? 0} icon={PlayCircle} tone="orange" />
            <StatCard label="Quizzes" value={stats?.totalQuizzes ?? 0} icon={HelpCircle} tone="success" />
          </>
        )}
      </div>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "lessons" && <LessonsTab />}
        {activeTab === "quizzes" && <QuizzesTab />}
        {activeTab === "enrollments" && <EnrollmentsTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  COURSES TAB                                                     */
/* ================================================================ */
export function CoursesTab() {
  const { courses, isLoading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Course> | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || c.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [courses, search, filterCat]);

  const openAdd = () => {
    setEditing({ title: "", slug: "", description: "", shortDescription: "", imageUrl: "", category: "", level: "beginner", duration: "", price: 0, discountPrice: 0, totalLessons: 0, totalStudents: 0, rating: 0, instructor: "", instructorAvatar: "", tags: [], isPublished: false, isActive: true, order: courses.length });
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing({ ...course });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Course title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await updateCourse.mutateAsync(editing as Course);
        toast.success("Course updated");
      } else {
        const slug = editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await addCourse.mutateAsync({ ...editing, slug } as Omit<Course, "id">);
        toast.success("Course created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteCourse.mutateAsync(id);
    toast.success("Course deleted");
  };

  return (
    <>
      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="ap-input pl-9" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="ap-input max-w-[160px]">
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <button onClick={openAdd} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Add Course</button>
      </Toolbar>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Panel title="No courses found" subtitle={search ? "Try a different search" : "Create your first course to get started"}>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
            <button onClick={openAdd} className="ap-btn mt-2"><Plus className="w-4 h-4" /> Add Course</button>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <motion.div key={course.id} whileHover={{ y: -4 }} className="ap-card overflow-hidden group">
              <div className="relative h-40 bg-gradient-to-br from-[hsl(var(--ap-blue)/0.2)] to-[hsl(var(--ap-orange)/0.2)] flex items-center justify-center">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-10 h-10 text-[hsl(var(--ap-muted))]" />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge tone={course.isPublished ? "success" : "muted"}>{course.isPublished ? "Published" : "Draft"}</Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge tone="purple">{course.level}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm truncate">{course.title}</h3>
                <p className="text-xs text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">{course.shortDescription || course.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[hsl(var(--ap-muted))]">
                  <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {course.totalLessons} lessons</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.totalStudents}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[hsl(var(--ap-warning))]" /> {course.rating || "—"}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--ap-border))]">
                  <div>
                    {course.discountPrice > 0 && course.discountPrice < course.price ? (
                      <span className="text-sm font-bold text-[hsl(var(--ap-blue))]">Rs. {course.discountPrice}</span>
                    ) : (
                      <span className="text-sm font-bold">{course.price > 0 ? `Rs. ${course.price}` : "Free"}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(course.id, course.title)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CourseModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} editing={editing} setEditing={setEditing} onSave={handleSave} saving={saving} />
    </>
  );
}

/* -------------------- COURSE MODAL -------------------- */
export function CourseModal({ open, onClose, editing, setEditing, onSave, saving }: {
  open: boolean; onClose: () => void; editing: Partial<Course> | null;
  setEditing: (c: Partial<Course> | null) => void; onSave: () => void; saving: boolean;
}) {
  if (!editing) return null;
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <h2 className="text-lg font-bold mb-4">{editing.id ? "Edit Course" : "Add Course"}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Cover Image</label>
          <ImageUpload value={editing.imageUrl || ""} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="lms/courses" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Course Title *</label>
            <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]" placeholder="e.g. Nepal Police Preparation" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]" placeholder="e.g. GK, Math, English" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Short Description</label>
          <input value={editing.shortDescription || ""} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]" placeholder="One-line description" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Full Description</label>
          <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))] h-24 resize-none" placeholder="Course description..." />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Level</label>
            <select value={editing.level || "beginner"} onChange={(e) => setEditing({ ...editing, level: e.target.value as any })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Duration</label>
            <input value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="e.g. 3 months" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Instructor</label>
            <input value={editing.instructor || ""} onChange={(e) => setEditing({ ...editing, instructor: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="Teacher name" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Price (Rs.)</label>
            <input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Discount Price (Rs.)</label>
            <input type="number" value={editing.discountPrice || 0} onChange={(e) => setEditing({ ...editing, discountPrice: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isPublished ?? false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
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
          {editing.id ? "Update" : "Create"} Course
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================ */
/*  LESSONS TAB                                                     */
/* ================================================================ */
export function LessonsTab() {
  const { courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { lessons, isLoading, addLesson, updateLesson, deleteLesson } = useLessons(selectedCourse || undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ courseId: selectedCourse, title: "", description: "", videoUrl: "", documentUrl: "", duration: "", order: lessons.length, isPublished: false, isFree: false });
    setModalOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing({ ...lesson });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Lesson title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await updateLesson.mutateAsync(editing as Lesson);
        toast.success("Lesson updated");
      } else {
        await addLesson.mutateAsync(editing as Omit<Lesson, "id">);
        toast.success("Lesson created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await deleteLesson.mutateAsync(id);
    toast.success("Lesson deleted");
  };

  return (
    <>
      <Toolbar>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="ap-input max-w-[240px]">
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button onClick={openAdd} disabled={!selectedCourse} className="ap-btn ml-auto disabled:opacity-50"><Plus className="w-4 h-4" /> Add Lesson</button>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : lessons.length === 0 ? (
        <Panel title="No lessons yet" subtitle={selectedCourse ? "Add lessons to this course" : "Select a course first"}>
          <div className="text-center py-8">
            <PlayCircle className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <DataTable
          rows={lessons}
          columns={[
            { key: "order", label: "#", render: (r) => <span className="font-bold text-[hsl(var(--ap-muted))]">{r.order}</span> },
            { key: "title", label: "Lesson", render: (r) => <span className="font-bold">{r.title}</span> },
            { key: "duration", label: "Duration" },
            { key: "videoUrl", label: "Video", render: (r) => r.videoUrl ? <Badge tone="success">Has Video</Badge> : <Badge tone="muted">No Video</Badge> },
            { key: "isFree", label: "Access", render: (r) => r.isFree ? <Badge tone="success">Free</Badge> : <Badge tone="purple">Paid</Badge> },
            { key: "isPublished", label: "Status", render: (r) => <Badge tone={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge> },
          ]}
          actions={(r) => (
            <div className="flex gap-1">
              <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
            </div>
          )}
        />
      )}

      <LessonModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} editing={editing} setEditing={setEditing} onSave={handleSave} saving={saving} />
    </>
  );
}

export function LessonModal({ open, onClose, editing, setEditing, onSave, saving }: {
  open: boolean; onClose: () => void; editing: Partial<Lesson> | null;
  setEditing: (l: Partial<Lesson> | null) => void; onSave: () => void; saving: boolean;
}) {
  if (!editing) return null;
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <h2 className="text-lg font-bold mb-4">{editing.id ? "Edit Lesson" : "Add Lesson"}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Lesson Title *</label>
          <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]" placeholder="e.g. Introduction to Constitution" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))] h-20 resize-none" placeholder="What this lesson covers..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Video URL</label>
            <input value={editing.videoUrl || ""} onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Document URL</label>
            <input value={editing.documentUrl || ""} onChange={(e) => setEditing({ ...editing, documentUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="https://..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Duration</label>
            <input value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="e.g. 45 min" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Order</label>
            <input type="number" value={editing.order || 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isPublished ?? false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isFree ?? false} onChange={(e) => setEditing({ ...editing, isFree: e.target.checked })} className="rounded" />
            Free Access
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="ap-btn-ghost">Cancel</button>
        <button onClick={onSave} disabled={saving} className="ap-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editing.id ? "Update" : "Create"} Lesson
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================ */
/*  QUIZZES TAB                                                     */
/* ================================================================ */
export function QuizzesTab() {
  const { courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { quizzes, isLoading, addQuiz, updateQuiz, deleteQuiz } = useQuizzes(selectedCourse || undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Quiz> | null>(null);
  const [saving, setSaving] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: "", type: "mcq" as const, options: ["", "", "", ""], correctAnswer: "", points: 1 });

  const openAdd = () => {
    setEditing({ courseId: selectedCourse, title: "", description: "", timeLimit: 30, passingScore: 60, totalQuestions: 0, questions: [], isPublished: false });
    setModalOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditing({ ...quiz });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) {
      toast.error("Quiz title is required");
      return;
    }
    setSaving(true);
    try {
      const data = { ...editing, totalQuestions: editing.questions?.length ?? 0 };
      if (editing.id) {
        await updateQuiz.mutateAsync(data as Quiz);
        toast.success("Quiz updated");
      } else {
        await addQuiz.mutateAsync(data as Omit<Quiz, "id">);
        toast.success("Quiz created");
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    await deleteQuiz.mutateAsync(id);
    toast.success("Quiz deleted");
  };

  const addQuestion = () => {
    if (!newQuestion.question) return;
    const q = { ...newQuestion, id: `q_${Date.now()}` };
    setEditing({ ...editing, questions: [...(editing?.questions ?? []), q] });
    setNewQuestion({ question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1 });
    setQuestionModal(false);
    toast.success("Question added");
  };

  const removeQuestion = (qid: string) => {
    setEditing({ ...editing, questions: editing?.questions?.filter((q) => q.id !== qid) });
  };

  return (
    <>
      <Toolbar>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="ap-input max-w-[240px]">
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button onClick={openAdd} disabled={!selectedCourse} className="ap-btn ml-auto disabled:opacity-50"><Plus className="w-4 h-4" /> Add Quiz</button>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : quizzes.length === 0 ? (
        <Panel title="No quizzes yet" subtitle={selectedCourse ? "Create quizzes for this course" : "Select a course first"}>
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <DataTable
          rows={quizzes}
          columns={[
            { key: "title", label: "Quiz", render: (r) => <span className="font-bold">{r.title}</span> },
            { key: "totalQuestions", label: "Questions", render: (r) => <span className="font-bold">{r.totalQuestions}</span> },
            { key: "timeLimit", label: "Time Limit", render: (r) => `${r.timeLimit} min` },
            { key: "passingScore", label: "Pass Score", render: (r) => `${r.passingScore}%` },
            { key: "isPublished", label: "Status", render: (r) => <Badge tone={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge> },
          ]}
          actions={(r) => (
            <div className="flex gap-1">
              <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
            </div>
          )}
        />
      )}

      {/* Quiz Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="lg">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Quiz" : "Add Quiz"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Quiz Title *</label>
              <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm focus:outline-none focus:border-[hsl(var(--ap-blue))]" placeholder="e.g. Chapter 1 Test" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-16 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Time Limit (min)</label>
                <input type="number" value={editing.timeLimit || 30} onChange={(e) => setEditing({ ...editing, timeLimit: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Passing Score (%)</label>
                <input type="number" value={editing.passingScore || 60} onChange={(e) => setEditing({ ...editing, passingScore: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.isPublished ?? false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="rounded" />
                  Published
                </label>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Questions ({editing.questions?.length ?? 0})</label>
                <button onClick={() => setQuestionModal(true)} className="text-xs ap-btn-ghost !py-1"><Plus className="w-3 h-3" /> Add Question</button>
              </div>
              {editing.questions && editing.questions.length > 0 ? (
                <div className="space-y-2">
                  {editing.questions.map((q, i) => (
                    <div key={q.id} className="ap-card p-3 flex items-start gap-3">
                      <span className="text-xs font-bold text-[hsl(var(--ap-muted))] mt-1">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.question}</p>
                        <p className="text-xs text-[hsl(var(--ap-muted))]">{q.type} · {q.points} pt · Answer: {q.correctAnswer}</p>
                      </div>
                      <button onClick={() => removeQuestion(q.id)} className="p-1 rounded hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3 h-3 text-[hsl(var(--ap-danger))]" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[hsl(var(--ap-muted))] text-center py-4">No questions added yet</p>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); setEditing(null); }} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"} Quiz
          </button>
        </div>
      </Modal>

      {/* Add Question Modal */}
      <Modal open={questionModal} onClose={() => setQuestionModal(false)} size="md">
        <h2 className="text-lg font-bold mb-4">Add Question</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Question *</label>
            <textarea value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-16 resize-none" placeholder="Type your question..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select value={newQuestion.type} onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                <option value="mcq">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Points</label>
              <input type="number" value={newQuestion.points} onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
            </div>
          </div>
          {newQuestion.type === "mcq" && (
            <div>
              <label className="text-sm font-medium mb-1 block">Options</label>
              {newQuestion.options.map((opt, i) => (
                <input key={i} value={opt} onChange={(e) => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion({ ...newQuestion, options: opts }); }} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm mb-2" placeholder={`Option ${i + 1}`} />
              ))}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Correct Answer *</label>
            <input value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder={(newQuestion.type as string) === "true_false" ? "true or false" : "Correct answer"} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setQuestionModal(false)} className="ap-btn-ghost">Cancel</button>
          <button onClick={addQuestion} className="ap-btn"><Plus className="w-4 h-4" /> Add Question</button>
        </div>
      </Modal>
    </>
  );
}

/* ================================================================ */
/*  ENROLLMENTS TAB                                                 */
/* ================================================================ */
export function EnrollmentsTab() {
  const { enrollments, isLoading, enrollStudent, updateEnrollment } = useEnrollments();
  const { courses } = useCourses();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const matchSearch = !search || e.studentName?.toLowerCase().includes(search.toLowerCase()) || e.courseName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enrollments, search, statusFilter]);

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "info";
      case "completed": return "success";
      case "dropped": return "danger";
      default: return "muted";
    }
  };

  return (
    <>
      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search enrollments..." className="ap-input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ap-input max-w-[160px]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel title="No enrollments found" subtitle="Students will appear here after enrolling in courses">
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" />
          </div>
        </Panel>
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: "studentName", label: "Student", render: (r) => <span className="font-bold">{r.studentName}</span> },
            { key: "courseName", label: "Course" },
            { key: "progress", label: "Progress", render: (r) => <ProgressBar value={r.progress} tone={r.progress >= 80 ? "success" : r.progress >= 50 ? "warning" : "danger"} /> },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusColor(r.status) as any}>{r.status}</Badge> },
            { key: "enrolledAt", label: "Enrolled", render: (r) => r.enrolledAt?.toDate?.() ? new Date(r.enrolledAt.toDate()).toLocaleDateString() : "—" },
          ]}
          actions={(r) => (
            <div className="flex gap-1">
              {r.status === "active" && (
                <button onClick={async () => { await updateEnrollment.mutateAsync({ id: r.id, status: "completed", progress: 100 }); toast.success("Marked as completed"); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-success)/0.1)]" title="Mark Complete">
                  <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" />
                </button>
              )}
              {r.status === "active" && (
                <button onClick={async () => { await updateEnrollment.mutateAsync({ id: r.id, status: "dropped" }); toast.success("Marked as dropped"); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]" title="Drop">
                  <XCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                </button>
              )}
            </div>
          )}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  ANALYTICS TAB                                                   */
/* ================================================================ */
export function AnalyticsTab() {
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();

  const topCourses = useMemo(() => {
    const map = new Map<string, { name: string; count: number; completed: number }>();
    enrollments.forEach((e) => {
      const existing = map.get(e.courseId) || { name: e.courseName, count: 0, completed: 0 };
      existing.count++;
      if (e.status === "completed") existing.completed++;
      map.set(e.courseId, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [enrollments]);

  const statusBreakdown = useMemo(() => {
    const active = enrollments.filter((e) => e.status === "active").length;
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const dropped = enrollments.filter((e) => e.status === "dropped").length;
    return { active, completed, dropped, total: enrollments.length };
  }, [enrollments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel title="Enrollment Status" subtitle="Overview of all enrollments">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Active</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                <div className="h-2 rounded-full bg-[hsl(var(--ap-info))] transition-all" style={{ width: `${statusBreakdown.total ? (statusBreakdown.active / statusBreakdown.total) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-bold w-8 text-right">{statusBreakdown.active}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                <div className="h-2 rounded-full bg-[hsl(var(--ap-success))] transition-all" style={{ width: `${statusBreakdown.total ? (statusBreakdown.completed / statusBreakdown.total) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-bold w-8 text-right">{statusBreakdown.completed}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dropped</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                <div className="h-2 rounded-full bg-[hsl(var(--ap-danger))] transition-all" style={{ width: `${statusBreakdown.total ? (statusBreakdown.dropped / statusBreakdown.total) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-bold w-8 text-right">{statusBreakdown.dropped}</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Top Courses" subtitle="Most enrolled courses">
        <div className="space-y-3">
          {topCourses.length === 0 ? (
            <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No enrollment data yet</p>
          ) : topCourses.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[hsl(var(--ap-muted))] w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{c.count} enrolled · {c.completed} completed</p>
              </div>
              <ProgressBar value={c.count ? (c.completed / c.count) * 100 : 0} tone="success" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}


