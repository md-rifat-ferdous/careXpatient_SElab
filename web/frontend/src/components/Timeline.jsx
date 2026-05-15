import React from 'react';
import { Video, MapPin, Clock, CheckCircle, Info } from 'lucide-react';

const SCHEDULE_DATA = [
  { id: 1, time: "09:00 AM", label: "Checkup", status: "Completed", type: "Physical" },
  { id: 2, time: "11:30 AM", label: "Online Consultation", status: "Current", type: "Video" },
  { id: 3, time: "01:00 PM", label: "Lunch Break", status: "Break", type: "Personal" },
  { id: 4, time: "02:00 PM", label: "Room 302", status: "Upcoming", type: "Physical" },
  { id: 5, time: "03:30 PM", label: "Available Slot", status: "Available", type: "Free" }
];

const Timeline = ({ filter }) => {
  const filteredData = SCHEDULE_DATA.filter(item => {
    if (filter === 'Online') return item.type === 'Video' || item.type === 'Personal';
    if (filter === 'In-person') return item.type === 'Physical' || item.type === 'Personal';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {filteredData.map((item, index) => (
        <div 
          key={item.id} 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '80px 1fr', 
            padding: '14px 16px',
            borderBottom: index === filteredData.length - 1 ? 'none' : '1px solid var(--outline-variant)',
            background: item.status === 'Current' ? 'var(--surface-container)' : 'transparent',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: item.status === 'Current' ? 'var(--primary)' : 'var(--on-surface-variant)',
            letterSpacing: '0.02em'
          }}>
            {item.time}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: getDotColor(item.status) 
              }} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: item.status === 'Current' ? 'var(--primary)' : 'var(--on-surface)' 
              }}>
                {item.label}
              </span>
            </div>
            
            <div className={`pill pill-${getPillType(item.status)}`} style={{ fontSize: '9px', padding: '1px 8px' }}>
              {item.status}
            </div>
          </div>
        </div>
      ))}
      {filteredData.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
          No schedule blocks for this view
        </div>
      )}
    </div>
  );
};

const getDotColor = (status) => {
  switch (status) {
    case 'Completed': return 'var(--success)';
    case 'Current': return 'var(--primary)';
    case 'Break': return 'var(--outline)';
    case 'Available': return 'var(--outline-variant)';
    default: return 'var(--outline)';
  }
};

const getPillType = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Current': return 'primary';
    case 'Break': return 'warning';
    case 'Available': return 'primary';
    default: return 'warning';
  }
};

export default Timeline;
