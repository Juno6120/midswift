"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Send, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/src/lib/supabase/client";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
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
                    strokeWidth="2"
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

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportBugModal({
  isOpen,
  onClose,
}: ReportBugModalProps) {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const supabase = createClient();

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleEsc]);

  // Reset form state after modal close animation completes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setDescription("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Auth session missing! Please ensure you are logged in.",
        );
      }

      const { error: insertError } = await supabase.from("bug_reports").insert([
        {
          description,
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      setIsSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: unknown) {
      console.error("Submission Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      alert(`Failed to send report: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-bug-title"
          className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 z-10 p-2 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:scale-110 active:scale-95 transition-all"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            <div className="relative px-6 pt-10 pb-8">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-teal-500/15 border border-teal-500/20 rounded-full mb-4">
                        <AlertCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>

                      <h2
                        id="report-bug-title"
                        className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2"
                      >
                        Report an Issue
                      </h2>

                      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        Found an issue with the app? Let us know below. You may also
                        email us at{" "}
                        <a
                          href="mailto:yasisangelon@gmail.com"
                          className="font-bold text-teal-600 dark:text-teal-400 hover:underline underline-offset-4 transition-all"
                        >
                          yasisangelon@gmail.com
                        </a>
                      </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What were you trying to do? What happened instead?"
                          className="w-full bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 border border-teal-500/50 active:scale-95 transition-all disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Submit Report
                            <Send size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center text-center py-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-teal-500/15 border border-teal-500/20 rounded-full mb-4">
                      <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      Thank You!
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      Your report has been received. We&apos;ll look into it right away.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
