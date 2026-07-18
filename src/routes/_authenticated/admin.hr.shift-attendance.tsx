import { Panel, StatCard } from '@/components/admin/ui';
import { Clock, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ShiftAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift & Attendance</h1>
        <p className="text-sm text-gray-400 mt-1">Manage employee shifts and attendance tracking</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Shifts" value={4} icon={Clock} tone="blue" />
        <StatCard label="Staff On Duty" value={42} icon={Users} tone="green" />
        <StatCard label="Today's Attendance" value="96%" icon={CheckCircle2} tone="purple" />
        <StatCard label="Late Arrivals" value={3} icon={Calendar} tone="orange" />
      </motion.div>
      <Panel title="Shift Schedule" subtitle="Configure shift timings and rotations">
        <div className="text-center py-12 text-gray-400 text-sm">Shift management coming soon</div>
      </Panel>
    </div>
  );
}
