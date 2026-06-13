'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import FilterTabs from '@/components/lab/FilterTabs';
import SearchBar from '@/components/lab/SearchBar';
import TestQueueRow from '@/components/lab/TestQueueRow';
import DetailsModal from '@/components/lab/DetailsModal';
import { toast } from '@/components/ui/Toast';
import {
  fetchLabOrders, advanceOrderStep, rejectOrder, restoreOrder,
  assignStaff, createManualEntry,
} from '@/services/lab.service';

const TABS = ['All', 'New Requests', 'Accepted', 'Rejected'];

export default function TestQueuePage() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualData, setManualData] = useState({ patientName: '', phone: '', testIds: [] as string[] });

  const labId = user?.id;

  const loadOrders = useCallback(async () => {
    if (!labId || !token) return;
    setLoading(true);
    try {
      const statusMap: Record<string, string> = { 'New Requests': 'Requested', Accepted: 'AcceptedByLab', Rejected: 'Cancelled' };
      const data = await fetchLabOrders(labId, token, {
        module: 'testqueue',
        status: statusMap[activeTab] || '',
        search,
      });
      setOrders(data);
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [labId, token, activeTab, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleAccept = async (id: string) => {
    if (!labId || !token) return;
    setUpdatingId(id);
    try {
      await advanceOrderStep(id, labId, token);
      toast('Order accepted', 'success');
      loadOrders();
    } catch { toast('Failed to accept order', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleReject = async (id: string) => {
    if (!labId || !token) return;
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setUpdatingId(id);
    try {
      await rejectOrder(id, reason, undefined, labId, token);
      toast('Order rejected', 'success');
      loadOrders();
    } catch { toast('Failed to reject order', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleRestore = async (id: string) => {
    if (!labId || !token) return;
    setUpdatingId(id);
    try {
      await restoreOrder(id, labId, token);
      toast('Order restored', 'success');
      loadOrders();
    } catch { toast('Failed to restore order', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleManualEntry = async () => {
    if (!labId || !token) return;
    try {
      await createManualEntry(manualData, labId, token);
      toast('Manual entry created', 'success');
      setShowManual(false);
      setManualData({ patientName: '', phone: '', testIds: [] });
      loadOrders();
    } catch { toast('Failed to create manual entry', 'error'); }
  };

  const tabCounts = {
    All: orders.length,
    'New Requests': orders.filter((o: any) => o.demoStep === 1).length,
    Accepted: orders.filter((o: any) => o.demoStep === 2).length,
    Rejected: orders.filter((o: any) => o.demoStep === 0).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Test Queue</h1>
        <button onClick={() => setShowManual(true)} className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">
          + Manual Entry
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No orders found</td></tr>
              ) : orders.map((order: any) => (
                <TestQueueRow
                  key={order.id}
                  order={order}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onDetails={setSelectedOrder}
                  onRestore={handleRestore}
                  updating={updatingId === order.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          module="testqueue"
          onClose={() => setSelectedOrder(null)}
          onAdvance={(id) => handleAccept(id)}
          onAssignStaff={(id) => {
            const name = prompt('Staff name:');
            if (name && labId && token) {
              assignStaff(id, name, labId, token).then(() => { toast('Staff assigned', 'success'); loadOrders(); }).catch(() => toast('Failed to assign', 'error'));
            }
          }}
          onReject={(id) => handleReject(id)}
          onRestore={(id) => handleRestore(id)}
        />
      )}

      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowManual(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900">Manual Entry</h2>
            <input value={manualData.patientName} onChange={e => setManualData(p => ({ ...p, patientName: e.target.value }))} placeholder="Patient name" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <input value={manualData.phone} onChange={e => setManualData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <p className="text-xs text-slate-500">Test IDs will be selected from Test Management</p>
            <div className="flex gap-2">
              <button onClick={() => setShowManual(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={handleManualEntry} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
