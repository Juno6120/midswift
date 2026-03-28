"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteReportsBatch } from "@/src/app/dashboard/actions";
import { useToast } from "@/src/context/ToastContext";

interface BatchDeleteButtonProps {
  selectedIds: string[];
  onClearSelection?: () => void;
}

export function BatchDeleteButton({
  selectedIds,
  onClearSelection,
}: BatchDeleteButtonProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { showToast } = useToast();

  if (selectedIds.length === 0) return null;

  const handleBatchDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await deleteReportsBatch(selectedIds);
      if (response?.success) {
        setIsOpen(false);
        showToast("success", response.message);
        if (onClearSelection) {
          onClearSelection();
        }
      }
    } catch (error: unknown) {
      console.error(error);
      showToast(
        "error",
        "Failed to delete selected reports. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Selected ({selectedIds.length})
      </button>

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
              onClick={() => !isDeleting && setIsOpen(false)}
            />

            <motion.div
              className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-none w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-500/15 border border-red-500/20 rounded-full mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
                  Delete Multiple Reports?
                </h3>
                <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedIds.length}
                  </span>{" "}
                  reports? This action cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-500/10 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 dark:shadow-red-500/10 border border-red-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete All"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
