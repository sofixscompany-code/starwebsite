import { lazy, Suspense, createElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalLoading } from '@/components/site/GlobalLoading';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SessionManager } from '@/components/auth/SessionManager';
import { LanguageProvider } from '@/components/site/LanguageProvider';
import { isAuthenticated } from '@/lib/api-auth';

// Auth pages
import { AuthPage } from './routes/auth';
import { RegisterPage } from './routes/register';
import { AccessDeniedPage } from './routes/403';
import { ProfilePage } from './routes/profile';

// Public pages
import { Index } from './routes/index';
import { AboutPage as About } from './routes/about';
import { CoursesPage as Courses } from './routes/courses';
import { FacultyPage as Faculty } from './routes/faculty';
import { ResultsPage as Results } from './routes/results';
import { GalleryPage as Gallery } from './routes/gallery';
import { ContactPage as Contact } from './routes/contact';
import { AdmissionPage as Admission } from './routes/admission';

// Dashboard pages - imported by admin.index, which routes by role

// Admin shell
import { Admin } from './routes/_authenticated/admin';
import { Dashboard } from './routes/_authenticated/admin.index';

// Admin child pages (lazy loaded)
const AdmissionsPage = lazy(() => import('./routes/_authenticated/admin.admissions').then(m => ({ default: m.AdmissionsPage })));
const StudentPortalPage = lazy(() => import('./routes/_authenticated/admin.students').then(m => ({ default: m.StudentPortalPage })));
const TeacherPortalPage = lazy(() => import('./routes/_authenticated/admin.teachers').then(m => ({ default: m.TeacherPortalPage })));
const ParentPortalPage = lazy(() => import('./routes/_authenticated/admin.parents').then(m => ({ default: m.ParentPortalPage })));
const ReceptionPage = lazy(() => import('./routes/_authenticated/admin.reception').then(m => ({ default: m.ReceptionPage })));
const AccountingPage = lazy(() => import('./routes/_authenticated/admin.accounting').then(m => ({ default: m.AccountingPage })));
const CoursesPage = lazy(() => import('./routes/_authenticated/admin.courses').then(m => ({ default: m.CoursesPage })));
const LMSPage = lazy(() => import('./routes/_authenticated/admin.lms').then(m => ({ default: m.LMSPage })));
const LiveClassesPage = lazy(() => import('./routes/_authenticated/admin.live').then(m => ({ default: m.LiveClassesPage })));
const HomeworkPage = lazy(() => import('./routes/_authenticated/admin.homework').then(m => ({ default: m.HomeworkPage })));
const AssignmentsPage = lazy(() => import('./routes/_authenticated/admin.assignments').then(m => ({ default: m.AssignmentsPage })));
const AttendancePage = lazy(() => import('./routes/_authenticated/admin.attendance').then(m => ({ default: m.AttendancePage })));
const ExamsPage = lazy(() => import('./routes/_authenticated/admin.exams').then(m => ({ default: m.ExamsPage })));
const ResultsPage2 = lazy(() => import('./routes/_authenticated/admin.results').then(m => ({ default: m.ResultsPage })));
const CertificatesPage = lazy(() => import('./routes/_authenticated/admin.certificates').then(m => ({ default: m.CertificatesPage })));
const IdCardsPage = lazy(() => import('./routes/_authenticated/admin.id-cards').then(m => ({ default: m.IdCardsPage })));
const LibraryPage = lazy(() => import('./routes/_authenticated/admin.library').then(m => ({ default: m.LibraryPage })));
const HostelPage = lazy(() => import('./routes/_authenticated/admin.hostel').then(m => ({ default: m.HostelPage })));
const TransportPage = lazy(() => import('./routes/_authenticated/admin.transport').then(m => ({ default: m.TransportPage })));
const PaymentsPage = lazy(() => import('./routes/_authenticated/admin.payments').then(m => ({ default: m.PaymentsPage })));
const ReportsPage = lazy(() => import('./routes/_authenticated/admin.reports').then(m => ({ default: m.ReportsPage })));
const AnalyticsPage = lazy(() => import('./routes/_authenticated/admin.analytics').then(m => ({ default: m.AnalyticsPage })));
const EmployeesPage = lazy(() => import('./routes/_authenticated/admin.hr.employees').then(m => ({ default: m.EmployeesPage })));
const PayrollPage = lazy(() => import('./routes/_authenticated/admin.hr.payroll').then(m => ({ default: m.PayrollPage })));
const LeavesPage = lazy(() => import('./routes/_authenticated/admin.hr.leaves').then(m => ({ default: m.LeavesPage })));
const DepartmentsPage = lazy(() => import('./routes/_authenticated/admin.hr.departments').then(m => ({ default: m.DepartmentsPage })));
const LeadsPage = lazy(() => import('./routes/_authenticated/admin.crm.leads').then(m => ({ default: m.LeadsPage })));
const InquiriesPage = lazy(() => import('./routes/_authenticated/admin.crm.inquiries').then(m => ({ default: m.InquiriesPage })));
const VisitorsPage = lazy(() => import('./routes/_authenticated/admin.crm.visitors').then(m => ({ default: m.VisitorsPage })));
const CounsellingPage = lazy(() => import('./routes/_authenticated/admin.crm.counselling').then(m => ({ default: m.CounsellingPage })));
const SMSPage = lazy(() => import('./routes/_authenticated/admin.marketing.sms').then(m => ({ default: m.SMSPage })));
const EmailPage = lazy(() => import('./routes/_authenticated/admin.marketing.email').then(m => ({ default: m.EmailPage })));
const WhatsAppPage = lazy(() => import('./routes/_authenticated/admin.marketing.whatsapp').then(m => ({ default: m.WhatsAppPage })));
const PushPage = lazy(() => import('./routes/_authenticated/admin.marketing.push').then(m => ({ default: m.PushPage })));
const NoticesEventsPage = lazy(() => import('./routes/_authenticated/admin.notices').then(m => ({ default: m.NoticesEventsPage })));
const UserManagementPage = lazy(() => import('./routes/_authenticated/admin/users').then(m => ({ default: m.UserManagementPage })));
const RolesPage = lazy(() => import('./routes/_authenticated/admin.roles').then(m => ({ default: m.RolesPage })));
const BranchesPage = lazy(() => import('./routes/_authenticated/admin.branches').then(m => ({ default: m.BranchesPage })));
const SettingsPage = lazy(() => import('./routes/_authenticated/admin.settings').then(m => ({ default: m.SettingsPage })));
const AuditLogsPage = lazy(() => import('./routes/_authenticated/admin.audit').then(m => ({ default: m.AuditLogsPage })));
const AIPage = lazy(() => import('./routes/_authenticated/admin.ai').then(m => ({ default: m.AIPage })));
const SupportPage = lazy(() => import('./routes/_authenticated/admin.support').then(m => ({ default: m.SupportPage })));
const ProfilePage2 = lazy(() => import('./routes/_authenticated/admin/profile').then(m => ({ default: m.ProfilePage })));
const BannersPage = lazy(() => import('./routes/_authenticated/admin.banners').then(m => ({ default: m.BannersPage })));
const FeeStructurePage = lazy(() => import('./routes/_authenticated/admin.fee-structure').then(m => ({ default: m.FeeStructurePage })));
const ShiftAttendancePage = lazy(() => import('./routes/_authenticated/admin.hr.shift-attendance').then(m => ({ default: m.ShiftAttendancePage })));
const LightManagerPage = lazy(() => import('./routes/_authenticated/admin.light').then(m => ({ default: m.LightManagerPage })));
// Teacher pages
const TeacherClassesPage = lazy(() => import('./routes/_authenticated/admin.teacher.classes'));
const TeacherAttendancePage = lazy(() => import('./routes/_authenticated/admin.teacher.attendance'));
const TeacherAssignmentsPage = lazy(() => import('./routes/_authenticated/admin.teacher.assignments'));
const TeacherGradebookPage = lazy(() => import('./routes/_authenticated/admin.teacher.gradebook'));
const TeacherResourcesPage = lazy(() => import('./routes/_authenticated/admin.teacher.resources'));
const TeacherLearningMaterialsPage = lazy(() => import('./routes/_authenticated/admin.teacher.learning-materials'));
const TeacherExaminationsPage = lazy(() => import('./routes/_authenticated/admin.teacher.examinations'));
const TeacherResultsPage = lazy(() => import('./routes/_authenticated/admin.teacher.results'));
const TeacherStudentsPage = lazy(() => import('./routes/_authenticated/admin.teacher.students'));
const TeacherParentsPage = lazy(() => import('./routes/_authenticated/admin.teacher.parents'));

