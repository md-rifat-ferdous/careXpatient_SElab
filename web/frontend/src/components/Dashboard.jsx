import React from 'react';
import { User, ArrowRight, Activity, Clock } from 'lucide-react';

const Dashboard = ({ stats, nextAppointment }) => {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-h1">Good Morning, Dr. Jenkins</h1>
        <p className="text-body-sm">Here's what's happening in your clinic today.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Next Appointment Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 className="text-h2">Next Appointment</h3>
              <span className="pill pill-primary">In 15 Minutes</span>
            </div>
            
            {nextAppointment ? (
              <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={32} color="var(--primary)" />
                </div>
                <div>
                  <div className="text-h2" style={{ fontSize: '20px' }}>{nextAppointment.patientName}</div>
                  <div className="text-body-sm">{nextAppointment.type} • {nextAppointment.time}</div>
                </div>
              </div>
            ) : (
              <p className="text-body-sm">No upcoming appointments in the next hour.</p>
            )}
          </div>
          
          <div style={{ marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--spacing-md)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-text">
              View Schedule <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card" style={{ padding: 'var(--spacing-md)', background: 'var(--surface-container-low)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--primary)', marginBottom: '8px' }}>
              <Activity size={18} />
              <span style={{ fontWeight: '700', fontSize: '14px' }}>DAILY THROUGHPUT</span>
            </div>
            <div className="text-h2">14/20</div>
            <div className="text-body-sm">Patients seen today</div>
          </div>

          <div className="card" style={{ padding: 'var(--spacing-md)', background: 'var(--surface-container-low)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--tertiary)', marginBottom: '8px' }}>
              <Clock size={18} />
              <span style={{ fontWeight: '700', fontSize: '14px' }}>AVG. SESSION</span>
            </div>
            <div className="text-h2">18 min</div>
            <div className="text-body-sm">Consultation time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
