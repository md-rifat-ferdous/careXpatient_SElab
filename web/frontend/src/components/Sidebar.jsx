import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard',         icon: 'dashboard',             label: 'Dashboard' },
  { path: '/test-queue',        icon: 'queue',                 label: 'Test Queue' },
  { path: '/sample-collection', icon: 'biotech',               label: 'Sample Collection' },
  { path: '/patients',          icon: 'groups',                label: 'Patients' },
  { path: '/upload-reports',    icon: 'upload_file',           label: 'Upload Reports' },
  { path: '/test-management',   icon: 'settings_applications', label: 'Test Management' },
  { path: '/earnings',          icon: 'payments',              label: 'Earnings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeClass =
    'flex items-center gap-3 py-2 px-3 rounded-lg text-primary-container font-bold border-l-4 border-primary-container bg-primary-container/10 transition-colors duration-200';
  const inactiveClass =
    'flex items-center gap-3 py-2 px-3 rounded-lg text-on-surface-variant hover:text-primary-container hover:bg-surface-container-low border-l-4 border-transparent transition-colors duration-200';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 p-3 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1 rounded-lg bg-surface-white shadow-sm text-on-surface-variant focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          h-screen border-r border-outline-variant bg-surface-white flex flex-col py-6 px-4 z-50
          fixed md:relative
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[4.5rem]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => { setCollapsed(c => !c); setMobileOpen(false); }}
            className="p-1 rounded-lg hover:bg-surface-container-low text-on-surface-variant focus:outline-none shrink-0"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>science</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-on-surface tracking-tight leading-tight">careXpatient</h1>
                <p className="text-[11px] text-subtle-gray font-medium">Lab Portal</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
              onClick={() => setMobileOpen(false)}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={undefined}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">
          <NavLink
            to="/settings"
            title={collapsed ? 'Settings' : ''}
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            onClick={() => setMobileOpen(false)}
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            {!collapsed && <span className="text-sm truncate">Settings</span>}
          </NavLink>

          <button className="flex items-center gap-3 py-2 px-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 border-l-4 border-transparent transition-colors duration-200 w-full">
            <span className="material-symbols-outlined shrink-0">logout</span>
            {!collapsed && <span className="text-sm truncate">Logout</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-3 mt-3 px-1">
              <img
                src="/assets/578ba36a0d95ca3e4ebef169c728e2b6.png"
                alt="Staff Profile"
                className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
              />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-on-surface truncate">Dr. S. Rahman</p>
                <p className="text-xs text-subtle-gray truncate">Lead Pathologist</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
