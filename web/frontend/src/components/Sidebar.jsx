import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  CircleDollarSign, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { id: 'appointments', icon: <CalendarDays size={22} />, label: 'Appointments' },
    { id: 'patients', icon: <Users size={22} />, label: 'My Patients' },
    { id: 'clinic', icon: <Stethoscope size={22} />, label: 'My Clinic' },
    { id: 'earnings', icon: <CircleDollarSign size={22} />, label: 'Earnings' },
  ];

  return (
    <aside 
      className="sidebar-transition" 
      style={{
        ...sidebarStyle,
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
      }}
    >
      <div style={logoSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && <h1 style={logoText}>careXpatient</h1>}
          <button 
            onClick={onToggle}
            className="btn btn-text"
            style={{ padding: '8px', minWidth: 'auto' }}
          >
            <Menu size={24} />
          </button>
        </div>
        {!isCollapsed && <div style={subLogoText}>Doctor Portal</div>}
      </div>
      
      <nav style={navStyle}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            style={{
              ...(activeTab === item.id ? activeItemStyle : itemStyle),
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '12px' : '14px 20px',
            }}
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            {item.icon}
            {!isCollapsed && <span style={labelStyle}>{item.label}</span>}
          </div>
        ))}
      </nav>

      <div style={footerStyle}>
        <div style={{ ...itemStyle, justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '14px 20px' }}>
          <Settings size={22} />
          {!isCollapsed && <span style={labelStyle}>Settings</span>}
        </div>
        <div 
          style={{ ...itemStyle, justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '14px 20px' }} 
          onClick={() => console.log('logout')}
        >
          <LogOut size={22} />
          {!isCollapsed && <span style={labelStyle}>Logout</span>}
        </div>
      </div>
    </aside>
  );
};

const sidebarStyle = {
  height: '100vh',
  backgroundColor: 'var(--surface)',
  borderRight: '1px solid var(--outline-variant)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 100,
  overflow: 'hidden'
};

const logoSection = {
  padding: '32px 20px',
  minHeight: '120px'
};

const logoText = {
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--primary)',
  margin: 0,
  fontFamily: 'var(--font-heading)',
  whiteSpace: 'nowrap'
};

const subLogoText = {
  fontSize: '10px', 
  color: 'var(--outline)', 
  marginTop: '4px', 
  textTransform: 'uppercase', 
  letterSpacing: '1px',
  fontWeight: '700'
};

const navStyle = {
  flex: 1,
  padding: '0 12px',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  color: 'var(--on-surface-variant)',
  cursor: 'pointer',
  borderRadius: '16px',
  marginBottom: '6px',
  transition: 'all 0.2s ease',
};

const activeItemStyle = {
  ...itemStyle,
  backgroundColor: 'var(--primary-container)',
  color: 'var(--on-primary-container)',
  fontWeight: '600',
};

const labelStyle = {
  fontSize: '14px',
  whiteSpace: 'nowrap'
};

const footerStyle = {
  padding: '16px',
  borderTop: '1px solid var(--outline-variant)',
};

export default Sidebar;
