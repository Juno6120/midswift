"use client";

import type { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveLeft, Home, SearchX } from "lucide-react";

// I'm explicitly setting the return type to JSX.Element here.
// It's a good TypeScript habit to strictly define what my components output.
export default function NotFound(): JSX.Element {
  // I'm grabbing the Next.js router instance right off the bat.
  // I'll need this later so I can wire up a functional "Go Back" button for the user.
  const router = useRouter();

  return (
    // I'm wrapping the entire page in a full-screen flex container.
    // I made sure to set overflow-hidden and relative positioning so my background blur effects don't break the layout or cause weird scrollbars.
    <div className="relative min-h-screen bg-[#FDFCFB] text-slate-900 font-sans flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-100/30 rounded-full blur-[120px]" />
        <div className="absolute inset-0 backdrop-blur-[60px]" />
      </div>
      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50">
            <SearchX className="w-12 h-12 text-teal-600" />
          </div>
        </div>

        <h1 className="text-7xl font-black text-slate-200 mb-2">404</h1>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
          Lost in the{" "}
          <span className="bg-linear-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            System?
          </span>
        </h2>
        <p className="text-slate-500 font-medium mb-10">
          We couldn't find the page you're looking for. It might have been
          moved, deleted, or perhaps it never existed in this ward.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <MoveLeft className="w-5 h-5" />
            Go Back
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-3 bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
