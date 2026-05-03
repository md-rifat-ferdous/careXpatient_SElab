import Link from 'next/link';
import React from 'react';

const TopNavBar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800 font-sans text-sm antialiased">
    <div className="flex items-center gap-8">
      <span className="text-xl font-bold tracking-tight text-teal-600 dark:text-teal-400">careXpatient</span>
      <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-64 lg:w-96">
        <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
        <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none" placeholder="Search records..." type="text"/>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-700 transition-all text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-700 transition-all text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined">settings</span>
      </button>
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">Mr. Rahim Ali</p>
          <p className="text-[11px] text-slate-500">Premium Member</p>
        </div>
        <img alt="Mr. Rahim Ali Profile Picture" className="w-10 h-10 rounded-full object-cover border-2 border-teal-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaKgWhmQnqnkwEN7C7GeNq-nlV26y6-W4qGvSV_7IAaKhmeJpCO4gvoMD1wAnzDH-Lfr5afF45uGNzb0-VfH6ktyr7mgv9gZ34I522wHi7NAZBgQCzKUTnMSCCvIn-jEoKt3z6xQ1_vWS3_fLRVL_QNjajN-xvxt-_KBZ5XhlGH7mD8IU9AjtL3AwXpImusXqxKgcKJC-MuYu3uNbgX0NkFB6FhR4phYlTeiJuFKn-qfTDbooRy2K8wBBPdxbU21KPcPYANULM00M"/>
      </div>
    </div>
  </nav>
);

const SideNavBar = () => (
  <aside className="fixed left-0 top-16 bottom-0 flex flex-col py-6 w-64 hidden md:flex bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 font-sans text-sm font-medium z-40">
    <div className="mb-8 px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-black text-teal-600 dark:text-teal-400">careXpatient</span>
      </div>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Patient Portal</p>
    </div>
    <nav className="space-y-1">
      <Link href="#" className="text-slate-500 dark:text-slate-400 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined">dashboard</span> Dashboard
      </Link>
      <Link href="#" className="text-slate-500 dark:text-slate-400 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined">calendar_today</span> Appointments
      </Link>
      <Link href="#" className="text-slate-500 dark:text-slate-400 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined">biotech</span> Lab Tests
      </Link>
      <Link href="/report" className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg mx-2 px-4 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined">description</span> Reports
      </Link>
      <Link href="#" className="text-slate-500 dark:text-slate-400 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined">medication</span> Prescriptions
      </Link>
      <Link href="#" className="text-slate-500 dark:text-slate-400 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined">group</span> Family Profile
      </Link>
    </nav>
    <div className="mt-auto px-6">
      <div className="bg-teal-600 rounded-xl p-4 text-white">
        <p className="font-bold text-sm mb-1">Need help?</p>
        <p className="text-xs text-white/80 mb-3 leading-relaxed">Our support team is available 24/7 for you.</p>
        <button className="bg-white text-teal-600 w-full py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Contact Support</button>
      </div>
    </div>
  </aside>
);

const MobileNavBar = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around z-50">
    <button className="flex flex-col items-center text-slate-400 gap-1">
      <span className="material-symbols-outlined">dashboard</span>
      <span className="text-[10px] font-bold uppercase">Home</span>
    </button>
    <button className="flex flex-col items-center text-slate-400 gap-1">
      <span className="material-symbols-outlined">calendar_today</span>
      <span className="text-[10px] font-bold uppercase">Appt</span>
    </button>
    <button className="flex flex-col items-center text-teal-600 gap-1">
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
      <span className="text-[10px] font-bold uppercase">Reports</span>
    </button>
    <button className="flex flex-col items-center text-slate-400 gap-1">
      <span className="material-symbols-outlined">group</span>
      <span className="text-[10px] font-bold uppercase">Family</span>
    </button>
  </div>
);

type ReportItemData = {
  id: string;
  title: string;
  lab: string;
  date: string;
  reportId: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
};

