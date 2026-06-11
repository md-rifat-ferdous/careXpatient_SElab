import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TestQueue from './pages/TestQueue';
import SampleCollection from './pages/SampleCollection';
import Patients from './pages/Patients';
import UploadReports from './pages/UploadReports';
import TestManagement from './pages/TestManagement';
import Earnings from './pages/Earnings';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="test-queue" element={<TestQueue />} />
          <Route path="sample-collection" element={<SampleCollection />} />
          <Route path="patients" element={<Patients />} />
          <Route path="upload-reports" element={<UploadReports />} />
          <Route path="test-management" element={<TestManagement />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
