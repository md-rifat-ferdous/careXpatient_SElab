'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/Toast';
import { fetchLabSettings, updateLabProfile, changeLabPassword } from '@/services/lab.service';

type Tab = 'profile' | 'password';

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: '', address: '', phone: '', email: '', fullName: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const labId = user?.id;

  useEffect(() => {
    if (!labId || !token) return;
    fetchLabSettings(labId, token)
      .then(data => setProfile({ name: data.name || '', address: data.address || '', phone: data.phone || '', email: data.email || '', fullName: data.fullName || '' }))
      .catch(() => toast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, [labId, token]);

  const handleSaveProfile = async () => {
    if (!labId || !token) return;
    setSaving(true);
    try {
      await updateLabProfile(profile, labId, token);
      toast('Profile updated', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!labId || !token) return;
    if (password.newPassword !== password.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await changeLabPassword(password.currentPassword, password.newPassword, labId, token);
      toast('Password changed', 'success');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['profile', 'password'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'profile' ? 'Lab Profile' : 'Account'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Lab Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Lab Phone</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Contact Person</label>
              <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
              <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Address</label>
            <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Current Password</label>
            <input type="password" value={password.currentPassword} onChange={e => setPassword(p => ({ ...p, currentPassword: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">New Password</label>
            <input type="password" value={password.newPassword} onChange={e => setPassword(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Confirm New Password</label>
            <input type="password" value={password.confirmPassword} onChange={e => setPassword(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <button onClick={handleChangePassword} disabled={saving || !password.currentPassword || !password.newPassword} className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}
    </div>
  );
}
