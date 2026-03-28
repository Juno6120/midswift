"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteReport } from "@/src/app/dashboard/actions";
import { useToast } from "@/src/context/ToastContext";

interface DeleteReportButtonProps {
  reportId: string;
  monthName: string;
}

export function DeleteReportButton({
  reportId,
  monthName,
}: DeleteReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReport(reportId);
      showToast("success", `Successfully deleted 1 report (${monthName}).`);
    } catch (error: unknown) {
      console.error("Deletion failed:", error);
      setIsOpen(false);
      setIsDeleting(false);
      showToast("error", "Failed to delete. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete Report"
      >
        <Trash2 className="w-4 h-4" />
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
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-500/15 border border-red-500/20 rounded-full mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
                  Delete Report?
                </h3>
                <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
                  Are you sure you want to permanently delete the{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {monthName}
                  </span>{" "}
                  report? This action cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={isDeleting}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="flex-1 px-4 py-2.5 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-500/10 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 dark:shadow-red-500/10 border border-red-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
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
