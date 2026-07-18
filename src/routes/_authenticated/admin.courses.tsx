import {  } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen, Users, Clock, Wallet, Download, Search, Filter, Plus,
  Eye, Edit, Trash2, Play, FileText, Video, Calendar, Star,
  MoreVertical, ChevronRight, Award,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Toolbar, Tabs, Modal, ProgressBar } from "@/components/admin/ui";

const COURSES = [
  { id: "1", slug: "nepal-police", title: "Nepal Police Preparation", category: "Public Service", duration: "3 months", fee: 18000, students: 320, batches: 4, rating: 4.8, status: "Active", seats: 200, filled: 186, desc: "Complete preparation for Nepal Police SI, ASI, and Constable exams. Includes GK, Math, English, and Physical training." },
  { id: "2", slug: "loksewa-officer", title: "Loksewa Officer Prep", category: "Public Service", duration: "6 months", fee: 25000, students: 245, batches: 3, rating: 4.7, status: "Active", seats: 150, filled: 142, desc: "Section Officer and Nayab Subba preparation with comprehensive syllabus coverage." },
  { id: "3", slug: "apf-constable", title: "APF Constable Training", category: "Armed Police", duration: "2 months", fee: 15000, students: 190, batches: 3, rating: 4.6, status: "Active", seats: 120, filled: 98, desc: "Armed Police Force constable exam preparation with physical and written test training." },
  { id: "4", slug: "nepal-army", title: "Nepal Army Preparation", category: "Army", duration: "3 months", fee: 20000, students: 175, batches: 2, rating: 4.5, status: "Active", seats: 100, filled: 88, desc: "Nepal Army recruitment exam preparation including written and physical fitness." },
  { id: "5", slug: "bank-po", title: "Bank PO Preparation", category: "Banking", duration: "4 months", fee: 22000, students: 110, batches: 2, rating: 4.4, status: "Active", seats: 80, filled: 72, desc: "Banking officer exam prep covering Quantitative, Reasoning, English, and General Awareness." },
  { id: "6", slug: "loksewa-section", title: "Loksewa Section Officer", category: "Public Service", duration: "8 months", fee: 35000, students: 86, batches: 1, rating: 4.9, status: "Active", seats: 50, filled: 48, desc: "Premium Section Officer preparation with expert faculty and comprehensive study material." },
  { id: "7", slug: "bank-assistant", title: "Bank Assistant Prep", category: "Banking", duration: "3 months", fee: 12000, students: 68, batches: 2, rating: 4.3, status: "Active", seats: 60, filled: 52, desc: "Bank assistant level exam preparation with focus on basic banking knowledge." },
  { id: "8", slug: "entrance-medical", title: "Medical Entrance", category: "Entrance", duration: "6 months", fee: 40000, students: 45, batches: 1, rating: 4.7, status: "Active", seats: 40, filled: 38, desc: "MBBS/BDS entrance preparation with Biology, Chemistry, and Physics focus." },
];

const enrollmentData = [
  { course: "Police", students: 320 },
  { course: "Loksewa", students: 245 },
  { course: "APF", students: 190 },
  { course: "Army", students: 175 },
  { course: "Bank", students: 110 },
  { course: "Medical", students: 45 },
];

