import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

const TABS = ['Lab Profile', 'Operating Hours', 'Notifications', 'Account'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Lab Profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Local form states
  const [profile, setProfile] = useState({ name: '', address: '', phone: '' });
  const [hours, setHours] = useState({ weekdays: '', saturday: '', sunday: '' });
  const [notifs, setNotifs] = useState({ emailOnBooking: true, smsOnCollected: true, emailOnReady: true, smsOnReady: true });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSettings(res.data);
          setProfile({ name: res.data.profile.name || '', address: res.data.profile.address || '', phone: res.data.profile.phone || '' });
          setHours(res.data.operatingHours || { weekdays: '', saturday: '', sunday: '' });
          setNotifs(res.data.notifications || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true); setSuccessMsg(''); setError('');
    const res = await fetch(`${API}/api/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, operatingHours: hours, notifications: notifs })
    }).then(r => r.json()).catch(() => null);
    setSaving(false);
    if (res?.success) setSuccessMsg('Settings saved successfully.');
    else setError(res?.error || 'Failed to save.');
  };

  const changePassword = async () => {
    if (password.newPass !== password.confirm) { setError('New passwords do not match.'); return; }
    if (!password.current || !password.newPass) { setError('All password fields are required.'); return; }
    setSaving(true); setSuccessMsg(''); setError('');
    const res = await fetch(`${API}/api/settings/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: password.current, newPassword: password.newPass })
    }).then(r => r.json()).catch(() => null);
    setSaving(false);
    if (res?.success) { setSuccessMsg('Password changed successfully.'); setPassword({ current: '', newPass: '', confirm: '' }); }
    else setError(res?.error || 'Password change failed.');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">refresh</span>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Settings</h2>
        <p className="text-on-surface-variant font-medium mt-1">Configure your lab profile, operating hours, and account preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-background-off-white p-1 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSuccessMsg(''); setError(''); }}
            className={`px-5 py-2.5 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-surface-white text-primary-container shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Messages */}
      {successMsg && <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl"><span className="material-symbols-outlined text-[18px]">check_circle</span>{successMsg}</div>}
      {error && <div className="mb-4 flex items-center gap-2 text-sm text-error bg-error-container/30 px-4 py-3 rounded-xl"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}

      {/* Lab Profile Tab */}
      {activeTab === 'Lab Profile' && (
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container">business</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Lab Information</h3>
              <p className="text-xs text-on-surface-variant">Update your lab's public profile</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {[
              { key: 'name',    label: 'Lab Name',     placeholder: 'Modern Lab Center' },
              { key: 'phone',   label: 'Phone Number', placeholder: '+880 1700 000 000' },
              { key: 'address', label: 'Address',      placeholder: 'Uttara, Dhaka, Bangladesh' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-on-surface mb-2">{f.label}</label>
                {f.key === 'address' ? (
                  <textarea value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} rows={3}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none resize-none" />
                ) : (
                  <input type="text" value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none" />
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-60 shadow-md hover:shadow-lg">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operating Hours Tab */}
      {activeTab === 'Operating Hours' && (
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600">schedule</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Operating Hours</h3>
              <p className="text-xs text-on-surface-variant">Set your lab's opening and closing times</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {[
              { key: 'weekdays', label: 'Weekdays (Mon–Fri)', placeholder: '08:00 AM – 08:00 PM' },
              { key: 'saturday', label: 'Saturday',           placeholder: '09:00 AM – 05:00 PM' },
              { key: 'sunday',   label: 'Sunday',             placeholder: 'Closed' },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-4">
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <span className="material-symbols-outlined text-primary-container/60 text-[20px]">calendar_today</span>
                  <label className="text-sm font-semibold text-on-surface">{f.label}</label>
                </div>
                <input type="text" value={hours[f.key] || ''} onChange={e => setHours(h => ({ ...h, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="flex-1 border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none" />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-60 shadow-md">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? 'Saving...' : 'Save Hours'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'Notifications' && (
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">notifications</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Notification Preferences</h3>
              <p className="text-xs text-on-surface-variant">Configure how patients are notified (mock dispatch)</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: 'emailOnBooking',  label: 'Email on New Booking',           desc: 'Send email to lab when new order is placed' },
              { key: 'smsOnCollected',  label: 'SMS on Sample Collected',        desc: 'Notify patient when their sample is collected' },
              { key: 'emailOnReady',    label: 'Email when Report is Ready',     desc: 'Send email to patient when report is signed' },
              { key: 'smsOnReady',      label: 'SMS when Report is Ready',       desc: 'Send SMS to patient when report is signed' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-background-off-white transition-colors">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{n.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{n.desc}</p>
                </div>
                <button
                  onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${notifs[n.key] ? 'bg-primary-container' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${notifs[n.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-60 shadow-md">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account / Password Tab */}
      {activeTab === 'Account' && (
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm p-6 flex items-center gap-5">
            <img src="/assets/578ba36a0d95ca3e4ebef169c728e2b6.png" alt="Staff" className="w-16 h-16 rounded-full object-cover border-2 border-primary-container/30" />
            <div>
              <h3 className="font-bold text-lg text-on-surface">Dr. S. Rahman</h3>
              <p className="text-sm text-on-surface-variant">Lead Pathologist · Modern Lab Center</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-primary-container/10 text-primary-container px-2.5 py-0.5 rounded-full">Lab Admin</span>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">lock</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Change Password</h3>
                <p className="text-xs text-on-surface-variant">Update your staff account password</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'newPass', label: 'New Password',     placeholder: 'Enter new password' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-on-surface mb-2">{f.label}</label>
                  <input type="password" value={password[f.key]} onChange={e => setPassword(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none" />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={changePassword} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-error text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all disabled:opacity-60 shadow-md">
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
