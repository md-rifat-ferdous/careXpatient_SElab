import React from "react";
import { Video, MapPin, Clock } from "lucide-react";

const StatusChip = ({ status }) => {
  const map = { completed:"chip-success", confirmed:"chip-success", pending:"chip-pending", cancelled:"chip-cancelled" };
  return <span className={`chip ${map[status] || "chip-pending"}`}>{status}</span>;
};

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="card" style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"12px" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:"70px" }}>
        <div style={{ fontSize:"18px", fontWeight:"700", fontFamily:"var(--font-heading)", color:"var(--primary-container)" }}>{appointment.time}</div>
        <div className="text-muted" style={{ fontSize:"12px" }}>{appointment.duration}</div>
      </div>
      <div style={{ width:"2px", height:"50px", backgroundColor:"var(--outline-variant)", borderRadius:"2px" }} />
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:"600", fontSize:"15px", marginBottom:"4px" }}>{appointment.patientName}</div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }} className="text-muted">
          {appointment.isOnline
            ? <><Video size={14} color="var(--primary-container)" /> {appointment.type}</>
            : <><MapPin size={14} /> {appointment.room || appointment.type}</>}
        </div>
      </div>
      <StatusChip status={appointment.status} />
    </div>
  );
};
export default AppointmentCard;