export function CoursesPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("catalog");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);

  const filtered = COURSES.filter(
    (c) => !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Course catalog, batches, seats, fees & enrollment management."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Course</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Courses" value={24} icon={BookOpen} tone="purple" />
        <StatCard label="Active Students" value={1284} icon={Users} tone="success" />
        <StatCard label="Total Batches" value={18} icon={Clock} tone="orange" />
        <StatCard label="Revenue MTD" prefix="₹" value={9820000} icon={Wallet} tone="success" />
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
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <select className="ap-input max-w-[180px]"><option>All categories</option><option>Public Service</option><option>Banking</option><option>Army</option><option>Entrance</option></select>
            </Toolbar>

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
                        <Badge tone={c.status === "Active" ? "success" : "muted"}>{c.status}</Badge>
                      </div>
                      <h3 className="font-bold text-base truncate">{c.title}</h3>
                      <Badge tone="purple" >{c.category}</Badge>
                      <p className="text-xs text-[hsl(var(--ap-muted))] mt-2 line-clamp-2">{c.desc}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[hsl(var(--ap-muted))]">Seat Fill</span>
                          <span className="font-bold">{c.filled}/{c.seats}</span>
                        </div>
                        <ProgressBar value={pct} tone={pct > 90 ? "danger" : pct > 70 ? "warning" : "success"} />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--ap-border))]">
                        <div className="flex items-center gap-3 text-xs text-[hsl(var(--ap-muted))]">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.students}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                        </div>
                        <span className="font-bold text-[hsl(var(--ap-success))]">₹{c.fee.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "batches" && (
          <Panel title="Batch Management" subtitle="All active batches across courses">
            <div className="space-y-2">
              {[
                { batch: "B-12", course: "Nepal Police", time: "09:00 - 11:30 AM", teacher: "Ram K.C.", students: 45, capacity: 50, room: "204" },
                { batch: "B-13", course: "Nepal Police", time: "02:00 - 04:30 PM", teacher: "Deepak P.", students: 38, capacity: 50, room: "205" },
                { batch: "L-04", course: "Loksewa Officer", time: "10:00 - 12:30 PM", teacher: "Sunita N.", students: 42, capacity: 45, room: "302" },
                { batch: "A-08", course: "APF Constable", time: "06:00 - 08:00 AM", teacher: "Bishal R.", students: 30, capacity: 40, room: "101" },
                { batch: "N-05", course: "Nepal Army", time: "03:00 - 05:30 PM", teacher: "Prakash A.", students: 25, capacity: 35, room: "205" },
                { batch: "BK-02", course: "Bank PO", time: "11:00 - 01:30 PM", teacher: "Kabita S.", students: 28, capacity: 30, room: "301" },
              ].map((b, i) => {
                const pct = Math.round((b.students / b.capacity) * 100);
                return (
                  <div key={i} className="ap-card p-4 flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl ap-grad flex items-center justify-center text-white font-black text-sm">
                      {b.batch.split("-")[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{b.course} · <span className="text-[hsl(var(--ap-purple))]">{b.batch}</span></p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{b.time} · {b.teacher} · Room {b.room}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{b.students}/{b.capacity}</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis type="number" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis type="category" dataKey="course" stroke="hsl(var(--ap-muted))" fontSize={11} width={70} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Bar dataKey="students" radius={[0, 6, 6, 0]} fill="hsl(262 83% 58%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Course Performance" subtitle="Ratings & revenue">
              <div className="space-y-3">
                {COURSES.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-32 truncate text-sm font-semibold">{c.title}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[hsl(var(--ap-warning))]" fill="hsl(var(--ap-warning))" />
                        <span className="text-xs font-bold">{c.rating}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[hsl(var(--ap-success))] w-24 text-right">₹{(c.fee * c.students).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "syllabus" && (
          <Panel title="Syllabus Management">
            <div className="space-y-3">
              {COURSES.slice(0, 4).map((c) => (
                <div key={c.id} className="ap-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{c.title}</h4>
                    <Badge tone="purple">{c.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {["General Knowledge", "Mathematics", "English", "Reasoning"].map((s) => (
                      <div key={s} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--ap-border)/0.3)] text-xs">
                        <FileText className="w-3.5 h-3.5 text-[hsl(var(--ap-purple))]" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {/* Course Detail Modal */}
      <Modal open={!!selectedCourse} onClose={() => setSelectedCourse(null)} size="lg">
        {selectedCourse && <CourseDetail course={selectedCourse} />}
      </Modal>

      {/* Add Course Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">Add New Course</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Create a new course with details, fees, and batches.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Course Title", "text", "e.g., Nepal Police Preparation"],
            ["Slug", "text", "nepal-police-prep"],
            ["Category", "select", ""],
            ["Duration", "text", "3 months"],
            ["Fee (NPR)", "number", "18000"],
            ["Total Seats", "number", "200"],
            ["Batches", "number", "4"],
            ["Description", "textarea", ""],
          ].map(([label, type, ph]) => (
            <label key={label} className={type === "textarea" ? "col-span-2 block" : "block"}>
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
              {type === "textarea" ? (
                <textarea placeholder={ph} rows={3} className="ap-input mt-1" />
              ) : type === "select" ? (
                <select className="ap-input mt-1"><option>Public Service</option><option>Banking</option><option>Army</option><option>Armed Police</option><option>Entrance</option></select>
              ) : (
                <input type={type} placeholder={ph} className="ap-input mt-1" />
              )}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">Cancel</button>
          <button className="ap-btn"><Plus className="w-4 h-4" /> Create Course</button>
        </div>
      </Modal>
    </div>
  );
}

export function CourseDetail({ course }: { course: typeof COURSES[0] }) {
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
          <p className="text-2xl font-black text-[hsl(var(--ap-success))]">₹{course.fee.toLocaleString()}</p>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Fee</p>
        </div>
        <div className="ap-card p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-[hsl(var(--ap-warning))]" fill="hsl(var(--ap-warning))" />
            <span className="text-2xl font-black">{course.rating}</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Rating</p>
        </div>
      </div>
      <div className="ap-card p-4">
        <h4 className="font-bold text-sm mb-2">Seat Availability</h4>
        <ProgressBar value={pct} tone={pct > 90 ? "danger" : "success"} label={`${course.filled}/${course.seats} filled (${pct}%)`} />
      </div>
    </div>
  );
}


