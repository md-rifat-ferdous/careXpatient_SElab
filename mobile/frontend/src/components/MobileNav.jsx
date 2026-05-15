import React from "react";
import { Home, CalendarDays, Users, User } from "lucide-react";

const tabs = [
  { icon: Home,        label:"Home",     id:"home"     },
  { icon: CalendarDays,label:"Schedule", id:"schedule" },
  { icon: Users,       label:"Patients", id:"patients" },
  { icon: User,        label:"Profile",  id:"profile"  },
];

const MobileNav = ({ active, onTabChange }) => (
  <nav style={{
    position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
    width:"100%", maxWidth:"430px", backgroundColor:"var(--surface)",
    borderTop:"1px solid var(--outline-variant)", display:"flex",
    zIndex:100, boxShadow:"0 -2px 12px rgba(0,0,0,0.07)"
  }}>
    {tabs.map(t => {
      const Icon = t.icon;
      const isActive = active === t.id;
      return (
        <button key={t.id} onClick={() => onTabChange(t.id)}
          style={{ flex:1, padding:"12px 4px", border:"none", background:"transparent",
            cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
            color: isActive ? "var(--primary-container)" : "var(--on-surface-variant)" }}>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          <span style={{ fontSize:"11px", fontWeight: isActive ? "600":"400" }}>{t.label}</span>
        </button>
      );
    })}
  </nav>
);

export default MobileNav;

