import React, { useState } from 'react';
import { X, AlertTriangle, User } from 'lucide-react';

const REASONS = [
  "Doctor Unavailable",
  "Incorrect Department",
  "Patient No-show",
  "Technical Issues",
  "Schedule Conflict"
];

const CancellationModal = ({ isOpen, onClose, onConfirm, patientName }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onConfirm(`${selectedReason}${note ? ': ' + note : ''}`);
    setSelectedReason("");
    setNote("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#fff1f0', color: '#ba1a1a', padding: '8px', borderRadius: '12px' }}>
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-h2" style={{ margin: 0, fontSize: '18px' }}>Cancel Appointment</h2>
            </div>
            <button onClick={onClose} className="btn btn-text" style={{ padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Patient Summary */}
          <div style={{ background: 'var(--surface-container-low)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Patient Name</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{patientName || "Unknown Patient"}</div>
            </div>
          </div>

          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)' }}>Reason for cancellation</label>
          
          <div className="radio-group">
            {REASONS.map((reason) => (
              <label key={reason} className={`radio-option ${selectedReason === reason ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="reason" 
                  value={reason} 
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{reason}</span>
              </label>
            ))}
          </div>

          <textarea 
            className="form-input" 
            placeholder="Add additional notes (optional)..." 
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-text">Go Back</button>
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary" 
            disabled={!selectedReason}
            style={{ 
              opacity: !selectedReason ? 0.5 : 1,
              cursor: !selectedReason ? 'not-allowed' : 'pointer'
            }}
          >
            Confirm Cancellation
          </button>
        </div>

      </div>
    </div>
  );
};

export default CancellationModal;
