"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import LoadingScreen from "@/src/components/ui/LoadingScreen";

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#FDFCFB] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[0%] left-[-5%] w-[60%] h-[60%] bg-teal-100/50 rounded-full blur-[120px] animate-glass-1" />
        <div className="absolute bottom-[0%] right-[-5%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-glass-2" />
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-50/60 rounded-full blur-[100px] animate-glass-3" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
        <div className="absolute inset-0 bg-grain" />
      </div>

      {isLoading && (
        <LoadingScreen
          isTimeout={false}
          onClose={() => setIsLoading(false)}
        />
      )}

      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 bg-white/50 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 rotate-3 shadow-inner border border-white/40">
            <img
              src="/icons/midswift-logo.svg"
              alt="Midswift Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-teal-800 tracking-tight">
            Set New Password
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-200/50 text-red-600 p-4 rounded-xl text-sm font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-zinc-700">
                New Password
              </label>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                Min. 8 characters
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-white/40 border border-zinc-200/50 rounded-xl text-zinc-900 focus:bg-white/80 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-teal-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-white/40 border border-zinc-200/50 rounded-xl text-zinc-900 focus:bg-white/80 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-teal-600 transition-colors p-1"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-2 border border-teal-500/50"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
