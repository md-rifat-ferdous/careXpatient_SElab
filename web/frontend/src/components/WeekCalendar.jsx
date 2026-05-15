import React, { useState } from "react";

const days = [
  { day:"Mon", date:22 }, { day:"Tue", date:23 }, { day:"Wed", date:24 },
  { day:"Thu", date:25 }, { day:"Fri", date:26 }
];

const WeekCalendar = ({ onDaySelect }) => {
  const [active, setActive] = useState(22);
  const handleClick = (date) => { setActive(date); onDaySelect && onDaySelect(date); };
  return (
    <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
      {days.map(d => (
        <button key={d.date} onClick={() => handleClick(d.date)}
          style={{ flex:1, padding:"10px 0", borderRadius:"var(--radius-md)", border:"none", cursor:"pointer",
            backgroundColor: active===d.date ? "var(--primary-container)" : "var(--background)",
            color: active===d.date ? "#fff" : "var(--on-surface-variant)",
            fontFamily:"var(--font-body)", transition:"all 0.2s" }}>
          <div style={{ fontSize:"11px", fontWeight:"600", marginBottom:"4px" }}>{d.day}</div>
          <div style={{ fontSize:"16px", fontWeight:"700", fontFamily:"var(--font-heading)" }}>{d.date}</div>
        </button>
      ))}
    </div>
  );
};
export default WeekCalendar;

