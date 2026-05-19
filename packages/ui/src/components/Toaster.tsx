"use client";

import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface group-[.toaster]:text-text group-[.toaster]:border-border-soft group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-text-muted",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-surface-muted group-[.toast]:text-text-muted",
        },
      }}
    />
  );
};

export { toast } from 'sonner';
