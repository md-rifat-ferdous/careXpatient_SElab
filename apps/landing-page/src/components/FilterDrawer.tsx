import React, { useState } from 'react';

export interface FilterState {
  specialties: string[];
  experienceMin: number;
  feeMin: number;
  feeMax: number;
  gender: string;
  consultationType: string;
  ratingMin: number;
}

export const defaultFilters: FilterState = {
  specialties: [],
  experienceMin: 0,
  feeMin: 0,
  feeMax: 500,
  gender: 'Any',
  consultationType: 'Any',
  ratingMin: 0,
};

const SPECIALTY_OPTIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Gynecologist',
  'Orthopedic',
  'Psychiatrist',
  'Oncologist',
];

const GENDER_OPTIONS = ['Any', 'Male', 'Female'];
const CONSULTATION_OPTIONS = ['Any', 'Online', 'In-person'];
const RATING_OPTIONS = [
  { label: '4★ & above', value: 4 },
  { label: '3★ & above', value: 3 },
  { label: 'Any Rating', value: 0 },
];

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export default function FilterDrawer({ isOpen, onClose, onApply }: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters });

  const toggleSpecialty = (spec: string) => {
    setFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  const handleReset = () => setFilters({ ...defaultFilters });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">More Filters</h2>
            <p className="text-xs text-slate-400 mt-0.5">Refine your doctor search</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Specialty */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Specialty</h3>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTY_OPTIONS.map((spec) => {
                const checked = filters.specialties.includes(spec);
                return (
                  <label
                    key={spec}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${
                      checked
                        ? 'bg-teal-50 border-teal-400 text-teal-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpecialty(spec)}
                      className="accent-teal-500"
                    />
                    {spec}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience Range */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Minimum Experience</h3>
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={filters.experienceMin}
                onChange={(e) => setFilters((f) => ({ ...f, experienceMin: parseInt(e.target.value) }))}
                className="w-full accent-teal-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0 yrs</span>
                <span className="font-bold text-teal-600 text-sm">{filters.experienceMin}+ yrs</span>
                <span>20 yrs</span>
              </div>
            </div>
          </div>

          {/* Fee Range */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Fee Range</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Min Fee ($)</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={filters.feeMin}
                  onChange={(e) => setFilters((f) => ({ ...f, feeMin: parseInt(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Max Fee ($)</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={filters.feeMax}
                  onChange={(e) => setFilters((f) => ({ ...f, feeMax: parseInt(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div className="flex justify-between text-sm font-bold text-teal-600">
                <span>${filters.feeMin}</span>
                <span>—</span>
                <span>${filters.feeMax}</span>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Doctor Gender</h3>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    filters.gender === g
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Consultation Type</h3>
            <div className="flex gap-2">
              {CONSULTATION_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilters((f) => ({ ...f, consultationType: c }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    filters.consultationType === c
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Minimum Rating</h3>
            <div className="space-y-2">
              {RATING_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    filters.ratingMin === r.value
                      ? 'bg-teal-50 border-teal-400'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-semibold ${filters.ratingMin === r.value ? 'text-teal-700' : 'text-slate-600'}`}>
                    {r.label}
                  </span>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.ratingMin === r.value}
                    onChange={() => setFilters((f) => ({ ...f, ratingMin: r.value }))}
                    className="accent-teal-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-95 transition-all text-sm"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
