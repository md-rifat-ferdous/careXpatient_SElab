import React from 'react';
import { Video, MapPin, Clock, CheckCircle } from 'lucide-react';

const INITIAL_BLOCKS = [
  { time: '09:00 AM', label: 'Checkup', type: 'Physical', status: 'Completed', icon: <CheckCircle size={12} /> },
  { time: '11:30 AM', label: 'Online Consult', type: 'Video', status: 'Current', icon: <Video size={12} /> },
  { time: '02:00 PM', label: 'Room 302', type: 'Physical', status: 'Upcoming', icon: <MapPin size={12} /> }
];

const MobileTimeline = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {INITIAL_BLOCKS.map((block, index) => (
        <div key={index} style={{ 
          background: block.status === 'Current' ? 'var(--primary-container)' : 'white', 
          padding: '12px 16px', 
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid var(--outline-variant)'
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
              {block.time}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--on-surface)' }}>{block.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
              {block.icon} {block.type}
            </div>
          </div>
          <div className={`pill pill-${block.status === 'Completed' ? 'success' : block.status === 'Current' ? 'primary' : 'warning'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
            {block.status}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileTimeline;
