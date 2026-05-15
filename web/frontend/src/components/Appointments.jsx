import React, { useState } from 'react';
import RequestCard from './RequestCard';
import Timeline from './Timeline';
import { User, MoreHorizontal, Activity } from 'lucide-react';

const Appointments = ({ requests, appointments, onAccept, onDecline }) => {
  const [activeFilter, setActiveFilter] = useState('Today');
  const filters = ['Today', 'Upcoming', 'Pending', 'Online', 'In-person'];

  // Filter Logic
  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'Pending') return true;
    if (activeFilter === 'Today' && r.date === 'Today') return true;
    return false;
  });

  const filteredAppointments = appointments.filter(a => {
    if (activeFilter === 'Today') return true; // Show all for today summary
    if (activeFilter === 'Upcoming') return a.status === 'confirmed';
    if (activeFilter === 'Online') return a.isOnline;
    if (activeFilter === 'In-person') return !a.isOnline;
    return false;
  });

  const showCurrentSession = activeFilter === 'Today' || activeFilter === 'Online';
  const showRequests = activeFilter === 'Today' || activeFilter === 'Pending';
  const showUpcomingList = activeFilter === 'Upcoming';
  const showTimeline = activeFilter !== 'Pending' && activeFilter !== 'Upcoming';

  return (
    <div className="fade-in">
      {/* Top Workflow Filters */}
      <div className="filter-tabs">
        {filters.map(filter => (
          <div 
            key={filter}
            className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </div>
        ))}
      </div>

      <div className="appointments-grid-stitch">
        {/* Left Column: Core Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Current Session Hero Card - Only for Today/Online */}
          {showCurrentSession && (
            <section className="fade-in">
              <h3 className="text-body-sm" style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>CURRENT SESSION</h3>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, #004d40 100%)', 
                color: 'white', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={32} />
                  </div>
                  <div>
                    <div className="text-h2" style={{ color: 'white', marginBottom: '2px' }}>Marcus Johnson</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Video Consultation • Started 8m ago</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>Start Session</button>
              </div>
            </section>
          )}

          {/* Appointment Requests - Only for Today/Pending */}
          {showRequests && (
            <section className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h2 className="text-h2" style={{ fontSize: '20px' }}>{activeFilter === 'Pending' ? 'All Pending Requests' : 'New Requests Today'}</h2>
                <span className="pill pill-error">{filteredRequests.length} Requests</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {filteredRequests.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <p className="text-body-sm">No pending requests in this view</p>
                  </div>
                ) : (
                  filteredRequests.map(r => (
                    <RequestCard key={r.id} request={r} onAccept={onAccept} onDecline={onDecline} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Upcoming Appointments List - Only for Upcoming tab */}
          {showUpcomingList && (
            <section className="fade-in">
              <h2 className="text-h2" style={{ fontSize: '20px', marginBottom: 'var(--spacing-md)' }}>Future Appointments</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {filteredAppointments.map(a => (
                  <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                      <div className="text-body-sm">{a.type} • {a.date} at {a.time}</div>
                    </div>
                    <span className={`pill pill-primary`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Schedule Timeline */}
        {showTimeline && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h2 className="text-h2" style={{ fontSize: '20px' }}>{activeFilter} Schedule</h2>
              <button className="btn btn-text" style={{ padding: '4px' }}><MoreHorizontal size={20} /></button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Timeline filter={activeFilter} />
            </div>
            
            <div className="card" style={{ marginTop: 'var(--spacing-lg)', background: 'var(--surface-container-low)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                <Activity size={18} />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>DAILY PROGRESS</span>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Completed</span>
                  <span>8 / 12</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '66%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Appointments;
