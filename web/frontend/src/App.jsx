import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import DoctorProfile from './components/DoctorProfile';
import CancellationModal from './components/CancellationModal';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const fetchData = async () => {
    try {
      const [apptsRes, reqsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/appointments'),
        fetch('http://localhost:3001/api/requests'),
        fetch('http://localhost:3001/api/stats')
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
      await fetch(`http://localhost:3001/api/requests/${id}/accept`, { method: 'POST' });
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
      await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}/decline`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }) 
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor: 'var(--background)' }}>
      <div className="fade-in" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)' }}>careXpatient</h2>
        <p className="text-muted">Loading your portal...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <main 
        className="main-content"
        style={{ 
          marginLeft: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' 
        }}
      >
        <DoctorProfile />
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            nextAppointment={appointments.find(a => a.status === 'confirmed')} 
          />
        )}
        
        {activeTab === 'appointments' && (
          <Appointments 
            requests={requests} 
            appointments={appointments}
            onAccept={handleAccept} 
            onDecline={handleDeclineClick} 
          />
        )}

        {activeTab !== 'dashboard' && activeTab !== 'appointments' && (
          <div className="fade-in card" style={{ textAlign: 'center', padding: '80px' }}>
            <h2 className="text-muted">Section "{activeTab}" is under development.</h2>
          </div>
        )}
      </main>

      <CancellationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmDecline}
        patientName={selectedRequest?.patientName}
      />
    </div>
  );
}

export default App;
