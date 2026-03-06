"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteReport } from "@/src/app/dashboard/actions";
import { useToast } from "@/src/context/ToastContext";

// I'm naming this specifically so it's easier to find in the IDE than just "Props"
interface DeleteReportButtonProps {
  reportId: string;
  monthName: string;
}

export function DeleteReportButton({
  reportId,
  monthName,
}: DeleteReportButtonProps) {
  // I'm using these two states to control the "Are you sure?" popup
  // and to disable buttons so the user doesn't click "Delete" twice.
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pulling this in so I can send those nice popup notifications.
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // I'm calling the server action here to wipe the record from the DB.
      await deleteReport(reportId);

      // I'm triggering a success message. Since the parent list will likely
      // re-validate and remove this component, I don't need to manually close the modal.
      showToast("success", `Successfully deleted 1 report (${monthName}).`);
    } catch (error: unknown) {
      // In TypeScript, errors are 'unknown', so I'm logging it and
      // resetting the UI so the user can actually try again if they want.
      console.error("Deletion failed:", error);
      setIsOpen(false);
      setIsDeleting(false);
      showToast("error", "Failed to delete. Please try again.");
    }
  };

  return (
    <>
      {/* This is the main trash icon button that starts the whole process. 
          I've added a subtle dark-mode hover state to keep it premium. */}
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

      {/* I only want to render the overlay and modal if the user actually clicked the trash icon. */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* I'm using the same backdrop logic as the Sign Out modal: 
              a sibling div for the blur and overlay to prevent style bleed. */}
          <div
            className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setIsOpen(false)}
          />

          {/* I've upgraded this card to use `backdrop-blur-xl` and the `zinc` 
              palette to match the Sign Out modal's premium aesthetic. */}
          <div
            className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl shadow-zinc-200/20 dark:shadow-none w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* I'm using the same circular ring container here. The 15% 
                  opacity red background signals danger without looking "cheap". */}
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

              {/* I'm using the flex column (mobile) to row (desktop) layout
                  to match the Sign Out button behavior exactly. */}
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
          </div>
        </div>
      )}
    </>
  );
}
