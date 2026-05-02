"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.user, data.token);
      router.push('/dashboard/lab-tests');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: regName, phone: regPhone, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.user, data.token);
      router.push('/dashboard/lab-tests');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center px-4 font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[200px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-[150px] -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20"/><path d="M5 12h14"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight">care<span className="text-primary">X</span>patient</span>
          </Link>
          <p className="text-subtle-gray text-lg">Your personal health companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/10 border border-primary/5 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-5 text-lg font-bold transition-all ${tab === 'login' ? 'text-primary border-b-2 border-primary bg-primary/2' : 'text-subtle-gray hover:text-foreground'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-5 text-lg font-bold transition-all ${tab === 'register' ? 'text-primary border-b-2 border-primary bg-primary/2' : 'text-subtle-gray hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-10">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">error</span>
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <div className="text-right">
                  <a href="#" className="text-sm text-primary font-semibold hover:underline">Forgot password?</a>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />Logging in...</>
                  ) : 'Log In'}
                </button>

                {/* Demo hint */}
                <p className="text-xs text-center text-subtle-gray pt-2">
                  Demo: phone <code className="bg-slate-100 px-1 rounded">01700000000</code> / password <code className="bg-slate-100 px-1 rounded">password123</code>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />Creating account...</>
                  ) : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-subtle-gray mt-8">
          <Link href="/" className="text-primary font-semibold hover:underline">← Back to Homepage</Link>
        </p>
      </div>
    </div>
  );
}
