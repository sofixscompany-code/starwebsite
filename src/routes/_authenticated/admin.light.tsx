import { Panel, StatCard } from '@/components/admin/ui';
import { Lightbulb, Zap, Settings, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export function LightManagerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Light Manager</h1>
        <p className="text-sm text-gray-400 mt-1">Manage UI themes and appearance settings</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Themes" value={3} icon={Lightbulb} tone="blue" />
        <StatCard label="Custom Colors" value={12} icon={Zap} tone="purple" />
        <StatCard label="Components" value={48} icon={Monitor} tone="green" />
        <StatCard label="Overrides" value={6} icon={Settings} tone="orange" />
      </motion.div>
      <Panel title="Theme Configuration" subtitle="Customize appearance across the platform">
        <div className="text-center py-12 text-gray-400 text-sm">Light manager coming soon</div>
      </Panel>
    </div>
  );
}
