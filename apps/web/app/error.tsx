"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background font-sans">
      <div className="flex flex-col items-center gap-6 p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-500 w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Something went wrong</h1>
          <p className="text-subtle-gray text-sm leading-relaxed">
            An unexpected error occurred. Please try refreshing the page or go back.
          </p>
          {error?.message && (
            <p className="text-xs font-mono text-red-400 bg-red-50 px-3 py-2 rounded-lg mt-2 border border-red-100">
              {error.message}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
