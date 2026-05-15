import React from "react";
import { Bell } from "lucide-react";

const MobileHeader = () => (
  <header style={{
    position:"sticky", top:0, zIndex:50,
    backgroundColor:"var(--surface)", borderBottom:"1px solid var(--outline-variant)",
    padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between"
  }}>
    <div>
      <h1 style={{ fontSize:"20px", color:"var(--primary-container)", margin:0 }}>careXpatient</h1>
      <p style={{ fontSize:"12px", color:"var(--on-surface-variant)", marginTop:"2px" }}>Doctor Portal</p>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
      <button style={{ position:"relative", background:"#e5eeff", border:"none", borderRadius:"50%",
        width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
        <Bell size={18} color="var(--primary-container)" />
        <span style={{ position:"absolute", top:"6px", right:"6px", width:"8px", height:"8px",
          borderRadius:"50%", backgroundColor:"#ef4444" }} />
      </button>
      <div style={{ width:"38px", height:"38px", borderRadius:"50%", backgroundColor:"var(--primary-container)",
        display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"700", fontSize:"14px" }}>
        SJ
      </div>
    </div>
  </header>
);

export default MobileHeader;

