"use client";

import React, { useState } from 'react';
import { ClipboardList, Download, Printer, Calendar, Pill, Plus, ChevronLeft, ChevronRight, ArrowRight, Trash2, Edit2, Archive, History, Lock, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input } from '@/components/ui/FormElements';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';

export default function PatientPrescriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = React.use(params);
  const { user } = useAuthStore();
  const currentDoctorId = user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPx, setSelectedPx] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({ date: '' });
  const [meds, setMeds] = useState<any[]>([{ name: '', dosage: '', duration: '' }]);
  const [editingPxId, setEditingPxId] = useState<string | null>(null);
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { fetchApi } = await import('@/lib/api');
      const data = await fetchApi(`/prescriptions/patient/${patientId}`);
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Reset state when switching patients to prevent stale data display
    setPrescriptions([]);
    setCurrentPage(1);
    fetchPrescriptions();
  }, [patientId]);

  const handleViewPrescription = (px: any) => {
    setSelectedPx(px);
    setIsDetailOpen(true);
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = meds.filter(m => m.name.trim() !== '');
    if (!formData.date || validMeds.length === 0) {
      toast('Please provide a date and at least one medicine', 'warning');
      return;
    }
    
    try {
      setAddLoading(true);
      const { fetchApi } = await import('@/lib/api');
      
      const endpoint = editingPxId 
        ? `/prescriptions/${editingPxId}` 
        : `/prescriptions/patient/${patientId}`;
      
      const method = editingPxId ? 'PUT' : 'POST';

      await fetchApi(endpoint, {
        method,
        body: JSON.stringify({
          date: formData.date,
          medications: JSON.stringify(validMeds)
        })
      });
      
      toast(editingPxId ? 'Prescription updated!' : 'Prescription added!', 'success');
      resetForm();
      fetchPrescriptions();
    } catch (err: any) {
      toast(err.message || 'Failed to save prescription', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ date: '' });
    setMeds([{ name: '', dosage: '', duration: '' }]);
    setEditingPxId(null);
    setIsAddOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, px: any) => {
    e.stopPropagation();
    setEditingPxId(px.id);
    setFormData({ date: px.date.split('T')[0] });
    
    let finalMeds = [];
    let current = px.medications;
    try {
      for (let i = 0; i < 3; i++) {
        if (Array.isArray(current)) {
          finalMeds = current;
          break;
        }
        if (typeof current === 'string' && current.trim() !== '') {
          current = JSON.parse(current);
        } else {
          break;
        }
      }
    } catch (err) { 
      finalMeds = []; 
    }
    
    // Normalize string medicines into objects
    const normalized = finalMeds.map((m: any) => 
      typeof m === 'string' ? { name: m, dosage: '', duration: '' } : m
    );

    setMeds(normalized.length > 0 ? normalized : [{ name: '', dosage: '', duration: '' }]);
    setIsAddOpen(true);
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setArchiveLoading(id);
      const { fetchApi } = await import('@/lib/api');
      await fetchApi(`/prescriptions/${id}/archive`, { method: 'PATCH' });
      toast('Prescription discontinued', 'success');
      fetchPrescriptions();
    } catch (err) {
      toast('Failed to archive', 'error');
    } finally {
      setArchiveLoading(null);
    }
  };

  const addMedField = () => setMeds([...meds, { name: '', dosage: '', duration: '' }]);
  const updateMed = (index: number, key: string, val: string) => {
    const newMeds = [...meds];
    newMeds[index] = { ...newMeds[index], [key]: val };
    setMeds(newMeds);
  };
  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const itemsPerPage = 6;
  const totalPages = Math.ceil(prescriptions.length / itemsPerPage) || 1;
  const displayedPrescriptions = prescriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  if (loading) return <div className="py-20 text-center animate-pulse text-primary font-bold">Loading prescriptions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-text">Prescription Records</h2>
        <button 
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          <span>New Prescription</span>
        </button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 text-text-muted">No prescriptions found for this patient.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPrescriptions.map((px) => {
            let parsedMeds = [];
            const rawMeds = px.medications;
            if (Array.isArray(rawMeds)) {
              parsedMeds = rawMeds;
            } else {
              try { 
                const parsed = JSON.parse(rawMeds); 
                parsedMeds = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                parsedMeds = [];
              }
            }

            const isArchived = px.status === 'archived' || px.status === 'discontinued';

            return (
            <div 
              key={px.id} 
              onClick={() => handleViewPrescription(px)}
              className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full cursor-pointer group relative ${isArchived ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isArchived ? 'bg-gray-100 text-gray-400' : 'bg-teal-50 text-teal-500'}`}>
                  {isArchived ? <History size={20} /> : <ClipboardList size={20} />}
                </div>
                {isArchived && (
                  <span className="bg-gray-100 text-gray-500 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Discontinued</span>
                )}
                {!isArchived && px.doctorId === currentDoctorId && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditClick(e, px)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit Prescription"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleArchive(e, px.id)}
                      disabled={archiveLoading === px.id}
                      className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                      title="Discontinue"
                    >
                      <Archive size={14} className={archiveLoading === px.id ? 'animate-spin' : ''} />
                    </button>
                  </div>
                )}
                {!isArchived && px.doctorId !== currentDoctorId && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-400 rounded-lg border border-gray-100" title="Other Doctor's Record (View Only)">
                    <Lock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">View Only</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-base font-bold text-text mb-3 leading-snug flex-1">Prescription #{px.id.substring(0, 4)}</h3>
              
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{new Date(px.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <User size={14} className="text-gray-400" />
                  <span className="font-bold text-text-muted">{px.doctor?.name || 'Assigned Doctor'}</span>
                  {px.doctor?.specialty && (
                    <span className="text-[10px] text-gray-400">({px.doctor.specialty})</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {parsedMeds.map((med: any, i: number) => (
                    <span key={i} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md border ${isArchived ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-teal-50 text-teal-700 border-teal-100/50'}`}>
                      <Pill size={10} className={isArchived ? 'text-gray-400' : 'text-teal-600'} /> 
                      {typeof med === 'string' ? med : `${med.name} (${med.dosage})`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <button 
                  onClick={() => handleViewPrescription(px)}
                  className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors ${isArchived ? 'bg-gray-50 text-gray-400' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )})}
        </div>
      )}

      {prescriptions.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-6 mt-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-bold text-text">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, prescriptions.length)}</span> of <span className="font-bold text-text">{prescriptions.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button 
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${
                  currentPage === idx + 1 ? 'bg-teal-700 text-white' : 'text-text-muted hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Prescription Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={resetForm} 
        title={editingPxId ? "Edit Prescription" : "New Prescription"}
      >
        <form onSubmit={handleAddPrescription} className="space-y-4">
          <FormField label="Prescription Date" required>
            <Input 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </FormField>
          
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-text">Medications</label>
              <button 
                type="button" 
                onClick={addMedField}
                className="text-xs text-primary font-bold hover:underline"
              >
                + Add Medicine
              </button>
            </div>
            
            <div className="space-y-6">
              {Array.isArray(meds) && meds.map((med, idx) => (
                <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 relative group">
                   <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Medicine #{idx + 1}</span>
                    {meds.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMed(idx)}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tight flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <FormField label="Medicine Name" required>
                      <Input 
                        placeholder="e.g. Paracetamol 500mg"
                        value={med.name}
                        onChange={(e) => updateMed(idx, 'name', e.target.value)}
                      />
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Dosage / Instructions">
                        <Input 
                          placeholder="e.g. 1 tablet after meal"
                          value={med.dosage}
                          onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Duration">
                        <Input 
                          placeholder="e.g. 5 days"
                          value={med.duration}
                          onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsAddOpen(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={addLoading}
              className="cx-btn-primary px-8"
            >
              {addLoading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </Modal>


      {/* Prescription Detail Modal */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title="Prescription Detail"
      >
        {selectedPx && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Medical Header */}
            <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-teal-700">careXpatient</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Digital Health Ecosystem</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text">{selectedPx.doctor?.name || 'Dr. Sarah Ahmed'}</p>
                <p className="text-[10px] text-text-muted">{selectedPx.doctor?.specialty || 'General Practitioner'}</p>
                <p className="text-[10px] text-text-muted">Licensed Specialist</p>
              </div>
            </div>

            {/* Patient & Date Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Patient Name</p>
                <p className="text-sm font-bold text-text">Patient ID: {patientId.substring(0, 8)}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date</p>
                <p className="text-sm font-bold text-text">{new Date(selectedPx.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Prescription Body */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <span className="text-2xl font-black italic">Rx</span>
                <div className="h-[1px] flex-1 bg-teal-100"></div>
              </div>

              <div className="space-y-4 px-4">
                {(() => {
                  let meds = [];
                  let raw = selectedPx.medications;
                  
                  // Recursive/Iterative parsing to handle double stringification
                  let current = raw;
                  try {
                    for (let i = 0; i < 3; i++) {
                      if (Array.isArray(current)) {
                        meds = current;
                        break;
                      }
                      if (typeof current === 'string' && current.trim() !== '') {
                        current = JSON.parse(current);
                      } else {
                        break;
                      }
                    }
                  } catch (e) {
                    console.error("Medication parse error:", e);
                  }

                  if (meds.length === 0) {
                    return (
                      <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <Pill size={24} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No Medications Listed</p>
                      </div>
                    );
                  }

                  return meds.map((med: any, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="mt-1">
                        <Pill size={16} className="text-teal-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-text">
                          {typeof med === 'string' ? med : med.name}
                        </p>
                        {typeof med !== 'string' && (
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-text-muted font-medium italic">
                              {med.dosage} — {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-[10px] text-teal-600 font-bold bg-teal-50 w-fit px-2 py-0.5 rounded">
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {selectedPx.notes && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Doctor's Notes</h4>
                  <p className="text-sm text-text leading-relaxed p-4 bg-white rounded-xl border border-gray-100 italic">
                    "{selectedPx.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-50">
              <button className="p-3 rounded-xl border border-gray-100 text-text-muted hover:bg-gray-50 transition-colors">
                <Printer size={18} />
              </button>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="cx-btn-primary px-8"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
