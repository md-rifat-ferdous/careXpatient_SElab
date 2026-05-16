"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { FormField, Input, PasswordInput } from '@/components/ui/FormElements';

type Role = 'Patient' | 'Doctor' | 'Lab';
type LoginMethod = 'password' | 'otp';

const ROLE_CONFIG = {
  Patient: {
    label: 'Patient',
    subtitle: 'Access your health records',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'teal',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100 text-teal-600',
    borderSel: 'border-teal-500',
    badge: 'Your Wellness, Our Expertise.',
  },
  Doctor: {
    label: 'Doctor',
    subtitle: 'Manage your practice',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'sky',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-600',
    borderSel: 'border-sky-500',
    badge: 'Precision & Compassion.',
  },
  Lab: {
    label: 'Diagnostic Lab',
    subtitle: 'Manage lab orders & results',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'emerald',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    borderSel: 'border-emerald-500',
    badge: 'Accuracy You Can Trust.',
  },
};

// ===== ROLE PICKER =====
function RolePicker({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-subtle-gray text-sm mt-1.5">Select your account type to sign in.</p>
      </div>

      <div className="space-y-3">
        {(Object.keys(ROLE_CONFIG) as Role[]).map((role, i) => {
          const cfg = ROLE_CONFIG[role];
          return (
            <button
              key={role}
              id={`login-role-${role.toLowerCase()}`}
              onClick={() => onSelect(role)}
              className={`role-card w-full text-left group animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{cfg.label}</p>
                  <p className="text-xs text-subtle-gray mt-0.5">{cfg.subtitle}</p>
                </div>
                <svg className="w-5 h-5 text-subtle-gray group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-subtle-gray mt-8">
        New to careXpatient?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

// ===== OTP STEP =====
function OtpStep({
  phone, onVerified, onBack, isLoading, setIsLoading,
}: {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      await authApi.sendOtp(phone);
      setOtpSent(true);
      setResendCount((c) => c + 1);
      startCountdown();
      toast('OTP sent to your phone number', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { toast('Please enter the 6-digit OTP', 'warning'); return; }
    setIsLoading(true);
    try {
      await authApi.verifyOtp(phone, otp);
      onVerified();
    } catch (err: any) {
      toast(err.message || 'Invalid OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{phone}</p>
          <p className="text-xs text-subtle-gray">OTP will be sent to this number</p>
        </div>
      </div>

      {!otpSent ? (
        <button
          onClick={sendOtp}
          disabled={isLoading}
          className="cx-btn-primary"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Sending...
            </span>
          ) : 'Send OTP'}
        </button>
      ) : (
        <>
          <FormField label="Enter 6-digit OTP">
            <Input
              id="otp-input"
              placeholder="000000"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-xl tracking-widest font-mono"
            />
          </FormField>

          <button
            onClick={verifyOtp}
            disabled={isLoading || otp.length !== 6}
            className="cx-btn-primary"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
          </button>

          <p className="text-center text-sm text-subtle-gray">
            {countdown > 0 ? (
              <span>Resend in <span className="text-primary font-medium">{countdown}s</span></span>
            ) : (
              <button onClick={sendOtp} className="text-primary font-medium hover:underline">
                Resend OTP
              </button>
            )}
          </p>
        </>
      )}

      <button onClick={onBack} className="w-full text-center text-sm text-subtle-gray hover:text-foreground transition-colors mt-2">
        ← Back
      </button>
    </div>
  );
}

// ===== MAIN LOGIN FORM =====
function LoginFormContent({ role, onBack }: { role: Role; onBack: () => void }) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const cfg = ROLE_CONFIG[role];

  const [method, setMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (method === 'password') {
      if (!password) newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Connect to real backend API
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      setAuth({ id: data.id, role, email: data.email, fullName: data.name, phone: '' }, data.token);
      toast(`Welcome back! Redirecting to your dashboard...`, 'success');
      
      const redirectMap: Record<Role, string> = {
        Patient: '/dashboard/patient',
        Doctor: '/dashboard/doctor',
        Lab: '/dashboard/lab',
      };
      setTimeout(() => router.push(redirectMap[role]), 1200);
    } catch (err: any) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpProceed = () => {
    if (!phone.trim() || !/^01[3-9]\d{8}$/.test(phone)) {
      setErrors({ phone: 'Enter a valid BD phone number first' });
      return;
    }
    setErrors({});
    setOtpStep(true);
  };

  const handleOtpVerified = () => {
    toast('Phone verified! Logged in successfully.', 'success');
    router.push(`/dashboard/${role.toLowerCase()}`);
  };

  if (otpStep) {
    return (
      <OtpStep
        phone={phone}
        onVerified={handleOtpVerified}
        onBack={() => setOtpStep(false)}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Role Badge */}
      <div className={`flex items-center gap-2.5 mb-6 ${cfg.bg} rounded-xl p-3`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Welcome back, {cfg.label}</p>
          <p className="text-xs text-subtle-gray">{cfg.badge}</p>
        </div>
        <button onClick={onBack} className="ml-auto text-xs text-subtle-gray hover:text-foreground transition-colors underline">
          Change
        </button>
      </div>

      {/* Patient gets OTP option, Doctor/Lab only password */}
      {role === 'Patient' && (
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            id="tab-password"
            className={`auth-tab ${method === 'password' ? 'active' : ''}`}
            onClick={() => setMethod('password')}
          >
            🔑 Password
          </button>
          <button
            id="tab-otp"
            className={`auth-tab ${method === 'otp' ? 'active' : ''}`}
            onClick={() => setMethod('otp')}
          >
            📱 Phone OTP
          </button>
        </div>
      )}

      <form onSubmit={method === 'password' ? handlePasswordLogin : (e) => { e.preventDefault(); handleOtpProceed(); }} className="space-y-4">
        {method === 'password' ? (
          <FormField label="Email Address" error={errors.email} required>
            <Input
              id={`${role.toLowerCase()}-login-email`}
              type="email"
              placeholder={role === 'Doctor' ? 'doctor@example.com' : 'patient@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          </FormField>
        ) : (
          <FormField label="Phone Number" error={errors.phone} required>
            <Input
              id={`${role.toLowerCase()}-login-phone`}
              type="tel"
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              error={!!errors.phone}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />
          </FormField>
        )}

        {method === 'password' && (
          <FormField label="Password" error={errors.password} required>
            <PasswordInput
              id={`${role.toLowerCase()}-login-password`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
            />
          </FormField>
        )}

        {method === 'password' && (
          <div className="flex justify-end">
            <a href="#" className="text-sm text-primary hover:underline font-medium">
              Forgot password?
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="cx-btn-primary"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Signing in...
            </span>
          ) : method === 'otp' ? 'Continue with OTP' : `Sign in as ${cfg.label}`}
        </button>
      </form>

      <p className="text-center text-sm text-subtle-gray mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign up now
        </Link>
      </p>
    </div>
  );
}

// ===== DEFAULT EXPORT =====
export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const searchParams = useSearchParams();
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setShowExpiredAlert(true);
    }
  }, [searchParams]);

  if (!selectedRole) {
    return (
      <>
        {showExpiredAlert && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium">Session expired. Please login again.</p>
          </div>
        )}
        <RolePicker onSelect={setSelectedRole} />
      </>
    );
  }

  return (
    <LoginFormContent
      role={selectedRole}
      onBack={() => setSelectedRole(null)}
    />
  );
}
