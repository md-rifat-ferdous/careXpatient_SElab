'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  getLabPatients,
  type LabPatient,
} from '@/services/lab.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAgeAndGender(fullName: string, dob: string | null) {
  let age = '—';
  if (dob) {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    age = `${currentYear - birthYear}y`;
  }
  const femaleNames = ['elena', 'jen', 'amara', 'linda', 'sophia', 'emma', 'sarah', 'woman', 'female', 'kalu', 'rodriguez'];
  const nameLower = fullName.toLowerCase();
  const gender = femaleNames.some(f => nameLower.includes(f)) ? 'Female' : 'Male';
  return dob ? `${age} / ${gender}` : `— / ${gender}`;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-slate-100"
      />
    );
  }
  const colors = [
    'bg-[#006b5f]/10 text-[#006b5f]',
    'bg-[#14b8a6]/10 text-[#14b8a6]',
    'bg-[#50616b]/10 text-[#50616b]',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0 font-bold text-sm`}>
      {initials}
    </div>
  );
}

// ── Skeleton row matching table columns ────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-full" />
          <div className="space-y-1">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-8" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-8" /></td>
      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto" /></td>
    </tr>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function LabPatientsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 10;

  const fetchPatients = useCallback(async (page: number, q: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLabPatients(token, page, q, LIMIT);
      setPatients(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients(currentPage, search);
  }, [fetchPatients, currentPage, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="max-w-[1280px] mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#111c2d]">Patients</h1>
          <p className="text-[#3c4947] mt-2 text-sm">Manage and monitor patient records and diagnostic history.</p>
        </div>
        <div className="flex gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-64">
            <span className="material-symbols-outlined absolute left-3 text-[#3c4947] pointer-events-none">search</span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-[#bbcac6]/30 rounded-xl py-2 pl-10 pr-4 text-sm text-[#111c2d] placeholder-[#3c4947]/50 focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20"
              placeholder="Search patients..."
              type="text"
            />
          </form>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Patients Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-[#bbcac6]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff] border-b border-[#bbcac6]/30">
                <th className="px-6 py-4 font-semibold text-[#3c4947] text-[14px]">Patient Name</th>
                <th className="px-4 py-4 font-semibold text-[#3c4947] text-[14px]">Age / Gender</th>
                <th className="px-4 py-4 font-semibold text-[#3c4947] text-[14px]">Blood Group</th>
                <th className="px-4 py-4 font-semibold text-[#3c4947] text-[14px]">Last Test Date</th>
                <th className="px-4 py-4 font-semibold text-[#3c4947] text-[14px]">Last Test Name</th>
                <th className="px-4 py-4 font-semibold text-[#3c4947] text-[14px]">Total Tests</th>
                <th className="px-6 py-4 font-semibold text-[#3c4947] text-[14px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcac6]/20">
              {loading ? (
                [...Array(LIMIT)].map((_, i) => <SkeletonRow key={i} />)
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#3c4947]">
                    <span className="material-symbols-outlined text-4xl text-[#bbcac6]">person_off</span>
                    <p className="mt-2 text-sm">No patients found matching the search criteria.</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-white/50 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/dashboard/lab/patients/${patient.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={patient.fullName} url={patient.profilePhotoUrl} />
                        <div>
                          <p className="font-semibold text-[#111c2d] text-sm group-hover:text-[#006b5f] transition-colors">
                            {patient.fullName}
                          </p>
                          <p className="text-[12px] text-[#94A3B8]">#LC-{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#111c2d] text-[14px]">
                      {getAgeAndGender(patient.fullName, patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-4 text-[#111c2d] text-[14px]">
                      {patient.bloodGroup || '—'}
                    </td>
                    <td className="px-4 py-4 text-[#111c2d] text-[14px]">
                      {formatDate(patient.lastOrderDate)}
                    </td>
                    <td className="px-4 py-4 text-[#111c2d] text-[14px] max-w-[200px] truncate">
                      {patient.lastOrderTests || '—'}
                    </td>
                    <td className="px-4 py-4 text-[#111c2d] text-[14px]">
                      {patient.ordersCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/lab/patients/${patient.id}`);
                        }}
                        className="p-2 text-[#006b5f] hover:bg-[#006b5f]/10 rounded-full transition-all active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="px-6 py-4 bg-[#f0f3ff] border-t border-[#bbcac6]/30 flex items-center justify-between">
            <p className="text-sm text-[#3c4947]">
              Showing <span className="font-bold text-[#111c2d]">{Math.min((currentPage - 1) * LIMIT + 1, totalCount)}-{Math.min(currentPage * LIMIT, totalCount)}</span> of <span className="font-bold text-[#111c2d]">{totalCount}</span> patients
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#bbcac6] hover:bg-white transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {pageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-[#94A3B8]">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-colors ${
                      currentPage === p
                        ? 'bg-[#006b5f] text-white font-semibold'
                        : 'border border-[#bbcac6] hover:bg-white text-[#111c2d]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#bbcac6] hover:bg-white transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
