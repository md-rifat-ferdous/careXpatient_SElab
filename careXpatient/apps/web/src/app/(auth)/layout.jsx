import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT HERO PANEL ===== */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] auth-panel-left flex-col justify-between p-12 relative">
        {/* Blobs */}
        <div className="blob w-80 h-80 top-[-60px] left-[-80px]" />
        <div className="blob w-64 h-64 bottom-[20%] right-[-40px]" />
        <div className="blob w-48 h-48 top-[40%] left-[30%]" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-all">
              <span className="text-white font-bold text-sm tracking-tight">cXp</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              care<span className="text-white/70">X</span>patient
            </span>
          </Link>
        </div>

        {/* Center: Hero Content */}
        <div className="relative z-10 space-y-8">
          {/* Floating card */}
          <div className="glass rounded-2xl p-6 max-w-sm animate-float">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Your health, simplified</p>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">Connect with top specialists, book tests, and manage records — all in one place.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Your Wellness,<br />
              <span className="text-white/80">Our Expertise.</span>
            </h1>
            <p className="text-white/65 text-base leading-relaxed max-w-xs">
              Bangladesh&apos;s most trusted integrated healthcare platform for patients, doctors, and diagnostic labs.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
            { label: 'Patients', value: '50K+' },
            { label: 'Doctors', value: '2K+' },
            { label: 'Labs', value: '500+' }].
            map((stat) =>
            <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['bg-sky-400', 'bg-teal-500', 'bg-emerald-400', 'bg-cyan-500'].map((color, i) =>
              <div key={i} className={`w-7 h-7 rounded-full border-2 border-white ${color}`} />
              )}
            </div>
            <span className="text-white/70 text-xs">Joined by 10,000+ this month</span>
          </div>
        </div>

        {/* Bottom: Footer links */}
        <div className="relative z-10">
          <div className="flex gap-4 text-white/40 text-xs">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">Support</a>
          </div>
          <p className="text-white/30 text-xs mt-2">© 2024 careXpatient Healthcare</p>
        </div>
      </div>

      {/* ===== RIGHT FORM PANEL ===== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-6 pb-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <span className="text-white font-bold text-xs">cXp</span>
            </div>
            <span className="font-bold text-foreground">
              care<span className="text-primary">X</span>patient
            </span>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[460px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-subtle-gray">
            © 2024 careXpatient · <a href="#" className="hover:text-primary transition-colors">Privacy</a> · <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </p>
        </div>
      </div>
    </div>);

}