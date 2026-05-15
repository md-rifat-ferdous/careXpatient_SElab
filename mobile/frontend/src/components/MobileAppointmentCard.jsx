import React from "react";
import { Video, MapPin } from "lucide-react";

const MobileAppointmentCard = ({ appointment }) => {
  const s = appointment.status;
  const cls = (s === "completed" || s === "confirmed") ? "chip-success" : "chip-pending";
  return (
    <div className="card" style={{ display:"flex", gap:"14px", marginBottom:"12px" }}>
      <div style={{ width:"4px", borderRadius:"4px", backgroundColor:"var(--primary-container)", flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <div style={{ fontWeight:"600", fontSize:"14px" }}>{appointment.patientName}</div>
          <span className={"chip " + cls}>{s}</span>
        </div>
        <div className="text-muted" style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          {appointment.isOnline
            ? <React.Fragment><Video size={13} color="var(--primary-container)"/>&nbsp;{appointment.type}</React.Fragment>
            : <React.Fragment><MapPin size={13}/>&nbsp;{appointment.room || appointment.type}</React.Fragment>}
        </div>
        <div style={{ marginTop:"6px", fontSize:"13px", color:"var(--primary-container)", fontWeight:"600" }}>
          {appointment.time} &mdash; {appointment.duration}
        </div>
      </div>
    </div>
  );
};
export default MobileAppointmentCard;