// Shared pages
const MessagesPage = lazy(() => import('./routes/_authenticated/admin.messages'));
const CalendarPage = lazy(() => import('./routes/_authenticated/admin.calendar'));
const AcademicsPeoplePage = lazy(() => import('./routes/_authenticated/admin.academics.people'));
const AcademicsStudentsPage = lazy(() => import('./routes/_authenticated/admin.academics.students'));
const CommunicationNoticesPage = lazy(() => import('./routes/_authenticated/admin.communication.notices'));

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><GlobalLoading /></div>}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <GlobalLoading />
      <SessionManager isActive={isAuthenticated()} />
      <LanguageProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/results" element={<Results />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admission" element={<Admission />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Dashboard routes — all redirect to /admin with sidebar */}
          <Route path="/dashboard/super-admin" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/teacher" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/student" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/parent" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/accountant" element={<Navigate to="/admin" replace />} />

          {/* Admin routes */}
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="admissions" element={<LazyPage Component={AdmissionsPage} />} />
            <Route path="students" element={<LazyPage Component={StudentPortalPage} />} />
            <Route path="teachers" element={<LazyPage Component={TeacherPortalPage} />} />
            <Route path="parents" element={<LazyPage Component={ParentPortalPage} />} />
            <Route path="reception" element={<LazyPage Component={ReceptionPage} />} />
            <Route path="accounting" element={<LazyPage Component={AccountingPage} />} />
            <Route path="courses" element={<LazyPage Component={CoursesPage} />} />
            <Route path="lms" element={<LazyPage Component={LMSPage} />} />
            <Route path="live" element={<LazyPage Component={LiveClassesPage} />} />
            <Route path="homework" element={<LazyPage Component={HomeworkPage} />} />
            <Route path="assignments" element={<LazyPage Component={AssignmentsPage} />} />
            <Route path="attendance" element={<LazyPage Component={AttendancePage} />} />
            <Route path="exams" element={<LazyPage Component={ExamsPage} />} />
            <Route path="results" element={<LazyPage Component={ResultsPage2} />} />
            <Route path="certificates" element={<LazyPage Component={CertificatesPage} />} />
            <Route path="id-cards" element={<LazyPage Component={IdCardsPage} />} />
            <Route path="library" element={<LazyPage Component={LibraryPage} />} />
            <Route path="hostel" element={<LazyPage Component={HostelPage} />} />
            <Route path="transport" element={<LazyPage Component={TransportPage} />} />
            <Route path="payments" element={<LazyPage Component={PaymentsPage} />} />
            <Route path="reports" element={<LazyPage Component={ReportsPage} />} />
            <Route path="analytics" element={<LazyPage Component={AnalyticsPage} />} />
            <Route path="hr/employees" element={<LazyPage Component={EmployeesPage} />} />
            <Route path="hr/payroll" element={<LazyPage Component={PayrollPage} />} />
            <Route path="hr/leaves" element={<LazyPage Component={LeavesPage} />} />
            <Route path="hr/departments" element={<LazyPage Component={DepartmentsPage} />} />
            <Route path="crm/leads" element={<LazyPage Component={LeadsPage} />} />
            <Route path="crm/inquiries" element={<LazyPage Component={InquiriesPage} />} />
            <Route path="crm/visitors" element={<LazyPage Component={VisitorsPage} />} />
            <Route path="crm/counselling" element={<LazyPage Component={CounsellingPage} />} />
            <Route path="marketing/sms" element={<LazyPage Component={SMSPage} />} />
            <Route path="marketing/email" element={<LazyPage Component={EmailPage} />} />
            <Route path="marketing/whatsapp" element={<LazyPage Component={WhatsAppPage} />} />
            <Route path="marketing/push" element={<LazyPage Component={PushPage} />} />
            <Route path="notices" element={<LazyPage Component={NoticesEventsPage} />} />
            <Route path="users" element={<LazyPage Component={UserManagementPage} />} />
            <Route path="roles" element={<LazyPage Component={RolesPage} />} />
            <Route path="branches" element={<LazyPage Component={BranchesPage} />} />
            <Route path="settings" element={<LazyPage Component={SettingsPage} />} />
            <Route path="audit" element={<LazyPage Component={AuditLogsPage} />} />
            <Route path="ai" element={<LazyPage Component={AIPage} />} />
            <Route path="support" element={<LazyPage Component={SupportPage} />} />
            <Route path="profile" element={<LazyPage Component={ProfilePage2} />} />
            <Route path="banners" element={<LazyPage Component={BannersPage} />} />
            <Route path="fee-structure" element={<LazyPage Component={FeeStructurePage} />} />
            <Route path="hr/shift-attendance" element={<LazyPage Component={ShiftAttendancePage} />} />
            <Route path="light" element={<LazyPage Component={LightManagerPage} />} />
            {/* Teacher portal pages */}
            <Route path="teacher/classes" element={<LazyPage Component={TeacherClassesPage} />} />
            <Route path="teacher/attendance" element={<LazyPage Component={TeacherAttendancePage} />} />
            <Route path="teacher/assignments" element={<LazyPage Component={TeacherAssignmentsPage} />} />
            <Route path="teacher/gradebook" element={<LazyPage Component={TeacherGradebookPage} />} />
            <Route path="teacher/resources" element={<LazyPage Component={TeacherResourcesPage} />} />
            <Route path="teacher/learning-materials" element={<LazyPage Component={TeacherLearningMaterialsPage} />} />
            <Route path="teacher/examinations" element={<LazyPage Component={TeacherExaminationsPage} />} />
            <Route path="teacher/results" element={<LazyPage Component={TeacherResultsPage} />} />
            <Route path="teacher/students" element={<LazyPage Component={TeacherStudentsPage} />} />
            <Route path="teacher/parents" element={<LazyPage Component={TeacherParentsPage} />} />
            {/* Shared pages */}
            <Route path="messages" element={<LazyPage Component={MessagesPage} />} />
            <Route path="calendar" element={<LazyPage Component={CalendarPage} />} />
            <Route path="academics/people" element={<LazyPage Component={AcademicsPeoplePage} />} />
            <Route path="academics/students" element={<LazyPage Component={AcademicsStudentsPage} />} />
            <Route path="communication/notices" element={<LazyPage Component={CommunicationNoticesPage} />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </LanguageProvider>
    </>
  );
}
