'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import FilterTabs from '@/components/lab/FilterTabs';
import SearchBar from '@/components/lab/SearchBar';
import SampleCollectionRow from '@/components/lab/SampleCollectionRow';
import DetailsModal from '@/components/lab/DetailsModal';
import { toast } from '@/components/ui/Toast';
import { fetchLabOrders, advanceOrderStep, assignStaff } from '@/services/lab.service';

const TABS = ['All', 'Home Collection', 'In-Lab', 'Pending', 'Collected'];

export default function SampleCollectionPage() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const labId = user?.id;

  const loadOrders = useCallback(async () => {
    if (!labId || !token) return;
    setLoading(true);
    try {
      const data = await fetchLabOrders(labId, token, { module: 'samplecollection', search });
      setOrders(data);
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [labId, token, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = orders.filter((o: any) => {
    if (activeTab === 'Home Collection') return o.homeCollection;
    if (activeTab === 'In-Lab') return !o.homeCollection;
    if (activeTab === 'Pending') return o.demoStep === 3 || o.demoStep === 4;
    if (activeTab === 'Collected') return o.demoStep >= 5;
    return true;
  });

  const handleAdvance = async (id: string) => {
    if (!labId || !token) return;
    setUpdatingId(id);
    try {
      await advanceOrderStep(id, labId, token);
      toast('Step advanced', 'success');
      loadOrders();
    } catch { toast('Failed to advance', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleAssign = async (id: string) => {
    const name = prompt('Assign staff member:');
    if (!name || !labId || !token) return;
    setUpdatingId(id);
    try {
      await assignStaff(id, name, labId, token);
      toast('Staff assigned', 'success');
      loadOrders();
    } catch { toast('Failed to assign', 'error'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900">Sample Collection</h1>

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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No orders found</td></tr>
              ) : filteredOrders.map((order: any) => (
                <SampleCollectionRow
                  key={order.id}
                  order={order}
                  onAdvance={handleAdvance}
                  onAssign={handleAssign}
                  onDetails={setSelectedOrder}
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
          module="samplecollection"
          onClose={() => setSelectedOrder(null)}
          onAdvance={handleAdvance}
          onAssignStaff={handleAssign}
          onReject={() => {}}
          onRestore={() => {}}
        />
      )}
    </div>
  );
}
