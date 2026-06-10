"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';



function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">{title}</h3>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>);

}

function FieldRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-slate-50 last:border-0">
      <label className="text-sm font-semibold text-slate-600 sm:w-40 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>);

}

function InputField({ value, onChange, type = 'text', placeholder

}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />);


}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-teal-500' : 'bg-slate-200'}`}>
        
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'left-[26px]' : 'left-0.5'}`} />
      </button>
    </div>);

}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone] = useState(user?.phone ?? '');

  // Security fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  // Notifications
  const [notifs, setNotifs] = useState({
    appointments: true,
    labResults: true,
    prescriptions: true,
    smsAlerts: false,
    emailDigest: true,
    systemUpdates: false
  });

  const handleProfileSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await new Promise((r) => setTimeout(r, 800)); // simulate API
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {setSaving(false);}
  };

  const handlePasswordSave = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) {setPwError('All fields are required.');return;}
    if (newPw.length < 8) {setPwError('Password must be at least 8 characters.');return;}
    if (newPw !== confirmPw) {setPwError('New passwords do not match.');return;}
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? document.cookie.match(/token=([^;]+)/)?.[1] : null;
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
      });
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPw('');setNewPw('');setConfirmPw('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const d = await res.json();
        setPwError(d.error ?? 'Failed to change password.');
      }
    } catch {
      setPwError('Could not connect to server.');
    } finally {setSaving(false);}
  };

  const handleNotifSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSuccess('Notification preferences saved!');
    setTimeout(() => setSuccess(''), 3000);
    setSaving(false);
  };

  const tabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' }];


  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, security, and notification preferences.</p>
      </div>

      {/* Success toast */}
      {success &&
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <span className="text-xl">✅</span>
          <span className="font-semibold text-sm">{success}</span>
        </div>
      }

      {/* User header card */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl p-6 flex items-center gap-5 text-white shadow-xl shadow-teal-500/20">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30">
          {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{user?.fullName ?? 'User'}</h2>
          <p className="text-white/70 text-sm">{user?.phone}</p>
          <span className="inline-block mt-1 px-3 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
            {user?.role ?? 'Patient'} Portal
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
          activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`
          }>
          
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' &&
      <SectionCard title="Personal Information" desc="Update your basic profile details">
          <FieldRow label="Full Name">
            <InputField value={fullName} onChange={setFullName} placeholder="Your full name" />
          </FieldRow>
          <FieldRow label="Phone Number">
            <InputField value={phone} onChange={() => {}} placeholder="Phone" type="tel" />
          </FieldRow>
          <FieldRow label="Email Address">
            <InputField value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
          </FieldRow>
          <FieldRow label="Role">
            <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed">
              {user?.role ?? 'Patient'} — cannot be changed
            </div>
          </FieldRow>
          <div className="mt-4 flex justify-end">
            <button
            onClick={handleProfileSave}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-200 disabled:opacity-60">
            
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </SectionCard>
      }

      {/* Security Tab */}
      {activeTab === 'security' &&
      <div className="space-y-4">
          <SectionCard title="Change Password" desc="Use a strong password of at least 8 characters">
            {pwError &&
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm font-semibold">
                ⚠️ {pwError}
              </div>
          }
            <FieldRow label="Current Password">
              <InputField value={currentPw} onChange={setCurrentPw} type="password" placeholder="Enter current password" />
            </FieldRow>
            <FieldRow label="New Password">
              <InputField value={newPw} onChange={setNewPw} type="password" placeholder="Enter new password" />
            </FieldRow>
            <FieldRow label="Confirm New Password">
              <InputField value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Confirm new password" />
            </FieldRow>
            <div className="mt-4 flex justify-end">
              <button
              onClick={handlePasswordSave}
              disabled={saving}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-200 disabled:opacity-60">
              
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Active Sessions" desc="Devices currently logged in to your account">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 text-xl">💻</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Current Session</p>
                <p className="text-xs text-slate-400">Browser — Active now</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </SectionCard>
        </div>
      }

      {/* Notifications Tab */}
      {activeTab === 'notifications' &&
      <div className="space-y-4">
          <SectionCard title="In-App Notifications" desc="What you want to be notified about">
            <Toggle checked={notifs.appointments} onChange={(v) => setNotifs((n) => ({ ...n, appointments: v }))} label="Appointment reminders & updates" />
            <Toggle checked={notifs.labResults} onChange={(v) => setNotifs((n) => ({ ...n, labResults: v }))} label="Lab results ready" />
            <Toggle checked={notifs.prescriptions} onChange={(v) => setNotifs((n) => ({ ...n, prescriptions: v }))} label="New prescriptions issued" />
            <Toggle checked={notifs.systemUpdates} onChange={(v) => setNotifs((n) => ({ ...n, systemUpdates: v }))} label="System updates & announcements" />
          </SectionCard>

          <SectionCard title="External Notifications" desc="Alerts sent outside the app">
            <Toggle checked={notifs.smsAlerts} onChange={(v) => setNotifs((n) => ({ ...n, smsAlerts: v }))} label="SMS alerts (appointment only)" />
            <Toggle checked={notifs.emailDigest} onChange={(v) => setNotifs((n) => ({ ...n, emailDigest: v }))} label="Weekly email digest" />
          </SectionCard>

          <div className="flex justify-end">
            <button
            onClick={handleNotifSave}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-200 disabled:opacity-60">
            
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>
      }
    </div>);

}