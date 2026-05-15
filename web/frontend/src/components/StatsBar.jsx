import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const StatsBar = ({ stats }) => {
  const cards = [
    { label: "Pending Requests", value: stats.pending, icon: <Clock size={22} color="#b45309" />, bg: "#fef9c3", color: "#854d0e" },
    { label: "Confirmed", value: stats.confirmed, icon: <CheckCircle2 size={22} color="#166534" />, bg: "#dcfce7", color: "#166534" },
    { label: "Cancelled", value: stats.cancelled, icon: <XCircle size={22} color="#991b1b" />, bg: "#fee2e2", color: "#991b1b" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"24px" }}>
      {cards.map((card,i) => (
        <div key={i} className="card" style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, backgroundColor:card.bg }}>
            {card.icon}
          </div>
          <div>
            <div style={{ fontSize:"28px", fontWeight:"700", fontFamily:"var(--font-heading)", color:card.color }}>{card.value}</div>
            <div className="text-muted">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default StatsBar;

