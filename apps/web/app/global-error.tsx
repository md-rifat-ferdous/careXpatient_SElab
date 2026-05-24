"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ 
        fontFamily: "Inter, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#F9FAFB",
        margin: 0
      }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "#FEE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111827", marginBottom: "0.5rem" }}>
            Critical Error
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#0D8F7B",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
