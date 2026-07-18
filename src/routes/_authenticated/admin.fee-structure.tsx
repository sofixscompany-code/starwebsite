import { Panel, StatCard } from '@/components/admin/ui';
import { FileCheck, Wallet, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export function FeeStructurePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structure</h1>
        <p className="text-sm text-gray-400 mt-1">Manage fee categories and amounts</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Fee Types" value={8} icon={FileCheck} tone="blue" />
        <StatCard label="Total Collected" value="₹45.6L" icon={Wallet} tone="green" />
        <StatCard label="Pending" value="₹2.85L" icon={BarChart3} tone="orange" />
        <StatCard label="Discounts" value="12%" icon={FileCheck} tone="purple" />
      </motion.div>
      <Panel title="Fee Categories" subtitle="Configure fee types and amounts">
        <div className="text-center py-12 text-gray-400 text-sm">Fee structure management coming soon</div>
      </Panel>
    </div>
  );
}
