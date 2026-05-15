const fs = require('fs');
const path = require('path');

const files = {

// ─── MOBILE COMPONENTS ──────────────────────────────────────────────────────

'mobile/frontend/src/components/MobileAppointmentCard.jsx': `
import React from 'react';
import { Video, MapPin } from 'lucide-react';

const MobileAppointmentCard = ({ appointment }) => {
  const s = appointment.status;
  const cls = (s === 'completed' || s === 'confirmed') ? 'chip-success' : 'chip-pending';
  return (
    <div className="card" style={{ display:'flex', gap:'14px', marginBottom:'12px' }}>
      <div style={{ width:'4px', borderRadius:'4px', backgroundColor:'var(--primary-container)', flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
          <div style={{ fontWeight:'600', fontSize:'14px' }}>{appointment.patientName}</div>
          <span className={\`chip \${cls}\`}>{s}</span>
        </div>
        <div className="text-muted" style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {appointment.isOnline
            ? <><Video size={13} color="var(--primary-container)" />{appointment.type}</>
            : <><MapPin size={13} />{appointment.room || appointment.type}</>}
        </div>
        <div style={{ marginTop:'6px', fontSize:'13px', color:'var(--primary-container)', fontWeight:'600' }}>
          {appointment.time} — {appointment.duration}
        </div>
      </div>
    </div>
  );
};
export default MobileAppointmentCard;
`.trim(),

// ─── MOBILE APP.JSX ─────────────────────────────────────────────────────────

'mobile/frontend/src/App.jsx': `
import React, { useState } from 'react';
import MobileHeader from './components/MobileHeader';
import MobileNav from './components/MobileNav';
import MobileStatsRow from './components/MobileStatsRow';
import MobileRequestCard from './components/MobileRequestCard';
import MobileAppointmentCard from './components/MobileAppointmentCard';
import { appointments as apptData, requests as reqData, stats } from './data/dummyData';
import './index.css';

function App() {
  const [tab, setTab] = useState('home');
  const [filter, setFilter] = useState('Today');
  const [requests, setRequests] = useState(reqData);
  const [appointments] = useState(apptData);

  const handleAccept  = (id) => setRequests(prev => prev.filter(r => r.id !== id));
  const handleDecline = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  const filters = ['Today', 'Upcoming', 'Pending', 'Online', 'In-Person'];

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--background)', paddingBottom:'80px' }}>
      <MobileHeader />

      <div style={{ padding:'16px 16px 0' }}>
        <h2 style={{ fontSize:'20px', marginBottom:'4px' }}>Dr. Sarah Jenkins</h2>
        <p className="text-muted" style={{ marginBottom:'16px' }}>Chief of Surgery</p>
        <MobileStatsRow stats={stats} />

        {/* Filter Tabs */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px', marginBottom:'20px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink:0, padding:'7px 14px', borderRadius:'20px', border:'1px solid var(--outline-variant)',
              cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'13px',
              backgroundColor: filter === f ? 'var(--primary-container)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--on-surface-variant)'
            }}>{f}</button>
          ))}
        </div>

        {/* Appointment Requests */}
        {requests.length > 0 && (
          <div style={{ marginBottom:'24px' }}>
            <h3 style={{ fontSize:'16px', marginBottom:'12px' }}>Appointment Requests</h3>
            {requests.map(r => (
              <MobileRequestCard key={r.id} request={r} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </div>
        )}

        {/* Today Schedule */}
        <div>
          <h3 style={{ fontSize:'16px', marginBottom:'12px' }}>Today's Schedule</h3>
          {appointments.map(a => (
            <MobileAppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      </div>

      <MobileNav active={tab} onTabChange={setTab} />
    </div>
  );
}
export default App;
`.trim(),

'mobile/frontend/src/App.css': '/* Mobile-specific overrides */',

// ─── WEB App.jsx (improved) ──────────────────────────────────────────────────

'web/frontend/src/App.jsx': `
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import RequestCard from './components/RequestCard';
import AppointmentCard from './components/AppointmentCard';
import WeekCalendar from './components/WeekCalendar';
import DoctorProfile from './components/DoctorProfile';
import { appointments as apptData, requests as reqData, stats } from './data/dummyData';
import './index.css';

function App() {
  const [requests, setRequests]       = useState(reqData);
  const [appointments]                = useState(apptData);
  const [filter, setFilter]           = useState('all');

  const handleAccept  = (id) => setRequests(prev => prev.filter(r => r.id !== id));
  const handleDecline = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  const filtered = appointments.filter(a => {
    if (filter === 'online')   return a.isOnline;
    if (filter === 'inperson') return !a.isOnline;
    return true;
  });

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ marginLeft:'var(--sidebar-width)', flex:1, padding:'40px', overflowY:'auto' }}>
        <DoctorProfile />
        <StatsBar stats={stats} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
          {/* Appointment Requests */}
          <div className="card">
            <h3 style={{ fontSize:'18px', marginBottom:'16px' }}>Appointment Requests</h3>
            {requests.length === 0
              ? <p className="text-muted" style={{ textAlign:'center', padding:'20px' }}>No pending requests</p>
              : requests.map(r => (
                  <RequestCard key={r.id} request={r} onAccept={handleAccept} onDecline={handleDecline} />
                ))
            }
          </div>

          {/* Today's Schedule */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ fontSize:'18px' }}>Today's Schedule</h3>
              <div style={{ display:'flex', gap:'6px' }}>
                {[['all','All'],['online','Online'],['inperson','In-Person']].map(([key,label]) => (
                  <button key={key} onClick={() => setFilter(key)} style={{
                    padding:'5px 12px', borderRadius:'20px', border:'1px solid var(--outline-variant)',
                    cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'12px',
                    backgroundColor: filter === key ? 'var(--primary-container)' : 'transparent',
                    color: filter === key ? '#fff' : 'var(--on-surface-variant)'
                  }}>{label}</button>
                ))}
              </div>
            </div>
            <WeekCalendar />
            {filtered.length === 0
              ? <p className="text-muted" style={{ textAlign:'center', padding:'20px' }}>No appointments for this filter</p>
              : filtered.map(a => <AppointmentCard key={a.id} appointment={a} />)
            }
          </div>
        </div>
      </main>
    </div>
  );
}
export default App;
`.trim(),

};

// Write all files
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.resolve(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Written:', relPath);
}
console.log('\nAll files written successfully!');
