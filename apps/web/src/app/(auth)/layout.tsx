"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Typography, 
  cn 
} from '@carexpatient/ui';
import { 
  ShieldCheck, 
  Heart, 
  Users, 
  Stethoscope, 
  Activity 
} from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* ===== LEFT HERO PANEL ===== */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-primary flex-col justify-between p-16 relative overflow-hidden">
        {/* Abstract Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-light/20 rounded-full blur-[100px]" />
        
        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <span className="text-white font-black text-lg">cXp</span>
            </div>
            <Typography variant="h3" className="text-white font-black text-2xl tracking-tighter">
              care<span className="opacity-60">X</span>patient
            </Typography>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Enterprise Secured</span>
              </div>
              <Typography variant="h1" className="text-white text-5xl xl:text-6xl font-black leading-tight">
                Digital Care,<br />
                <span className="text-white/60">Clinical Precision.</span>
              </Typography>
            </motion.div>
            
            <Typography variant="body" className="text-white/70 text-lg leading-relaxed max-w-sm">
              Manage your health records, consult with specialists, and access diagnostic services in a unified healthcare ecosystem.
            </Typography>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Trusted Patients', value: '100K+', icon: <Users className="w-4 h-4" /> },
              { label: 'Specialists', value: '2.5K+', icon: <Stethoscope className="w-4 h-4" /> },
              { label: 'Uptime', value: '99.9%', icon: <Activity className="w-4 h-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-white/50 mb-2">{stat.icon}</div>
                <div className="text-white font-black text-xl">{stat.value}</div>
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-white/30 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 careXpatient</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* ===== RIGHT FORM PANEL ===== */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
