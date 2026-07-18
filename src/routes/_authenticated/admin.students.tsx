import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  CalendarCheck, BookOpen, Clock, FileText, Award, Download, Search, Filter,
  CheckCircle, XCircle, AlertCircle, TrendingUp, BarChart3, Star,
  ChevronRight, Play, Bell, File, Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, ProgressBar, Skeleton } from "@/components/admin/ui";
import { useStudentAttendance, useStudentGrades, useStudentSchedule, useStudentAssignments, useStudentStats } from "@/hooks/use-student";
import { useCourses } from "@/hooks/use-lms";

const DEMO_STUDENT_ID = "demo_student_001";

export function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = useStudentStats(DEMO_STUDENT_ID);

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Attendance", value: "attendance" },
    { label: "Grades", value: "grades" },
    { label: "Schedule", value: "schedule" },
    { label: "Assignments", value: "assignments" },
    { label: "My Courses", value: "courses" },
  ];

  return (
    <div>
      <PageHeader
        title="Student Portal"
        subtitle="Track your attendance, grades, schedule, and assignments."
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
            <StatCard label="Attendance" value={`${stats?.attendanceRate ?? 0}%`} icon={CalendarCheck} tone={stats && stats.attendanceRate >= 80 ? "success" : "warning"} />
            <StatCard label="Avg Marks" value={`${stats?.avgMarks ?? 0}%`} icon={TrendingUp} tone={stats && stats.avgMarks >= 70 ? "success" : "info"} />
            <StatCard label="Pending Tasks" value={stats?.pendingAssignments ?? 0} icon={FileText} tone={stats && stats.pendingAssignments > 0 ? "orange" : "success"} />
            <StatCard label="Completed" value={stats?.completedAssignments ?? 0} icon={CheckCircle} tone="purple" />
          </>
        )}
      </div>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "attendance" && <AttendanceTab />}
        {activeTab === "grades" && <GradesTab />}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "assignments" && <AssignmentsTab />}
        {activeTab === "courses" && <CoursesTab />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                    */
/* ================================================================ */
export function OverviewTab() {
  const { attendance, isLoading: attLoading } = useStudentAttendance(DEMO_STUDENT_ID);
  const { grades, isLoading: gradesLoading } = useStudentGrades(DEMO_STUDENT_ID);
  const { assignments, isLoading: assignmentsLoading } = useStudentAssignments(DEMO_STUDENT_ID);
  const { schedule, getTodaySchedule, isLoading: schedLoading } = useStudentSchedule();

  const todaySchedule = getTodaySchedule();
  const recentGrades = grades.slice(0, 3);
  const pendingAssignments = assignments.filter((a) => a.status === "pending").slice(0, 3);

  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Today's Schedule */}
      <Panel title="Today's Schedule" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}>
        {schedLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : todaySchedule.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No classes today</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--ap-blue)/0.04)] border border-[hsl(var(--ap-blue)/0.1)]">
                <div className="w-10 h-10 rounded-lg ap-grad flex items-center justify-center text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.courseName}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{s.startTime} - {s.endTime} · {s.room}</p>
                </div>
                <Badge tone="purple">{s.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Recent Grades */}
      <Panel title="Recent Grades">
        {gradesLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : recentGrades.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No grades yet</p>
        ) : (
          <div className="space-y-2">
            {recentGrades.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.2)]">
                <div>
                  <p className="text-sm font-semibold">{g.examName}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{g.courseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{g.marks}/{g.totalMarks}</p>
                  <Badge tone={g.marks / g.totalMarks >= 0.7 ? "success" : g.marks / g.totalMarks >= 0.5 ? "warning" : "danger"}>{g.grade}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Pending Assignments */}
      <Panel title="Pending Assignments">
        {assignmentsLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : pendingAssignments.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">All caught up!</p>
        ) : (
          <div className="space-y-2">
            {pendingAssignments.map((a) => {
              const isOverdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.2)]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? "bg-[hsl(var(--ap-danger)/0.1)]" : "bg-[hsl(var(--ap-orange)/0.1)]"}`}>
                    {isOverdue ? <AlertCircle className="w-4 h-4 text-[hsl(var(--ap-danger))]" /> : <FileText className="w-4 h-4 text-[hsl(var(--ap-orange))]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.title}</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))]">Due: {a.dueDate}</p>
                  </div>
                  <Badge tone={isOverdue ? "danger" : "warning"}>{isOverdue ? "Overdue" : "Pending"}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Attendance Summary */}
      <Panel title="Attendance Summary" className="lg:col-span-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Present", count: attendance.filter((a) => a.status === "present").length, color: "bg-[hsl(var(--ap-success))]" },
            { label: "Absent", count: attendance.filter((a) => a.status === "absent").length, color: "bg-[hsl(var(--ap-danger))]" },
            { label: "Late", count: attendance.filter((a) => a.status === "late").length, color: "bg-[hsl(var(--ap-warning))]" },
            { label: "Excused", count: attendance.filter((a) => a.status === "excused").length, color: "bg-[hsl(var(--ap-info))]" },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-[hsl(var(--ap-border)/0.2)]">
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))]">{s.label}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  ATTENDANCE TAB                                                  */
/* ================================================================ */
export function AttendanceTab() {
  const { attendance, isLoading } = useStudentAttendance(DEMO_STUDENT_ID);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const filtered = useMemo(() => {
    return attendance.filter((a) => a.date?.startsWith(month));
  }, [attendance, month]);

  const stats = useMemo(() => {
    const total = filtered.length || 1;
    const present = filtered.filter((a) => a.status === "present").length;
    return {
      total: filtered.length,
      present,
      absent: filtered.filter((a) => a.status === "absent").length,
      late: filtered.filter((a) => a.status === "late").length,
      rate: Math.round((present / total) * 100),
    };
  }, [filtered]);

  const statusIcon = (s: string) => {
    switch (s) {
      case "present": return <CheckCircle className="w-4 h-4 text-[hsl(var(--ap-success))]" />;
      case "absent": return <XCircle className="w-4 h-4 text-[hsl(var(--ap-danger))]" />;
      case "late": return <Clock className="w-4 h-4 text-[hsl(var(--ap-warning))]" />;
      case "excused": return <AlertCircle className="w-4 h-4 text-[hsl(var(--ap-info))]" />;
      default: return null;
    }
  };

  return (
    <>
      <Toolbar>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="ap-input max-w-[180px]" />
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" /> {stats.present} present</span>
          <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /> {stats.absent} absent</span>
          <span className="font-bold">{stats.rate}% attendance</span>
        </div>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: "date", label: "Date", render: (r) => <span className="font-mono text-sm">{r.date}</span> },
            { key: "courseName", label: "Course" },
            { key: "status", label: "Status", render: (r) => (
              <div className="flex items-center gap-2">
                {statusIcon(r.status)}
                <Badge tone={r.status === "present" ? "success" : r.status === "absent" ? "danger" : r.status === "late" ? "warning" : "info"}>{r.status}</Badge>
              </div>
            )},
            { key: "markedBy", label: "Marked By" },
          ]}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  GRADES TAB                                                      */
/* ================================================================ */
export function GradesTab() {
  const { grades, isLoading, getGPA } = useStudentGrades(DEMO_STUDENT_ID);
  const [filterCourse, setFilterCourse] = useState("all");

  const courses = useMemo(() => {
    const cats = new Set(grades.map((g) => g.courseName).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [grades]);

  const filtered = useMemo(() => {
    return grades.filter((g) => filterCourse === "all" || g.courseName === filterCourse);
  }, [grades, filterCourse]);

  const avgPercentage = useMemo(() => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0);
    return Math.round(total / grades.length);
  }, [grades]);

  return (
    <>
      <Toolbar>
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="ap-input max-w-[200px]">
          {courses.map((c) => <option key={c} value={c}>{c === "all" ? "All Courses" : c}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span>GPA: <strong>{getGPA()}</strong></span>
          <span>Avg: <strong>{avgPercentage}%</strong></span>
        </div>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: "examName", label: "Exam", render: (r) => <span className="font-bold">{r.examName}</span> },
            { key: "courseName", label: "Course" },
            { key: "date", label: "Date" },
            { key: "marks", label: "Score", render: (r) => (
              <div>
                <span className="font-bold">{r.marks}/{r.totalMarks}</span>
                <span className="text-xs text-[hsl(var(--ap-muted))] ml-1">({Math.round((r.marks / r.totalMarks) * 100)}%)</span>
              </div>
            )},
            { key: "grade", label: "Grade", render: (r) => (
              <Badge tone={["A+", "A", "B+", "B"].includes(r.grade) ? "success" : ["C+", "C"].includes(r.grade) ? "warning" : "danger"}>{r.grade}</Badge>
            )},
            { key: "remarks", label: "Remarks", render: (r) => <span className="text-xs text-[hsl(var(--ap-muted))]">{r.remarks || "—"}</span> },
          ]}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  SCHEDULE TAB                                                    */
/* ================================================================ */
export function ScheduleTab() {
  const { schedule, isLoading } = useStudentSchedule();
  const [selectedDay, setSelectedDay] = useState("all");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const filtered = useMemo(() => {
    if (selectedDay === "all") return schedule;
    return schedule.filter((s) => s.day === selectedDay);
  }, [schedule, selectedDay]);

  const typeColor = (t: string) => {
    switch (t) {
      case "lecture": return "purple";
      case "lab": return "orange";
      case "tutorial": return "info";
      case "exam": return "danger";
      default: return "muted";
    }
  };

  return (
    <>
      <Toolbar>
        <div className="flex gap-1">
          <button onClick={() => setSelectedDay("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedDay === "all" ? "ap-grad text-white" : "ap-btn-ghost"}`}>All</button>
          {days.slice(0, 6).map((d) => (
            <button key={d} onClick={() => setSelectedDay(d)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedDay === d ? "ap-grad text-white" : "ap-btn-ghost"}`}>{d.slice(0, 3)}</button>
          ))}
        </div>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel title="No classes found">
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No schedule for {selectedDay === "all" ? "this week" : selectedDay}</p>
        </Panel>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <motion.div key={s.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-center gap-4">
              <div className="w-14 text-center">
                <p className="text-xs text-[hsl(var(--ap-muted))]">{s.day.slice(0, 3)}</p>
                <p className="text-sm font-bold">{s.startTime}</p>
              </div>
              <div className="w-px h-10 bg-[hsl(var(--ap-border))]" />
              <div className="flex-1">
                <p className="font-semibold">{s.courseName}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{s.teacher} · Room {s.room}</p>
              </div>
              <Badge tone={typeColor(s.type) as any}>{s.type}</Badge>
              <span className="text-xs text-[hsl(var(--ap-muted))]">{s.startTime} - {s.endTime}</span>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

/* ================================================================ */
/*  ASSIGNMENTS TAB                                                 */
/* ================================================================ */
export function AssignmentsTab() {
  const { assignments, isLoading, submitAssignment } = useStudentAssignments(DEMO_STUDENT_ID);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return assignments;
    return assignments.filter((a) => a.status === statusFilter);
  }, [assignments, statusFilter]);

  const handleSubmit = async (id: string) => {
    await submitAssignment.mutateAsync({ id, submittedAt: new Date(), status: "submitted" });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "submitted": case "graded": return "success";
      case "pending": return "warning";
      case "late": return "danger";
      default: return "muted";
    }
  };

  return (
    <>
      <Toolbar>
        <div className="flex gap-1">
          {["all", "pending", "submitted", "graded", "late"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${statusFilter === s ? "ap-grad text-white" : "ap-btn-ghost"}`}>
              {s === "all" ? "All" : s}
              {s === "pending" && <span className="ml-1 text-[10px]">({assignments.filter((a) => a.status === "pending").length})</span>}
            </button>
          ))}
        </div>
      </Toolbar>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel title="No assignments found">
          <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No {statusFilter !== "all" ? statusFilter : ""} assignments</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const isOverdue = a.status === "pending" && new Date(a.dueDate) < new Date();
            const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <motion.div key={a.id} whileHover={{ y: -2 }} className="ap-card p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOverdue ? "bg-[hsl(var(--ap-danger)/0.1)]" : "bg-[hsl(var(--ap-blue)/0.08)]"}`}>
                    <FileText className={`w-5 h-5 ${isOverdue ? "text-[hsl(var(--ap-danger))]" : "text-[hsl(var(--ap-blue))]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{a.title}</h3>
                      <Badge tone={statusColor(a.status) as any}>{a.status}</Badge>
                    </div>
                    <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{a.courseName}</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">{a.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[hsl(var(--ap-muted))]">
                      <span>Due: {a.dueDate}</span>
                      <span>Marks: {a.totalMarks}</span>
                      {a.status === "pending" && (
                        <span className={isOverdue ? "text-[hsl(var(--ap-danger))] font-semibold" : daysLeft <= 2 ? "text-[hsl(var(--ap-warning))] font-semibold" : ""}>
                          {isOverdue ? "Overdue!" : `${daysLeft} days left`}
                        </span>
                      )}
                      {a.status === "graded" && (
                        <span className="font-bold text-[hsl(var(--ap-success))]">Score: {a.marks}/{a.totalMarks}</span>
                      )}
                    </div>
                    {a.feedback && (
                      <div className="mt-2 p-2 rounded-lg bg-[hsl(var(--ap-success)/0.05)] border border-[hsl(var(--ap-success)/0.1)]">
                        <p className="text-xs text-[hsl(var(--ap-muted))]"><strong>Feedback:</strong> {a.feedback}</p>
                      </div>
                    )}
                  </div>
                  {a.status === "pending" && (
                    <button onClick={() => handleSubmit(a.id)} className="ap-btn text-xs">
                      <Upload className="w-3.5 h-3.5" /> Submit
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ================================================================ */
/*  MY COURSES TAB                                                  */
/* ================================================================ */
export function CoursesTab() {
  const { courses, isLoading } = useCourses();

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.filter((c) => c.isPublished).map((course) => (
            <motion.div key={course.id} whileHover={{ y: -4 }} className="ap-card overflow-hidden group cursor-pointer">
              <div className="relative h-36 bg-gradient-to-br from-[hsl(var(--ap-blue)/0.2)] to-[hsl(var(--ap-orange)/0.2)] flex items-center justify-center">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-8 h-8 text-[hsl(var(--ap-muted))]" />
                )}
                <div className="absolute top-2 right-2"><Badge tone="purple">{course.level}</Badge></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm">{course.title}</h3>
                <p className="text-xs text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">{course.shortDescription}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[hsl(var(--ap-muted))]">{course.totalLessons} lessons · {course.duration}</span>
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--ap-blue))]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}


