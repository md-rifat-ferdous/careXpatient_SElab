"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DoctorCard from '../../components/DoctorCard';
import BookingDrawer from '../../components/BookingDrawer';
import FilterDrawer, { FilterState, defaultFilters } from '../../components/FilterDrawer';
import DoctorProfileModal from '../../components/DoctorProfileModal';
import { Doctor, DoctorFilters } from '../../types/doctor';
import { getDoctors } from '../../services/doctorService';

type SortOption = 'Recommended' | 'Rating' | 'Fee (Low to High)' | 'Experience';
const SORT_OPTIONS: SortOption[] = ['Recommended', 'Rating', 'Fee (Low to High)', 'Experience'];

export default function DoctorsSearchPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [sortBy, setSortBy] = useState<SortOption>('Recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(defaultFilters);

  // Fetch doctors when filters or sort change
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      const mappedSortBy = 
        sortBy === 'Rating' ? 'rating' : 
        sortBy === 'Fee (Low to High)' ? 'fee_asc' : 
        sortBy === 'Experience' ? 'experience' : 'recommended';

      const filters: DoctorFilters = {
        search: searchQuery,
        specialty: specialtyFilter,
        district: districtFilter,
        availableToday,
        feeMin: activeFilters.feeMin,
        feeMax: activeFilters.feeMax,
        experienceMin: activeFilters.experienceMin,
        ratingMin: activeFilters.ratingMin,
        gender: activeFilters.gender,
        specialties: activeFilters.specialties,
        sortBy: mappedSortBy,
      };

      const data = await getDoctors(filters);
      setDoctors(data);
      setIsLoading(false);
    };

    fetchDoctors();
  }, [searchQuery, specialtyFilter, districtFilter, sortBy, availableToday, activeFilters]);

  // Extract unique specialties for the quick filter dropdown
  // In a real app, this might come from its own API
  const specialties = useMemo(() => {
    // We use a separate fetch or use a hardcoded list for specialties
    return ['Cardiologist', 'Pediatrician', 'Dermatologist', 'Neurologist', 'Gynecologist', 'Orthopedic'];
  }, []);

  const handleBookNow = (doctor: Doctor) => {
    setProfileDoctor(null);
    setSelectedDoctor(doctor);
    setIsDrawerOpen(true);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setProfileDoctor(doctor);
  };

  const hasActiveFilters = activeFilters.specialties.length > 0 || activeFilters.experienceMin > 0 ||
    activeFilters.ratingMin > 0 || activeFilters.feeMax < 500 || activeFilters.gender !== 'Any';
  
  const activeFilterCount = [
    activeFilters.specialties.length > 0, activeFilters.experienceMin > 0,
    activeFilters.ratingMin > 0, activeFilters.feeMax < 500, activeFilters.gender !== 'Any',
  ].filter(Boolean).length;

  const navItems = [
    { label: 'Dashboard', href: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: 'Appointments', href: '/doctors', active: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: 'Lab Tests', href: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14H5a2 2 0 0 1-2-2V5m16 9v3a2 2 0 0 1-2 2h-1"/></svg> },
    { label: 'Reports', href: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label: 'Prescription', href: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M5 12h14"/><circle cx="12" cy="12" r="10"/></svg> },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col py-6 bg-white border-r border-slate-100 w-60 shrink-0 shadow-sm">
        <div className="px-5 mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20"/><path d="M5 12h14"/></svg>
            </div>
            <span className="text-base font-black tracking-tight text-slate-800">care<span className="text-teal-500">X</span>patient</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item: any) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${item.active ? 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-500 pl-2' : 'text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-50'}`}>
              <span className={item.active ? 'text-teal-600' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 mt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <span>Appointments</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="text-slate-700 font-semibold">Find a Doctor</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Find a Doctor</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src="https://i.pravatar.cc/150?u=patient1" alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all" />
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-700 leading-none">Md. Rafiqul</p>
                <p className="text-xs text-slate-400 mt-0.5">Patient</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 hidden lg:block"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 px-8 py-8 max-w-[1280px] w-full mx-auto">
          {/* Search */}
          <section className="mb-6">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="Search by doctor name, specialty, or condition..."
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </section>

          {/* Filters */}
          <section className="flex flex-wrap items-center gap-3 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialty</span>
              <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none text-slate-700">
                <option value="All Specialties">All</option>
                {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* District filter */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District</span>
              <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none text-slate-700">
                <option value="All Districts">All</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Cumilla">Cumilla</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Narsingdi">Narsingdi</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Today</span>
              <button
                onClick={() => setAvailableToday((prev) => !prev)}
                className={`w-10 h-5 rounded-full relative shrink-0 transition-colors duration-200 ${availableToday ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${availableToday ? 'right-0.5 translate-x-0' : 'left-0.5'}`}></span>
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => setIsFilterDrawerOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-lg transition-colors ${hasActiveFilters ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                More Filters
                {hasActiveFilters && <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
              </button>
            </div>
          </section>

          {/* Section Header + Sort */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Top Specialists in Dhaka</h2>
              <p className="text-sm text-slate-400 mt-1">
                {isLoading ? 'Searching...' : `${doctors.length} doctors available · Showing verified & highly rated`}
              </p>
            </div>
            {/* Sort Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium hidden sm:block">Sort by:</span>
                <button onClick={() => setIsSortOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:border-teal-400 transition-colors">
                  {sortBy}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[180px] py-1 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => { setSortBy(opt); setIsSortOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${sortBy === opt ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                      {opt === sortBy && <span className="mr-2">✓</span>}{opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Doctor Grid or Loading Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 h-[220px] animate-pulse">
                  <div className="p-5 flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl"></div>
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mx-5 border-t border-slate-50"></div>
                  <div className="p-5 flex justify-between mt-auto">
                    <div className="h-8 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No doctors found</h3>
              <p className="text-slate-400 text-sm max-w-xs">We couldn't find any doctors matching your criteria. Try adjusting your filters.</p>
              <button onClick={() => { setSearchQuery(''); setSpecialtyFilter('All Specialties'); setDistrictFilter('All Districts'); setActiveFilters(defaultFilters); }}
                className="mt-5 px-5 py-2.5 text-sm font-bold text-teal-600 border border-teal-300 rounded-xl hover:bg-teal-50 transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} onBookNow={handleBookNow} onViewProfile={handleViewProfile} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Close sort dropdown on outside click */}
      {isSortOpen && <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />}

      <BookingDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} doctor={selectedDoctor} />
      <FilterDrawer isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} onApply={(f) => setActiveFilters(f)} />
      <DoctorProfileModal doctor={profileDoctor} onClose={() => setProfileDoctor(null)} onBookNow={handleBookNow} />
    </div>
  );
}
