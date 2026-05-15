'use client';

import React, { useEffect, useState } from 'react';

interface Doctor {
  id: number;
  name: string;
  qualification: string;
}

interface PrescriptionFiltersProps {
  searchQuery: string;
  doctor: string;
  date: string;
  onSearch: (query: string) => void;
  onFilterDoctor: (doctorName: string) => void;
  onFilterDate: (date: string) => void;
}

const PrescriptionFilters: React.FC<PrescriptionFiltersProps> = ({
  searchQuery,
  doctor,
  date,
  onSearch,
  onFilterDoctor,
  onFilterDate,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    fetch('http://localhost:5000/api/prescriptions/doctors')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setDoctors(result.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearch(localSearch);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, onSearch]);

  const handleReset = () => {
    setLocalSearch('');
    onSearch('');
    onFilterDoctor('');
    onFilterDate('');
  };

  const activeFilterCount = [searchQuery, doctor, date].filter(Boolean).length;

  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-slate-500">filter_list</span>
          <span className="text-sm font-bold text-slate-700">Filter Prescriptions</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[11px] font-bold bg-teal-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Search
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Diagnosis, medicine..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Doctor
          </label>
          <div className="relative">
            <select
              value={doctor}
              onChange={(e) => onFilterDoctor(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm appearance-none transition-all text-slate-700 font-medium"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>



        {/* Date */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Issue Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => onFilterDate(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all text-slate-700 font-medium"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionFilters;
