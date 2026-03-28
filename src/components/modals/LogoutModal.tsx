"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps): React.ReactElement {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-none w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-500/15 border border-red-500/20 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
                Are you sure you want to log out? You will need to sign back in to
                access your dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-500/10 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 dark:shadow-red-500/10 border border-red-500/50 transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
