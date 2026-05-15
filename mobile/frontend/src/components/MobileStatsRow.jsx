import React from "react";

const MobileStatsRow = ({ stats }) => {
  const items = [
    { label:"Today", value:stats.pending + stats.confirmed, color:"var(--primary)", bg:"var(--primary-container)" },
    { label:"Pending", value:stats.pending, color:"#854d0e", bg:"#fff8e1" },
    { label:"Confirmed", value:stats.confirmed, color:"var(--on-tertiary-container)", bg:"var(--tertiary-container)" },
    { label:"Cancelled", value:stats.cancelled, color:"var(--on-error-container)", bg:"var(--error-container)" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"24px" }}>
      {items.map((item,i) => (
        <div key={i} style={{ 
          backgroundColor:item.bg, 
          borderRadius:"20px", 
          padding:"14px 8px", 
          textAlign:"center",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ fontSize:"24px", fontWeight:"800", fontFamily:"var(--font-heading)", color:item.color, lineHeight: 1 }}>{item.value}</div>
          <div style={{ fontSize:"10px", color:item.color, fontWeight:"700", textTransform: 'uppercase', marginTop:"4px", letterSpacing: '0.5px' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default MobileStatsRow;
