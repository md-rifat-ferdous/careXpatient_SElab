import React, { useState, useEffect } from "react";
import MobileHeader from "./components/MobileHeader";
import MobileNav from "./components/MobileNav";
import MobileStatsRow from "./components/MobileStatsRow";
import MobileRequestCard from "./components/MobileRequestCard";
import MobileTimeline from "./components/MobileTimeline";
import MobileCancellationModal from "./components/MobileCancellationModal";
import "./index.css";

function App() {
  const [tab, setTab] = useState("home"); // 'home' or 'schedule'
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchData = async () => {
    try {
      const [apptsRes, reqsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3002/api/appointments'),
        fetch('http://localhost:3002/api/requests'),
        fetch('http://localhost:3002/api/stats')
      ]);
      const appts = await apptsRes.json();
      const reqs = await reqsRes.json();
      const st = await statsRes.json();
      
      setAppointments(appts.map(a => ({
        ...a,
        patientName: a.patient_name,
        time: a.appointment_time,
        isOnline: a.is_online
      })));
      setRequests(reqs.map(r => ({
        ...r,
        patientName: r.patient_name,
        time: r.request_time,
        date: r.request_date
      })));
      setStats(st);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id) => {
    try {
      await fetch(`http://localhost:3002/api/requests/${id}/accept`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineClick = (request) => {
    setSelectedRequest(request);
    setIsCancelModalOpen(true);
  };

  const handleConfirmDecline = async (reason) => {
    if (!selectedRequest) return;
    try {
      await fetch(`http://localhost:3002/api/requests/${selectedRequest.id}/decline`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }) 
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontFamily: 'var(--font-body)' }}>Loading...</div>;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"var(--background)", paddingBottom:"80px", fontFamily: 'var(--font-body)' }}>
      <MobileHeader />
      
      <div style={{ padding:"20px 20px 0" }}>
        {tab === 'home' && (
          <div className="fade-in">
            <h2 style={{ fontSize:"22px", marginBottom:"4px" }}>Dr. Sarah Jenkins</h2>
            <p className="text-muted" style={{ marginBottom:"24px" }}>Chief of Surgery</p>
            
            <MobileStatsRow stats={stats} />

            <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Next Appointment</h3>
              {appointments.length > 0 ? (
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px' }}>{appointments[0].patientName}</div>
                  <div className="text-muted">{appointments[0].time} • {appointments[0].type}</div>
                </div>
              ) : (
                <p className="text-muted">No appointments scheduled.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="fade-in">
            <h2 style={{ fontSize:"22px", marginBottom:"20px" }}>Appointments</h2>
            
            {requests.length > 0 && (
              <div style={{ marginBottom:"32px" }}>
                <h3 style={{ fontSize:"16px", marginBottom:"12px" }}>Pending Requests ({requests.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {requests.map(r => (
                    <MobileRequestCard key={r.id} request={r} onAccept={handleAccept} onDecline={() => handleDeclineClick(r)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 style={{ fontSize:"16px", marginBottom:"16px" }}>Daily Timeline</h3>
              <MobileTimeline />
            </div>
          </div>
        )}
      </div>

      <MobileNav active={tab} onTabChange={setTab} />

      <MobileCancellationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmDecline}
        patientName={selectedRequest?.patientName}
      />
    </div>
  );
}

export default App;
