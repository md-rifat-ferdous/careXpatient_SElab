'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import FilterTabs from '@/components/lab/FilterTabs';
import SearchBar from '@/components/lab/SearchBar';
import StatusBadge from '@/components/lab/StatusBadge';
import UploadReportModal from '@/components/lab/UploadReportModal';
import { toast } from '@/components/ui/Toast';
import { fetchLabOrders, advanceOrderStep, verifyReport, sendReport } from '@/services/lab.service';

const TABS = ['All', 'Processing', 'Ready for Report', 'Completed'];

export default function UploadReportsPage() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const labId = user?.id;

  const loadOrders = useCallback(async () => {
    if (!labId || !token) return;
    setLoading(true);
    try {
      const data = await fetchLabOrders(labId, token, { module: 'uploadreports', search });
      setOrders(data);
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [labId, token, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = orders.filter((o: any) => {
    if (activeTab === 'Processing') return o.demoStep >= 7 && o.demoStep < 9;
    if (activeTab === 'Ready for Report') return o.demoStep === 8;
    if (activeTab === 'Completed') return o.demoStep === 9;
    return true;
  });

  const handleUpload = async (orderId: string, fileUrl: string, resultSummary: string) => {
    if (!labId || !token) return;
    try {
      await verifyReport(orderId, fileUrl, resultSummary, user?.fullName, labId, token);
      toast('Report verified successfully', 'success');
      setSelectedOrder(null);
      loadOrders();
    } catch {
      toast('Failed to verify report', 'error');
    }
  };

  const handleSend = async (orderId: string, sentTo: string, channel: string) => {
    if (!labId || !token) return;
    try {
      await sendReport(orderId, sentTo, channel, labId, token);
      toast('Report dispatched', 'success');
    } catch {
      toast('Failed to dispatch report', 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900">Upload Reports</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tests</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No orders found</td></tr>
              ) : filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{order.patientName}</p>
                    <p className="text-xs text-slate-500">{order.patientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{order.tests.map((t: any) => t.name).join(', ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} demoStep={order.demoStep} /></td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">৳{order.totalAmount}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{order.assignedStaff || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors">
                      {order.demoStep >= 9 ? 'View Report' : 'Upload'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <UploadReportModal
          orderId={selectedOrder.id}
          patientName={selectedOrder.patientName}
          onClose={() => setSelectedOrder(null)}
          onUpload={handleUpload}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
