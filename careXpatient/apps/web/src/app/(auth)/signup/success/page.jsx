"use client";

import React from 'react';
import Link from 'next/link';

export default function SignupSuccessPage() {
  return (
    <div className="text-center animate-scale-in py-4">
      {/* Animated success icon */}
      <div className="flex justify-center mb-6">
        <div className="success-ring mx-auto">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Account Created!</h1>
      <p className="text-subtle-gray text-sm leading-relaxed mb-8 max-w-xs mx-auto">
        Welcome to careXpatient. Your account has been created successfully. You can now sign in and start using the platform.
      </p>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
        { icon: '🏥', label: 'Book Doctors' },
        { icon: '🧪', label: 'Lab Tests' },
        { icon: '📋', label: 'Health Records' }].
        map((item) =>
        <div key={item.label} className="bg-muted rounded-xl p-3">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium text-foreground">{item.label}</p>
          </div>
        )}
      </div>

      <Link
        href="/login"
        className="cx-btn-primary block">
        
        Sign In to Your Account
      </Link>

      <Link
        href="/"
        className="block text-sm text-subtle-gray mt-4 hover:text-foreground transition-colors">
        
        Back to Home
      </Link>
    </div>);

}