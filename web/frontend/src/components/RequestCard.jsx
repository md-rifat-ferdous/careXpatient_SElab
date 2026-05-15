import React from "react";
import { User, Check, X, Clock } from "lucide-react";

const RequestCard = ({ request, onAccept, onDecline }) => {
  return (
    <div className="card" style={{ 
      display:"flex", 
      alignItems:"center", 
      gap:"var(--spacing-md)", 
      padding: '12px 16px',
      boxShadow: 'none',
      backgroundColor: 'white'
    }}>
      <div style={{ 
        width:"44px", 
        height:"44px", 
        borderRadius:"12px", 
        backgroundColor:"var(--surface-container-low)", 
        display:"flex", 
        alignItems:"center", 
        justifyContent:"center", 
        flexShrink:0 
      }}>
        <User size={24} color="var(--primary)" />
      </div>
      
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:"700", fontSize:"15px", color: 'var(--on-surface)' }}>{request.patientName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '1px' }}>
          <Clock size={12} />
          {request.type} • {request.time}
        </div>
      </div>

      <div style={{ display:"flex", gap:"var(--spacing-xs)" }}>
        <button 
          onClick={() => onDecline(request)} 
          className="btn btn-text" 
          style={{ color: 'var(--error)', padding: '6px 12px' }}
        >
          <X size={16} /> Decline
        </button>
        <button 
          onClick={() => onAccept(request.id)} 
          className="btn btn-primary" 
          style={{ padding: '6px 16px' }}
        >
          <Check size={16} /> Accept
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
