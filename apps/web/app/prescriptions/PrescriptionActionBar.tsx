"use client";

import React from "react";
import { Printer, Download, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PrescriptionActionBar() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex justify-between items-center print:hidden">
      <Link href="/doctor/schedule" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-[12px] leading-[16px] tracking-[0.05em] font-semibold uppercase">
        <ArrowLeft size={16} />
        Back to Schedule
      </Link>
      
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-border-soft rounded-lg text-[12px] font-semibold hover:bg-surface-container-low transition-all">
          <Share2 size={16} />
          Share
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-border-soft rounded-lg text-[12px] font-semibold hover:bg-surface-container-low transition-all"
        >
          <Printer size={16} />
          Print Rx
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm">
          <Download size={16} />
          Download PDF
        </button>
      </div>
    </div>
  );
}