const ReportItem = ({ data }: { data: ReportItemData }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer">
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl ${data.iconBg} flex items-center justify-center ${data.iconColor} ${data.hoverBg} group-hover:text-white transition-all duration-300 shadow-sm`}>
        <span className="material-symbols-outlined text-3xl">{data.icon}</span>
      </div>
      <div>
        <h3 className="font-bold text-xl text-slate-900 tracking-tight mb-0.5">{data.title}</h3>
        <p className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">location_on</span> {data.lab}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-6 flex-1 md:justify-center md:max-w-md">
      <div className="bg-slate-50/80 rounded-xl p-3 w-full border border-slate-100/50">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date</p>
        <p className="text-sm font-semibold text-slate-700">{data.date}</p>
      </div>
      <div className="bg-slate-50/80 rounded-xl p-3 w-full border border-slate-100/50">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Report ID</p>
        <p className="text-sm font-semibold text-slate-700">{data.reportId}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Link href={`/report/${data.id}`} className="flex-1 md:flex-none px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-[15px] shadow-md shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 text-center">
        View Report
      </Link>
      <button className="px-4 py-3 rounded-xl border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-gray-100 transition-all flex items-center justify-center h-[48px] active:scale-95">
        <span className="material-symbols-outlined text-[22px]">download</span>
      </button>
    </div>
  </div>
);

export default function ReportListDashboard() {
  const recentReports: ReportItemData[] = [
    {
      id: "1",
      title: "Kidney Function Test (KFT)",
      lab: "Labaid Diagnostic",
      date: "Feb 10, 2026",
      reportId: "#LA-110492",
      icon: "lab_research",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      hoverBg: "group-hover:bg-teal-600"
    },
    {
      id: "2",
      title: "Lipid Profile",
      lab: "Square Hospital Lab",
      date: "Feb 02, 2026",
      reportId: "#SQ-883102",
      icon: "monitor_heart",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      hoverBg: "group-hover:bg-teal-600"
    }
  ];

  const olderReports: ReportItemData[] = [
    {
      id: "3",
      title: "Blood Sugar (Fasting)",
      lab: "Ibn Sina Diagnostic",
      date: "Jan 28, 2026",
      reportId: "#IB-774210",
      icon: "science",
      iconBg: "bg-slate-50",
      iconColor: "text-slate-400",
      hoverBg: "group-hover:bg-teal-600"
    },
    {
      id: "4",
      title: "Complete Blood Count (CBC)",
      lab: "Popular Diagnostic Center",
      date: "Jan 25, 2026",
      reportId: "#PD-992831",
      icon: "bloodtype",
      iconBg: "bg-slate-50",
      iconColor: "text-slate-400",
      hoverBg: "group-hover:bg-teal-600"
    }
  ];

  return (
    <div className="bg-background-off-white text-on-surface font-sans min-h-screen">
      <TopNavBar />
      
      <div className="flex pt-16 min-h-screen">
        <SideNavBar />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-[1280px] mx-auto w-full mb-16 md:mb-0">
          <header className="mb-8">
            <h1 className="text-[32px] font-semibold text-on-surface mb-2 leading-tight">Medical Reports</h1>
            <p className="text-[16px] text-tertiary">All your lab reports from different laboratories in one place</p>
          </header>

          <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 mb-12 border border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Search Reports</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm outline-none transition-all" placeholder="Test name or ID..." type="text"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Lab</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm appearance-none outline-none transition-all" style={{ backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "20px 20px" }}>
                  <option>All Laboratories</option>
                  <option>Popular Diagnostic</option>
                  <option>Ibn Sina</option>
                  <option>Square Hospital</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Date</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm appearance-none outline-none transition-all" style={{ backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "20px 20px" }}>
                  <option>Last 30 Days</option>
                  <option>Last 6 Months</option>
                  <option>2025 Reports</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Test Type</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm appearance-none outline-none transition-all" style={{ backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "20px 20px" }}>
                  <option>All Types</option>
                  <option>Blood Work</option>
                  <option>Imaging</option>
                  <option>Urine Analysis</option>
                </select>
              </div>
            </div>
          </section>

          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-teal-500 rounded"></div>
              <h2 className="text-[24px] font-semibold text-on-surface">Recent Reports</h2>
            </div>
            <div className="space-y-6">
              {recentReports.map(report => (
                <ReportItem key={report.id} data={report} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-teal-500 rounded"></div>
              <h2 className="text-[24px] font-semibold text-on-surface">Older Reports</h2>
            </div>
            <div className="space-y-6">
              {olderReports.map(report => (
                <ReportItem key={report.id} data={report} />
              ))}
            </div>
          </section>

          <div className="mt-12 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Showing 4 of 48 reports</p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">3</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <MobileNavBar />
    </div>
  );
}
