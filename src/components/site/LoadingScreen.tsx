import { motion, AnimatePresence } from "framer-motion";
import { StarLogo } from "@/components/site/StarLogo";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--ap-bg))]"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl border border-[hsl(var(--ap-border))] shadow-lg">
          <StarLogo size="lg" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-[hsl(var(--ap-blue))]"
            />
          ))}
        </div>
        <p className="text-sm font-medium text-[hsl(var(--ap-muted))]">Loading...</p>
      </motion.div>
    </motion.div>
  );
}
