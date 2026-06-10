'use client';

import React, { useState, useEffect } from 'react';
import { getSpecialties } from '../../services/doctor.service';











export const defaultFilters = {
  specialties: [],
  experienceMin: 0,
  feeMin: 0,
  feeMax: 500,
  gender: 'Any',
  consultationType: 'Any',
  ratingMin: 0
};

const GENDER_OPTIONS = ['Any', 'Male', 'Female'];
const CONSULTATION_OPTIONS = ['Any', 'Online', 'In-person'];
const RATING_OPTIONS = [
{ label: '4★ & above', value: 4 },
{ label: '3★ & above', value: 3 },
{ label: 'Any Rating', value: 0 }];








export default function FilterDrawer({ isOpen, onClose, onApply }) {
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [specialtyOptions, setSpecialtyOptions] = useState([
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician',
  'Gynecologist', 'Orthopedic', 'Psychiatrist', 'Oncologist']
  );

  useEffect(() => {
    getSpecialties().then((specs) => {
      if (specs.length > 0) setSpecialtyOptions(specs.map((s) => s.name));
    }).catch(console.error);
  }, []);

  const toggleSpecialty = (spec) => {
    setFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec) ?
      prev.specialties.filter((s) => s !== spec) :
      [...prev.specialties, spec]
    }));
  };

  const handleReset = () => setFilters({ ...defaultFilters });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      

      <aside className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">More Filters</h2>
            <p className="text-[13px] text-slate-400 font-bold mt-1">Refine your doctor search</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
            
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
          {/* Specialty */}
          <div>
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Specialty</h3>
            <div className="grid grid-cols-2 gap-3">
              {specialtyOptions.map((spec) =>
              <label
                key={spec}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                filters.specialties.includes(spec) ?
                'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' :
                'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'}`
                }>
                
                  <input
                  type="checkbox"
                  checked={filters.specialties.includes(spec)}
                  onChange={() => toggleSpecialty(spec)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600" />
                
                  <span className="text-[13px] font-bold">{spec}</span>
                </label>
              )}
            </div>
          </div>

          {/* Experience Slider */}
          <div>
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Minimum Experience</h3>
            <div className="px-1">
              <input
                type="range"
                min={0} max={20} step={1}
                value={filters.experienceMin}
                onChange={(e) => setFilters((f) => ({ ...f, experienceMin: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500" />
              
              <div className="flex justify-between mt-4">
                <span className="text-xs text-slate-400 font-bold">0 yrs</span>
                <span className="text-sm font-black text-teal-600">{filters.experienceMin}+ yrs</span>
                <span className="text-xs text-slate-400 font-bold">20 yrs</span>
              </div>
            </div>
          </div>

          {/* Fee Range */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Fee Range</h3>
            <div className="space-y-6 px-1">
              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-black uppercase tracking-wider">Min Fee ($)</label>
                <input
                  type="range"
                  min={0} max={500} step={10}
                  value={filters.feeMin}
                  onChange={(e) => setFilters((f) => ({ ...f, feeMin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                
              </div>
              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-black uppercase tracking-wider">Max Fee ($)</label>
                <input
                  type="range"
                  min={0} max={500} step={10}
                  value={filters.feeMax}
                  onChange={(e) => setFilters((f) => ({ ...f, feeMax: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                
              </div>
              <div className="flex justify-between items-center text-sm font-black text-teal-600 bg-teal-50/50 py-2 px-4 rounded-lg border border-teal-100">
                <span>${filters.feeMin}</span>
                <span className="text-slate-300">—</span>
                <span>${filters.feeMax}</span>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Doctor Gender</h3>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {GENDER_OPTIONS.map((g) =>
              <button
                key={g}
                onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                filters.gender === g ?
                'bg-teal-500 text-white shadow-lg shadow-teal-500/20' :
                'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`
                }>
                
                  {g}
                </button>
              )}
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Consultation Type</h3>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {CONSULTATION_OPTIONS.map((c) =>
              <button
                key={c}
                onClick={() => setFilters((f) => ({ ...f, consultationType: c }))}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                filters.consultationType === c ?
                'bg-teal-500 text-white shadow-lg shadow-teal-500/20' :
                'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`
                }>
                
                  {c}
                </button>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-[13px] font-black text-slate-800 mb-5 uppercase tracking-widest">Minimum Rating</h3>
            <div className="space-y-3">
              {RATING_OPTIONS.map((r) =>
              <label
                key={r.value}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                filters.ratingMin === r.value ?
                'bg-teal-50 border-teal-500 shadow-sm' :
                'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'}`
                }>
                
                  <span className={`text-sm font-bold ${filters.ratingMin === r.value ? 'text-teal-700' : 'text-slate-600'}`}>
                    {r.label}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                filters.ratingMin === r.value ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-white'}`
                }>
                    {filters.ratingMin === r.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input
                  type="radio"
                  name="rating"
                  checked={filters.ratingMin === r.value}
                  onChange={() => setFilters((f) => ({ ...f, ratingMin: r.value }))}
                  className="hidden" />
                
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 bg-white flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-4 border-2 border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all text-[15px]">
            
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-2 py-4 bg-teal-500 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 active:scale-[0.98] transition-all text-[15px]">
            
            Apply Filters
          </button>
        </div>
      </aside>
    </>);

}