import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const MobileCancellationModal = ({ isOpen, onClose, onConfirm, patientName }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    { id: 'conflict', label: 'Conflict with another appointment' },
    { id: 'emergency', label: 'Emergency / Urgent case' },
    { id: 'personal', label: 'Personal / Health reasons' },
    { id: 'other', label: 'Other (specify below)' }
  ];

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reasonText = selectedReason === 'other' ? customReason : reasons.find(r => r.id === selectedReason)?.label;
    onConfirm(reasonText);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(11, 28, 48, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 2000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 24px 40px 24px',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '48px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '100px', margin: '0 auto 24px' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#ffdad6', padding: '10px', borderRadius: '14px' }}>
            <AlertCircle color="#ba1a1a" size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--on-surface)' }}>Cancel Appointment</h3>
        </div>

        <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginBottom: '24px', lineHeight: '1.5' }}>
          Provide a reason for cancelling <strong>{patientName}'s</strong> appointment.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {reasons.map((reason) => (
            <label 
              key={reason.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                borderRadius: '20px', 
                border: '1px solid var(--outline-variant)',
                backgroundColor: selectedReason === reason.id ? 'var(--surface-container)' : 'white',
                borderColor: selectedReason === reason.id ? 'var(--primary)' : 'var(--outline-variant)'
              }}
            >
              <input 
                type="radio" 
                name="mobileCancelReason" 
                value={reason.id} 
                checked={selectedReason === reason.id}
                onChange={() => setSelectedReason(reason.id)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>{reason.label}</span>
            </label>
          ))}
        </div>

        {selectedReason === 'other' && (
          <textarea
            placeholder="Specify reason..."
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '20px', 
              border: '1px solid var(--outline-variant)', 
              marginBottom: '24px',
              minHeight: '100px',
              fontFamily: 'inherit',
              fontSize: '15px',
              backgroundColor: '#f8f9ff'
            }}
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
          />
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '16px', height: '56px' }} onClick={onClose}>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, backgroundColor: 'var(--error)', borderRadius: '16px', height: '56px' }} 
            disabled={!selectedReason || (selectedReason === 'other' && !customReason)} 
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MobileCancellationModal;
