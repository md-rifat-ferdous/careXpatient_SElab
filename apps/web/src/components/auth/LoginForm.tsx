"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { 
  Typography, 
  Card, 
  Button, 
  Input, 
  Badge,
  Toaster,
  toast,
  cn 
} from '@carexpatient/ui';
import { 
  User, 
  Stethoscope, 
  Microscope, 
  ChevronRight, 
  ArrowLeft,
  Lock,
  Phone,
  ShieldCheck,
  Loader2
} from 'lucide-react';

type Role = 'Patient' | 'Doctor' | 'Lab';

const ROLE_CONFIG = {
  Patient: {
    label: 'Patient',
    subtitle: 'Access your health records',
    icon: <User className="w-5 h-5" />,
    color: 'teal',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100 text-teal-600',
    badge: 'Your Wellness, Our Expertise.',
  },
  Doctor: {
    label: 'Doctor',
    subtitle: 'Manage your practice',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'sky',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-600',
    badge: 'Precision & Compassion.',
  },
  Lab: {
    label: 'Diagnostic Lab',
    subtitle: 'Manage lab orders & results',
    icon: <Microscope className="w-5 h-5" />,
    color: 'emerald',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    badge: 'Accuracy You Can Trust.',
  },
};

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: '1',
        fullName: selectedRole === 'Patient' ? 'Rahim Ali' : 'Dr. Sarah Johnson',
        role: selectedRole,
        phone: formData.phone
      };

      setAuth(mockUser as any, 'mock-jwt-token');
      toast.success(`Welcome back, ${mockUser.fullName}!`);
      
      const redirectMap = {
        Patient: '/dashboard/patient',
        Doctor: '/dashboard/doctor',
        Lab: '/dashboard/lab',
      };
      
      router.push(redirectMap[selectedRole!]);
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <Typography variant="h1">Welcome back</Typography>
              <Typography variant="body" className="text-text-muted mt-2">
                Securely access your careXpatient portal
              </Typography>
            </div>

            <div className="space-y-3">
              {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => {
                const cfg = ROLE_CONFIG[role];
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="w-full group relative flex items-center gap-4 p-5 rounded-2xl border border-border-soft bg-surface hover:border-primary/30 hover:shadow-soft transition-all text-left"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors", cfg.iconBg)}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1">
                      <Typography variant="body" className="font-bold group-hover:text-primary transition-colors">{cfg.label}</Typography>
                      <Typography variant="small" className="text-xs text-text-muted">{cfg.subtitle}</Typography>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <Typography variant="small" className="text-text-muted">
                New to careXpatient?{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Create an account
                </Link>
              </Typography>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <button 
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to selection
            </button>

            <div>
              <Typography variant="h1">{ROLE_CONFIG[selectedRole].label} Login</Typography>
              <Typography variant="body" className="text-text-muted mt-2">
                {ROLE_CONFIG[selectedRole].badge}
              </Typography>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Typography variant="small" className="font-bold text-[11px] uppercase tracking-widest text-text-muted ml-1">
                  Phone Number
                </Typography>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="pl-12 h-14 rounded-xl"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Typography variant="small" className="font-bold text-[11px] uppercase tracking-widest text-text-muted ml-1">
                  Password
                </Typography>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 h-14 rounded-xl"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  `Sign in as ${ROLE_CONFIG[selectedRole].label}`
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <Typography variant="small" className="text-text-muted">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Sign up now
                </Link>
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
