import React from "react";
import { User, Check, X } from "lucide-react";

const MobileRequestCard = ({ request, onAccept, onDecline }) => (
  <div style={{ 
    backgroundColor:"var(--surface)", 
    borderRadius:"24px", 
    padding:"16px",
    border: '1px solid var(--outline-variant)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        width:"44px", height:"44px", borderRadius:"12px", 
        backgroundColor:"var(--primary-container)", 
        display:"flex", alignItems:"center", justifyContent:"center" 
      }}>
        <User size={20} color="var(--primary)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight:"700", fontSize:"15px" }}>{request.patientName}</div>
        <div className="text-muted" style={{ fontSize: '12px' }}>{request.type} • {request.time}</div>
      </div>
      <div className="chip chip-pending" style={{ fontSize: '10px' }}>Pending</div>
    </div>
    
    <div style={{ display:"flex", gap:"10px" }}>
      <button onClick={onDecline} className="btn btn-outline" style={{ flex: 1, padding: '10px', borderRadius: '14px', border: 'none', backgroundColor: '#f1f1f1', color: 'var(--on-surface-variant)' }}>
        Decline
      </button>
      <button onClick={() => onAccept(request.id)} className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '14px' }}>
        Accept
      </button>
    </div>
  </div>
);

export default MobileRequestCard;
