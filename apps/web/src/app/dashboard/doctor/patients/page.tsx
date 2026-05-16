"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Folder, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { fetchApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input } from '@/components/ui/FormElements';
import { toast } from '@/components/ui/Toast';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string | null;
}

export default function MyPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male' });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await fetchApi(`/patients?search=${search}`);
      setPatients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadPatients(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      toast('Please fill all required fields', 'warning');
      return;
    }
    
    try {
      setAddLoading(true);
      await fetchApi('/patients', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
        })
      });
      
      toast('Patient added successfully!', 'success');
      setFormData({ name: '', age: '', gender: 'Male' });
      setIsAddOpen(false);
      loadPatients(); // Refresh list
    } catch (err: any) {
      toast(err.message || 'Failed to add patient', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">My Patients</h1>
          <p className="text-sm text-text-muted">Manage and view your patient records</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors text-sm font-bold"
        >
          <Plus size={18} />
          <span>Add New Patient</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-soft border border-gray-50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-text-muted hover:text-text hover:bg-gray-50 transition-all text-sm">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10 bg-red-50 rounded-2xl border border-red-100">{error}</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-soft border border-gray-50">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text font-medium">No patients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Age/Gender</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/doctor/patients/${patient.id}`} className="flex items-center gap-3">
                      <Avatar src={''} fallback={patient.name[0]} className="w-9 h-9" />
                      <div>
                        <p className="text-sm font-bold text-text leading-tight">{patient.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">ID: {patient.id.substring(0, 8)}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text">{patient.age} Yrs</p>
                    <p className="text-xs text-text-muted">{patient.gender}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text font-medium">
                      {['May 15, 2024', 'Apr 22, 2024', 'Mar 08, 2024', 'Feb 28, 2024', 'Jan 15, 2024'][patient.name.length % 5]}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <Link href={`/dashboard/doctor/patients/${patient.id}`} className="p-2 text-text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all">
                        <Folder size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Patient Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Patient">
        <form onSubmit={handleAddPatient} className="space-y-4">
          <FormField label="Full Name" required>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
            />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age" required>
              <Input 
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))}
                placeholder="e.g. 45"
              />
            </FormField>
            
            <FormField label="Gender" required>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                className="w-full bg-background border border-gray-100 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
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
              {addLoading ? 'Saving...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
