'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import FilterTabs from '@/components/lab/FilterTabs';
import SearchBar from '@/components/lab/SearchBar';
import { toast } from '@/components/ui/Toast';
import { fetchAllLabTests, createLabTest, updateLabTest, deleteLabTest } from '@/services/lab.service';

const CATEGORIES = ['All', 'Diabetes', 'Thyroid', 'Lipid', 'Liver', 'Kidney', 'Infectious Disease', 'Hematology', 'Urinalysis'];

export default function TestManagementPage() {
  const { user, token } = useAuthStore();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [editTest, setEditTest] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', sampleType: '', category: 'All', deliveryTime: '', description: '', prerequisites: '', tag: '', tagColor: '' });

  const labId = user?.id;

  const loadTests = useCallback(async () => {
    if (!labId || !token) return;
    setLoading(true);
    try {
      const data = await fetchAllLabTests(labId, token, activeCategory, search);
      setTests(data);
    } catch {
      toast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  }, [labId, token, activeCategory, search]);

  useEffect(() => { loadTests(); }, [loadTests]);

  const resetForm = () => setForm({ name: '', price: '', sampleType: '', category: 'All', deliveryTime: '', description: '', prerequisites: '', tag: '', tagColor: '' });

  const openEdit = (test: any) => {
    setEditTest(test);
    setForm({
      name: test.name, price: String(test.price || ''),
      sampleType: test.sampleType || '', category: test.category || 'All',
      deliveryTime: test.deliveryTime || '', description: test.description || '',
      prerequisites: test.prerequisites || '', tag: test.tag || '', tagColor: test.tagColor || '',
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name || !token) return;
    try {
      if (editTest) {
        await updateLabTest(editTest.id, form, token);
        toast('Test updated', 'success');
      } else {
        await createLabTest({ ...form, labId }, token);
        toast('Test created', 'success');
      }
      setShowAdd(false);
      setEditTest(null);
      resetForm();
      loadTests();
    } catch {
      toast('Failed to save test', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?') || !token) return;
    try {
      await deleteLabTest(id, token);
      toast('Test deleted', 'success');
      loadTests();
    } catch {
      toast('Failed to delete test', 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Test Management</h1>
        <button onClick={() => { setEditTest(null); resetForm(); setShowAdd(true); }} className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">
          + Add Test
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <FilterTabs tabs={CATEGORIES} activeTab={activeCategory} onTabChange={setActiveCategory} />
        <div className="sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tests..." />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">No tests found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test: any) => (
            <div key={test.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{test.name}</h3>
                  <p className="text-xs text-slate-500">{test.category}</p>
                </div>
                <span className="text-sm font-bold text-teal-700">৳{test.price}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {test.tag && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: test.tagColor + '20', color: test.tagColor }}>{test.tag}</span>}
                {test.sampleType && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{test.sampleType}</span>}
                {test.deliveryTime && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{test.deliveryTime}</span>}
              </div>
              {test.description && <p className="text-xs text-slate-500 line-clamp-2">{test.description}</p>}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(test)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                <button onClick={() => handleDelete(test.id)} className="text-xs text-rose-600 hover:text-rose-800 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900">{editTest ? 'Edit Test' : 'Add New Test'}</h2>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Test name *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
              <input value={form.sampleType} onChange={e => setForm(f => ({ ...f, sampleType: e.target.value }))} placeholder="Sample type" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} placeholder="Delivery time (e.g. 24 hrs)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <textarea value={form.prerequisites} onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value }))} placeholder="Prerequisites" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Tag (e.g. Popular)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
              <input value={form.tagColor} onChange={e => setForm(f => ({ ...f, tagColor: e.target.value }))} placeholder="Tag color (e.g. #ff0000)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
