"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DoctorScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Doctor Schedule page error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB] font-sans">
      <div className="flex flex-col items-center gap-6 p-10 max-w-lg text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-400 w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Schedule Page Error
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            An error occurred while loading the Doctor Schedule page. This might
            be a temporary issue. Please try again.
          </p>
          {error?.message && (
            <details className="mt-3 text-left">
              <summary className="text-xs font-semibold text-gray-400 cursor-pointer hover:text-gray-600">
                Error details
              </summary>
              <p className="text-xs font-mono text-red-400 bg-red-50 px-3 py-2 rounded-lg mt-2 border border-red-100 break-all">
                {error.message}
              </p>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/schedule"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft size={15} />
            Back to Schedule
          </Link>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D8F7B] text-white rounded-xl font-bold text-sm hover:bg-[#0b7a69] active:scale-95 transition-all shadow-sm shadow-[#0D8F7B]/20"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
