import {} from "react-router-dom";
import { useState, useMemo } from "react";
import {
  BookOpen,
  Users,
  Clock,
  Wallet,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  FileText,
  Video,
  Calendar,
  Star,
  MoreVertical,
  ChevronRight,
  Award,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Toolbar, Tabs, Modal, ProgressBar } from "@/components/admin/ui";
import { useCourses } from "@/hooks/use-lms";
import { toast } from "sonner";

export function CoursesPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("catalog");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    slug: "",
    category: "Public Service",
    duration: "",
    price: 0,
    shortDescription: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    totalLessons: 0,
    order: 0,
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);

  const { courses, isLoading, addCourse, updateCourse, deleteCourse } = useCourses();

  const uiCourses = useMemo(
    () =>
      courses.map((c, i) => ({
        ...c,
        fee: c.price || 0,
        desc: c.shortDescription || c.description || "",
        students: c.totalStudents || 0,
        batches: Math.max(1, Math.ceil((c.totalStudents || 0) / 40)),
        rating: c.rating || 0,
        status: c.isPublished ? "Active" : "Draft",
        seats: Math.max(c.totalStudents || 0, 50 + i * 10),
        filled: c.totalStudents || 0,
      })),
    [courses],
  );

  const filtered = uiCourses.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      c.category.toLowerCase().includes(q.toLowerCase()),
  );

  const totalStudents = useMemo(() => uiCourses.reduce((s, c) => s + c.students, 0), [uiCourses]);
  const totalBatches = useMemo(() => uiCourses.reduce((s, c) => s + c.batches, 0), [uiCourses]);
  const totalRevenue = useMemo(
    () => uiCourses.reduce((s, c) => s + c.fee * c.students, 0),
    [uiCourses],
  );

  const enrollmentData = useMemo(
    () =>
      uiCourses.slice(0, 6).map((c) => ({
        course: c.title.split(" ").slice(0, 2).join(" "),
        students: c.students,
      })),
    [uiCourses],
  );

  const handleCreate = async () => {
    if (!newCourse.title || !newCourse.slug) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      await addCourse.mutateAsync({
        title: newCourse.title,
        slug: newCourse.slug,
        category: newCourse.category,
        duration: newCourse.duration,
        price: newCourse.price,
        shortDescription: newCourse.shortDescription,
        description: newCourse.shortDescription,
        level: newCourse.level,
        totalLessons: newCourse.totalLessons,
        order: newCourse.order || uiCourses.length + 1,
        isPublished: newCourse.isPublished,
        imageUrl: "",
        discountPrice: 0,
        totalStudents: 0,
        rating: 0,
        instructor: "",
        instructorAvatar: "",
        tags: [],
        isActive: true,
      } as any);
      toast.success("Course created");
      setModalOpen(false);
      setNewCourse({
        title: "",
        slug: "",
        category: "Public Service",
        duration: "",
        price: 0,
        shortDescription: "",
        level: "beginner",
        totalLessons: 0,
        order: 0,
        isPublished: true,
      });
    } catch {
      toast.error("Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Course catalog, batches, seats, fees & enrollment management."
        actions={
          <>
            <button className="ap-btn-ghost">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Courses" value={uiCourses.length} icon={BookOpen} tone="purple" />
        <StatCard label="Active Students" value={totalStudents} icon={Users} tone="success" />
        <StatCard label="Total Batches" value={totalBatches} icon={Clock} tone="orange" />
        <StatCard
          label="Revenue MTD"
          prefix="₹"
          value={totalRevenue}
          icon={Wallet}
          tone="success"
        />
      </div>

      <Tabs
        tabs={[
          { label: "Catalog", value: "catalog" },
          { label: "Batches", value: "batches" },
          { label: "Analytics", value: "analytics" },
          { label: "Syllabus", value: "syllabus" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "catalog" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses..."
                  className="ap-input pl-9"
                />
              </div>
              <button className="ap-btn-ghost">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <select className="ap-input max-w-[180px]">
                <option>All categories</option>
                <option>Public Service</option>
                <option>Banking</option>
                <option>Army</option>
                <option>Armed Police</option>
                <option>Entrance</option>
              </select>
            </Toolbar>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="ap-card p-5 animate-pulse">
                    <div className="h-40 bg-[hsl(var(--ap-border)/0.3)] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((c) => {
                  const pct = Math.round((c.filled / c.seats) * 100);
                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -4 }}
                      className="ap-card p-5 relative overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedCourse(c)}
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full ap-grad opacity-15 blur-2xl group-hover:opacity-25 transition" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <Badge tone={c.status === "Active" ? "success" : "muted"}>
                            {c.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base truncate">{c.title}</h3>
                        <Badge tone="purple">{c.category}</Badge>
                        <p className="text-xs text-[hsl(var(--ap-muted))] mt-2 line-clamp-2">
                          {c.desc}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[hsl(var(--ap-muted))]">Seat Fill</span>
                            <span className="font-bold">
                              {c.filled}/{c.seats}
                            </span>
                          </div>
                          <ProgressBar
                            value={pct}
                            tone={pct > 90 ? "danger" : pct > 70 ? "warning" : "success"}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--ap-border))]">
                          <div className="flex items-center gap-3 text-xs text-[hsl(var(--ap-muted))]">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {c.students}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {c.duration}
                            </span>
                          </div>
                          <span className="font-bold text-[hsl(var(--ap-success))]">
                            ₹{c.fee.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "batches" && (
          <Panel title="Batch Management" subtitle="All active batches across courses">
            <div className="space-y-2">
              {uiCourses.slice(0, 6).map((c, i) => {
                const cap = 50;
                const stu = Math.min(c.students, cap);
                const pct = Math.round((stu / cap) * 100);
                return (
                  <div
                    key={c.id}
                    className="ap-card p-4 flex items-center gap-4 hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 rounded-xl ap-grad flex items-center justify-center text-white font-black text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">
                        {c.title} ·{" "}
                        <span className="text-[hsl(var(--ap-purple))]">
                          B-{String(i + 1).padStart(2, "0")}
                        </span>
                      </p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">
                        {c.duration} · Room {101 + i}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {stu}/{cap}
                      </p>
                      <ProgressBar value={pct} tone={pct > 90 ? "danger" : "success"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Enrollment by Course" subtitle="Current active students">
              <div className="h-64">
                {enrollmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis type="number" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis
                        type="category"
                        dataKey="course"
                        stroke="hsl(var(--ap-muted))"
                        fontSize={11}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--ap-panel))",
                          border: "1px solid hsl(var(--ap-border))",
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="students" radius={[0, 6, 6, 0]} fill="hsl(262 83% 58%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[hsl(var(--ap-muted))] text-sm">
                    No course data yet
                  </div>
                )}
              </div>
            </Panel>
            <Panel title="Course Performance" subtitle="Ratings & revenue">
              <div className="space-y-3">
                {uiCourses.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-32 truncate text-sm font-semibold">{c.title}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <Star
                          className="w-3.5 h-3.5 text-[hsl(var(--ap-warning))]"
                          fill="hsl(var(--ap-warning))"
                        />
                        <span className="text-xs font-bold">{c.rating || "—"}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[hsl(var(--ap-success))] w-24 text-right">
                      ₹{(c.fee * c.students).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "syllabus" && (
          <Panel title="Syllabus Management">
            <div className="space-y-3">
              {uiCourses.slice(0, 4).map((c) => (
                <div key={c.id} className="ap-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{c.title}</h4>
                    <Badge tone="purple">{c.category}</Badge>
                  </div>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">
                    {c.totalLessons} lessons · {c.level}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      <Modal open={!!selectedCourse} onClose={() => setSelectedCourse(null)} size="lg">
        {selectedCourse && <CourseDetail course={selectedCourse} />}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">Add New Course</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">
          Create a new course with details, fees, and batches.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Course Title
            </span>
            <input
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              placeholder="e.g., Nepal Police Preparation"
              className="ap-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Slug
            </span>
            <input
              value={newCourse.slug}
              onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
              placeholder="nepal-police-prep"
              className="ap-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Category
            </span>
            <select
              value={newCourse.category}
              onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              className="ap-input mt-1"
            >
              <option>Public Service</option>
              <option>Banking</option>
              <option>Army</option>
              <option>Armed Police</option>
              <option>Entrance</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Duration
            </span>
            <input
              value={newCourse.duration}
              onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
              placeholder="3 months"
              className="ap-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Fee (NPR)
            </span>
            <input
              type="number"
              value={newCourse.price || ""}
              onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
              placeholder="18000"
              className="ap-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Level
            </span>
            <select
              value={newCourse.level}
              onChange={(e) =>
                setNewCourse({ ...newCourse, level: e.target.value as typeof newCourse.level })
              }
              className="ap-input mt-1"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="col-span-2 block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Description
            </span>
            <textarea
              value={newCourse.shortDescription}
              onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
              rows={3}
              className="ap-input mt-1"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{" "}
            Create Course
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function CourseDetail({ course }: { course: any }) {
  const pct = Math.round((course.filled / course.seats) * 100);
  return (
    <div>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl ap-grad flex items-center justify-center text-white">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black">{course.title}</h2>
          <div className="flex gap-2 mt-1">
            <Badge tone="purple">{course.category}</Badge>
            <Badge tone="success">{course.status}</Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-[hsl(var(--ap-muted))] mb-4">{course.desc}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="ap-card p-3 text-center">
          <p className="text-2xl font-black text-[hsl(var(--ap-purple))]">{course.students}</p>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Students</p>
        </div>
        <div className="ap-card p-3 text-center">
          <p className="text-2xl font-black text-[hsl(var(--ap-orange))]">{course.batches}</p>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Batches</p>
        </div>
        <div className="ap-card p-3 text-center">
          <p className="text-2xl font-black text-[hsl(var(--ap-success))]">
            ₹{course.fee.toLocaleString()}
          </p>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Fee</p>
        </div>
        <div className="ap-card p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-[hsl(var(--ap-warning))]" fill="hsl(var(--ap-warning))" />
            <span className="text-2xl font-black">{course.rating || "—"}</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Rating</p>
        </div>
      </div>
      <div className="ap-card p-4">
        <h4 className="font-bold text-sm mb-2">Seat Availability</h4>
        <ProgressBar
          value={pct}
          tone={pct > 90 ? "danger" : "success"}
          label={`${course.filled}/${course.seats} filled (${pct}%)`}
        />
      </div>
    </div>
  );
}
