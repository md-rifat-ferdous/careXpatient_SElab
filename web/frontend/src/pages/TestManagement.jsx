import { useState, useEffect, useCallback } from 'react';
import {
  getAllTests as demoGetAllTests,
  saveTest as demoSaveTest,
  deleteTest as demoDeleteTest,
} from '../store/demoData';

const CATEGORIES = ['All', 'Blood', 'Urine', 'Imaging', 'Microbiology', 'Pathology', 'General'];
const SAMPLE_TYPES = ['Blood', 'Urine', 'Stool', 'Swab', 'Tissue', 'Serum', 'N/A'];
const TAG_COLORS = [
  { label: 'Teal',   value: '#14B8A6' },
  { label: 'Blue',   value: '#3B82F6' },
  { label: 'Red',    value: '#EF4444' },
  { label: 'Amber',  value: '#F59E0B' },
  { label: 'Green',  value: '#10B981' },
  { label: 'Purple', value: '#8B5CF6' },
];

const EMPTY_FORM = { name: '', price: '', sample_type: 'Blood', category: 'Blood', delivery_time: '24 Hours', description: '', prerequisites: '', tag: '', tag_color: '#14B8A6' };

function TestModal({ test, onClose, onSaved }) {
  const [form, setForm] = useState(test ? { ...test, price: String(test.price) } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!form.name || !form.price) { setErr('Name and price are required.'); return; }
    setSaving(true); setErr('');
    const res = await demoSaveTest(form);
    setSaving(false);
    if (res?.success) { onSaved(); onClose(); }
    else setErr(res?.error || 'Failed to save test.');
  };

  const fields = [
    { key: 'name',          label: 'Test Name *',          type: 'text' },
    { key: 'price',         label: 'Price (BDT) *',        type: 'number' },
    { key: 'delivery_time', label: 'Report Delivery Time', type: 'text' },
    { key: 'tag',           label: 'Tag Label',            type: 'text' },
    { key: 'prerequisites', label: 'Prerequisites',        type: 'text' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <h3 className="font-bold text-lg text-on-surface">{test ? 'Edit Test' : 'Add New Test'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {err && <p className="text-xs text-error bg-error-container/30 p-3 rounded-xl">{err}</p>}

          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.key === 'name' || f.key === 'prerequisites' ? 'col-span-2' : ''}>
                <label className="text-xs font-semibold text-on-surface-variant">{f.label}</label>
                <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/30 outline-none bg-surface-white">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Sample Type</label>
              <select value={form.sample_type} onChange={e => setForm(p => ({ ...p, sample_type: e.target.value }))}
                className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/30 outline-none bg-surface-white">
                {SAMPLE_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/30 outline-none resize-none h-20" />
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Tag Color</label>
            <div className="flex gap-2 mt-2">
              {TAG_COLORS.map(c => (
                <button key={c.value} onClick={() => setForm(p => ({ ...p, tag_color: c.value }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.tag_color === c.value ? 'border-on-surface scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }} title={c.label} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-background-off-white">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl bg-primary-container text-white text-sm font-bold hover:bg-primary transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : test ? 'Update Test' : 'Add Test'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestDetailsModal({ test, onClose }) {
  if (!test) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <h3 className="font-bold text-lg text-on-surface">Test Details</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block uppercase">Test Name</span>
            <p className="font-bold text-base text-on-surface mt-0.5">{test.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Category</span>
              <span className="inline-block text-xs font-semibold bg-primary-container/10 text-primary-container px-2.5 py-1 rounded-full mt-1">{test.category}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Sample Type</span>
              <p className="font-medium text-on-surface mt-1">{test.sample_type || '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Price</span>
              <p className="font-bold text-on-surface mt-1">৳{parseFloat(test.price || 0).toFixed(0)}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Report Delivery Time</span>
              <p className="font-medium text-on-surface mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {test.delivery_time || '—'}
              </p>
            </div>
          </div>
          {test.tag && (
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Tag</span>
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full text-white mt-1" style={{ backgroundColor: test.tag_color || '#14B8A6' }}>
                {test.tag}
              </span>
            </div>
          )}
          {test.prerequisites && (
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase text-amber-700">Prerequisites / Instructions</span>
              <p className="text-on-surface bg-amber-50/50 border border-amber-100 p-3 rounded-xl mt-1 text-xs leading-relaxed">{test.prerequisites}</p>
            </div>
          )}
          {test.description && (
            <div>
              <span className="text-xs font-bold text-on-surface-variant block uppercase">Description</span>
              <p className="text-on-surface-variant leading-relaxed mt-1 text-xs">{test.description}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-primary-container text-white text-sm font-bold hover:bg-primary transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function TestManagement() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [editTest, setEditTest] = useState(null);
  const [viewTest, setViewTest] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deactivatedIds, setDeactivatedIds] = useState([]);

  // Close menus on click outside
  useEffect(() => {
    const handleCloseMenu = () => setOpenMenuId(null);
    document.addEventListener('click', handleCloseMenu);
    return () => document.removeEventListener('click', handleCloseMenu);
  }, []);

  const fetchTests = useCallback(() => {
    setLoading(true);
    demoGetAllTests(activeCategory === 'All' ? null : activeCategory, search || '')
      .then(res => { if (res.success) setTests(res.data); })
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test from your catalog?')) return;
    setDeletingId(id);
    await demoDeleteTest(id);
    setDeletingId(null);
    fetchTests();
  };

  const duplicateTest = (t) => {
    setEditTest({
      ...t,
      id: undefined,
      name: `${t.name} (Copy)`
    });
  };

  const toggleActive = (id) => {
    setDeactivatedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {(showAdd || editTest) && (
        <TestModal test={editTest} onClose={() => { setEditTest(null); setShowAdd(false); }} onSaved={fetchTests} />
      )}

      {viewTest && (
        <TestDetailsModal test={viewTest} onClose={() => setViewTest(null)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Test Management</h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage your diagnostic test catalog, pricing, and report delivery times</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Test
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { icon: 'science',       bg: 'bg-teal-50',   color: 'text-teal-600',  label: 'Total Tests',       val: tests.length },
          { icon: 'category',      bg: 'bg-violet-50', color: 'text-violet-600', label: 'Categories',        val: [...new Set(tests.map(t => t.category))].length },
          { icon: 'attach_money',  bg: 'bg-amber-50',  color: 'text-amber-600', label: 'Avg. Price (BDT)',   val: tests.length ? '৳' + Math.round(tests.reduce((a, t) => a + parseFloat(t.price || 0), 0) / tests.length).toLocaleString() : '৳0' },
        ].map(s => (
          <div key={s.label} className="bg-surface-white p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 ${s.bg} ${s.color} rounded-xl`}><span className="material-symbols-outlined">{s.icon}</span></div>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex bg-background-off-white p-1 rounded-xl overflow-x-auto gap-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-surface-white text-primary-container shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none bg-surface-white" />
        </div>
      </div>

      {/* Test Table */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary-container text-5xl">refresh</span></div>
      ) : (
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-off-white text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                {['Test Name', 'Category', 'Sample Type', 'Price (BDT)', 'Report Delivery Time', 'Tag', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {tests.map(t => {
                const isDeactivated = deactivatedIds.includes(t.id);
                return (
                  <tr key={t.id} className={`hover:bg-primary-container/5 transition-colors group ${isDeactivated ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-on-surface flex items-center gap-2">
                        {t.name}
                        {isDeactivated && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-outline-variant text-on-surface-variant">Inactive</span>
                        )}
                      </p>
                      {t.description && <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[200px]">{t.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-primary-container/10 text-primary-container px-2.5 py-1 rounded-full">{t.category || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{t.sample_type || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-on-surface">৳{parseFloat(t.price || 0).toFixed(0)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {t.delivery_time || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.tag ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: t.tag_color || '#14B8A6' }}>
                          {t.tag}
                        </span>
                      ) : <span className="text-on-surface-variant text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setViewTest(t)} className="text-xs font-bold text-primary-container hover:underline transition-all active:scale-95">
                          View
                        </button>
                        <button onClick={() => setEditTest(t)} className="text-xs font-bold text-primary-container hover:underline transition-all active:scale-95">
                          Edit
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === t.id ? null : t.id);
                            }}
                            className="p-1 text-on-surface-variant hover:bg-outline-variant/30 rounded-lg transition-colors flex items-center"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openMenuId === t.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface-white border border-outline-variant rounded-xl shadow-lg py-1 z-50">
                              <button
                                onClick={() => setViewTest(t)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-background-off-white flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span> View Details
                              </button>
                              <button
                                onClick={() => setEditTest(t)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-background-off-white flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Test
                              </button>
                              <button
                                onClick={() => duplicateTest(t)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-background-off-white flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span> Duplicate Test
                              </button>
                              <button
                                onClick={() => toggleActive(t.id)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-background-off-white flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {isDeactivated ? 'play_arrow' : 'pause'}
                                </span>
                                {isDeactivated ? 'Activate' : 'Deactivate'}
                              </button>
                              <div className="border-t border-outline-variant my-1"></div>
                              <button
                                onClick={() => deleteTest(t.id)}
                                disabled={deletingId === t.id || !t.lab_id}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-error-container/10 flex items-center gap-2 disabled:opacity-30"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span> Delete Test
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tests.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-14 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3 opacity-25">science</span>
                  No tests found. Add your first test.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
