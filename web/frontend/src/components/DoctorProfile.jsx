import React from "react";
import { Bell, Search } from "lucide-react";

const DoctorProfile = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
    <div style={{ position: 'relative', width: '300px' }}>
      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
      <input 
        type="text" 
        placeholder="Search patients, records..." 
        style={{
          width: '100%',
          padding: '12px 16px 12px 40px',
          borderRadius: '100px',
          border: '1px solid var(--outline-variant)',
          backgroundColor: 'var(--surface)',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
      />
    </div>

    <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
      <div style={{ textAlign: 'right' }}>
        <h3 style={{ fontSize: '16px', margin: 0 }}>Dr. Sarah Jenkins</h3>
        <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Chief of Surgery</p>
      </div>

      <button className="btn btn-tonal" style={{ position:"relative", padding:"10px", width: '44px', height: '44px' }}>
        <Bell size={20} />
        <span style={{ 
          position:"absolute", top:"2px", right:"2px", width:"18px", height:"18px",
          borderRadius:"50%", backgroundColor:"var(--primary)", color:"#fff",
          fontSize:"10px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center" 
        }}>3</span>
      </button>
      
      <div style={{ 
        width:"48px", height:"48px", borderRadius:"16px", backgroundColor:"var(--primary)",
        display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"700", fontSize:"18px" 
      }}>
        SJ
      </div>
    </div>
  </div>
);

export default DoctorProfile;
