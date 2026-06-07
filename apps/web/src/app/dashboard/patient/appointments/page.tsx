"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DoctorCard from '../../../../components/appointments/DoctorCard';
import BookingDrawer from '../../../../components/appointments/BookingDrawer';
import FilterDrawer, { FilterState, defaultFilters } from '../../../../components/appointments/FilterDrawer';
import DoctorProfileModal from '../../../../components/appointments/DoctorProfileModal';
import { Doctor, DoctorFilters } from '../../../../types/doctor';
import { getDoctors, getSpecialties } from '../../../../services/doctor.service';
import { useAuthStore } from '../../../../store/auth.store';

type SortOption = 'Recommended' | 'Rating' | 'Fee (Low to High)' | 'Experience';
const SORT_OPTIONS: SortOption[] = ['Recommended', 'Rating', 'Fee (Low to High)', 'Experience'];

export default function PatientAppointmentsPage() {
  const { user } = useAuthStore();
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(defaultFilters);

  // Initial fetch: Get all doctors and specialties
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [docsData, specsData] = await Promise.all([
          getDoctors(),
          getSpecialties()
        ]);
        
        // Enrich data with mock fields for demo
        const enrichedDocs = docsData.map((d: Doctor) => ({
          ...d,
          user: {
            ...d.user,
            gender: (d.user.fullName.includes('Sarah') || d.user.fullName.includes('Anika') || d.user.fullName.includes('Maria') ? 'Female' : 'Male') as 'Male' | 'Female',
            district: d.id === '1' || d.id === '3' || d.id === '5' ? 'Dhaka' : 'Chattogram',
          },
        }));
        setAllDoctors(enrichedDocs);

        setSpecialties(specsData.map((s: any) => s.name));
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Compute filtered and sorted doctors locally for maximum responsiveness and correctness
  const filteredDoctors = useMemo(() => {
    let results = [...allDoctors];

    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(d => 
        d.user.fullName.toLowerCase().includes(query) ||
        d.specialties.some(s => s.specialty.name.toLowerCase().includes(query)) ||
        d.qualification.toLowerCase().includes(query)
      );
    }

    // 2. Specialty (Quick Filter or Drawer)
    if (specialtyFilter !== 'All') {
      console.log(`Filtering by dropdown specialty: ${specialtyFilter}`);
      results = results.filter(d => 
        d.specialties.some(s => s.specialty.name.trim() === specialtyFilter.trim())
      );
    } else if (activeFilters.specialties.length > 0) {
      console.log(`Filtering by drawer specialties: ${activeFilters.specialties.join(', ')}`);
      results = results.filter(d => 
        d.specialties.some(s => activeFilters.specialties.some(as => as.trim() === s.specialty.name.trim()))
      );
    }

    // 3. Experience
    if (activeFilters.experienceMin > 0) {
      results = results.filter(d => d.experienceYears >= activeFilters.experienceMin);
    }

    // 4. Fee Range
    results = results.filter(d => {
      const fee = parseFloat(d.fee);
      return fee >= activeFilters.feeMin && fee <= activeFilters.feeMax;
    });

    // 5. Rating
    if (activeFilters.ratingMin > 0) {
      results = results.filter(d => parseFloat(d.rating) >= activeFilters.ratingMin);
    }

    // 6. Gender
    if (activeFilters.gender !== 'Any') {
      results = results.filter(d => d.user.gender === activeFilters.gender);
    }

    // 7. District
    if (districtFilter !== 'All') {
      results = results.filter(d => d.user.district === districtFilter);
    }

    // 8. Sorting
    results.sort((a, b) => {
      if (sortBy === 'Rating') return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === 'Fee (Low to High)') return parseFloat(a.fee) - parseFloat(b.fee);
      if (sortBy === 'Experience') return b.experienceYears - a.experienceYears;
      return 0; // Recommended / Default
    });

    return results;
  }, [allDoctors, searchQuery, specialtyFilter, districtFilter, activeFilters, sortBy]);

  const handleBookNow = (doctor: Doctor) => {
    setProfileDoctor(null);
    setSelectedDoctor(doctor);
    setIsDrawerOpen(true);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setProfileDoctor(doctor);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[13px] text-slate-400 mb-1">
              <Link href="/dashboard/patient" className="hover:text-teal-600 transition-colors">Appointments</Link>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="text-slate-800 font-bold">Find a Doctor</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Find a Doctor</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all relative">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
             </button>
             <div className="flex items-center gap-3">
                <img src={user?.profilePhotoUrl || 'https://i.pravatar.cc/150?u=p1'} className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-black text-slate-800 leading-none">{user?.fullName || 'Md. Rafiqul'}</p>
                  <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Patient</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* Search Bar */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center text-slate-300 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-xl text-[15px] font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-teal-100 transition-all"
            />
          </div>
        </section>

        {/* Quick Filters */}
        <section className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 min-w-[180px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Specialty</span>
            <select 
              value={specialtyFilter} 
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 min-w-[180px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">District</span>
            <select 
              value={districtFilter} 
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Districts</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Sylhet">Sylhet</option>
            </select>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Today</span>
            <button 
              onClick={() => setAvailableToday(!availableToday)}
              className={`w-11 h-5.5 rounded-full relative transition-all duration-300 ${availableToday ? 'bg-teal-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${availableToday ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="ml-auto">
            <button 
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              More Filters
            </button>
          </div>
        </section>

        {/* Results Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Top Specialists in Dhaka</h2>
            <p className="text-sm text-slate-400 font-bold mt-1">
              {isLoading ? 'Searching specialists...' : (
                <>
                  <span className="text-slate-500">{filteredDoctors.length} doctors available</span>
                  <span className="mx-2">•</span>
                  <span className="text-slate-400">Showing verified & highly rated</span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <span className="text-sm text-slate-400 font-bold">Sort by:</span>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-teal-400 transition-all"
            >
              {sortBy}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {SORT_OPTIONS.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setSortBy(opt); setIsSortOpen(false); }}
                    className={`w-full px-5 py-3 text-left text-[13px] font-bold transition-colors ${sortBy === opt ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse shadow-sm" />
            ))
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onBookNow={handleBookNow} 
                onViewProfile={handleViewProfile} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-800">No doctors found</h3>
              <p className="text-slate-400 font-bold max-w-xs mt-1">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </main>

      {/* Drawers & Modals */}
      <BookingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        doctor={selectedDoctor} 
      />
      
      <FilterDrawer 
        isOpen={isFilterDrawerOpen} 
        onClose={() => setIsFilterDrawerOpen(false)} 
        onApply={(f) => setActiveFilters(f)} 
      />
      
      <DoctorProfileModal 
        doctor={profileDoctor} 
        onClose={() => setProfileDoctor(null)} 
        onBookNow={handleBookNow} 
      />
      
      {/* Click outside to close sort */}
      {isSortOpen && <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />}
    </div>
  );
}
