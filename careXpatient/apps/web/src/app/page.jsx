"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'tests'

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass h-20 flex items-center">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M5 12h14" /></svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">care<span className="text-primary">X</span>patient</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm">
            <Link href="/" className="text-primary font-bold">Home</Link>
            <Link href="#" className="hover:text-primary transition-colors">Find Doctors</Link>
            <Link href="#" className="hover:text-primary transition-colors">Book Tests</Link>
            <Link href="#" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#" className="hover:text-primary transition-colors">For Doctors</Link>
            <Link href="#" className="hover:text-primary transition-colors">Blog</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1 font-semibold hover:text-primary transition-colors px-2 py-1 text-sm border rounded-full border-foreground/10">
              <span>EN</span>
              <span className="text-foreground/30">|</span>
              <span className="text-foreground/50">বাংলা</span>
            </button>
            <Link href="/login" className="hidden sm:block font-semibold hover:text-primary transition-colors px-4 py-2">Login</Link>
            <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
            
            {/* Hamburger Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              
              {isMenuOpen ?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> :

              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 lg:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-primary">Home</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>Find Doctors</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>Book Tests</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>How it Works</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>For Doctors</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>Blog</Link>
            <div className="flex gap-4 mt-8">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 border rounded-full text-lg">Login</Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 bg-primary text-white rounded-full text-lg">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full opacity-20 bg-primary/30 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/4"></div>
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                Healthcare that <span className="text-primary">feels like care</span> — right when you need it.
              </h1>
              <p className="text-xl md:text-2xl text-subtle-gray mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100 leading-relaxed">
                Find trusted doctors, book lab tests at home, and keep records safe in one gentle place.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                  Find a Doctor Now
                </button>
                <button className="bg-white text-primary border-2 border-primary/10 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/5 transition-all">
                  Book a Lab Test
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6 animate-in fade-in duration-1000 delay-300">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) =>
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-subtle-gray/20 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-subtle-gray">
                    Trusted by <span className="text-foreground font-bold">50,000+</span> patients in Bangladesh
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) =>
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1000" alt="Doctor and Patient" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Verified Doctors</p>
                      <p className="text-sm text-subtle-gray">100% certified specialists</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Card */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-primary/10 border border-primary/5 p-8 lg:p-10">
            <div className="flex gap-8 mb-8 border-b border-foreground/5 pb-4">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`text-lg font-bold pb-4 transition-all ${activeTab === 'doctors' ? 'text-primary border-b-2 border-primary' : 'text-subtle-gray hover:text-foreground'}`}>
                
                Find Doctors
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`text-lg font-bold pb-4 transition-all ${activeTab === 'tests' ? 'text-primary border-b-2 border-primary' : 'text-subtle-gray hover:text-foreground'}`}>
                
                Book Lab Tests
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-subtle-gray ml-1">Location</label>
                <div className="relative">
                  <input type="text" placeholder={activeTab === 'doctors' ? "Search city or area..." : "Your home address..."} className="w-full bg-background border border-foreground/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle-gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-subtle-gray ml-1">Specialty / Condition</label>
                <div className="relative">
                  <input type="text" placeholder={activeTab === 'doctors' ? "eg. Cardiologist, Fever, Skin..." : "eg. Blood Test, MRI, COVID-19..."} className="w-full bg-background border border-foreground/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle-gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Four Simple Steps to Better Health</h2>
            <p className="text-xl text-subtle-gray max-w-2xl mx-auto leading-relaxed">
              We've designed our platform to remove the friction from healthcare, making it easy to get the care you need.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10"></div>
            
            {[
            { title: "Search & Discover", desc: "Find trusted specialists or book a lab test in seconds.", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
            { title: "Book Easily", desc: "Choose a time that works for you. No more long queues.", icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /> },
            { title: "Get Care", desc: "Consult via video or in-person. Gentle and expert care.", icon: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
            { title: "Stay Connected", desc: "Access your digital records anytime, anywhere securely.", icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> }].
            map((step, idx) =>
            <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-background border-4 border-white shadow-xl rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{step.icon}</svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-subtle-gray leading-relaxed">{step.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Services tailored to your needs</h2>
              <p className="text-xl text-subtle-gray leading-relaxed">
                Whether you need a quick consultation or a complete health checkup at home, we've got you covered.
              </p>
            </div>
            <Link href="#" className="text-primary font-bold flex items-center gap-2 group text-lg">
              View all services <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
            {
              title: "Consult a Specialist",
              desc: "Book video or in-person visits with top-rated doctors.",
              img: "/consult-doctor.png",
              color: "bg-teal-500"
            },
            {
              title: "At-Home Lab Tests",
              desc: "Professional sample collection from the comfort of your home.",
              img: "/lab-test.png",
              color: "bg-blue-500"
            },
            {
              title: "Digital Records Vault",
              desc: "Securely store and share all your health history in one place.",
              img: "/records-vault.png",
              color: "bg-indigo-500"
            }].
            map((service, idx) =>
            <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 border border-foreground/5">
                <div className="h-64 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest ${service.color}`}>Popular</div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-subtle-gray mb-8 leading-relaxed">{service.desc}</p>
                  <button className="flex items-center gap-2 text-primary font-bold group">
                    Learn More <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Doctor Spotlight */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Verified Specialists</h2>
            <p className="text-xl text-subtle-gray max-w-2xl mx-auto">
              Our network includes over 5,000 highly qualified doctors across 40+ specialties.
            </p>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 snap-x no-scrollbar">
            {[
            { name: "Dr. Sarah Ahmed", specialty: "Cardiologist", rating: "4.9", reviews: "120", img: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400" },
            { name: "Dr. Rahim Khan", specialty: "Pediatrician", rating: "4.8", reviews: "250", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400" },
            { name: "Dr. Anika Rahman", specialty: "Dermatologist", rating: "5.0", reviews: "85", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400" },
            { name: "Dr. S.M. Iqbal", specialty: "Neurologist", rating: "4.7", reviews: "310", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400" },
            { name: "Dr. Maria Gomez", specialty: "Gynecologist", rating: "4.9", reviews: "190", img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400" }].
            map((doc, idx) =>
            <div key={idx} className="min-w-[300px] snap-center bg-background rounded-3xl p-6 border border-foreground/5 hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="h-48 rounded-2xl overflow-hidden mb-6">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{doc.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg text-sm font-bold">
                    <span>★</span> {doc.rating}
                  </div>
                </div>
                <p className="text-primary font-semibold mb-4">{doc.specialty}</p>
                <p className="text-sm text-subtle-gray mb-6">{doc.reviews} Verified Reviews</p>
                <button className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose careXpatient */}
      <section className="py-32 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=1000" alt="Benefits" className="rounded-[3rem] shadow-2xl" />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-10">Why millions trust careXpatient</h2>
              <div className="space-y-8">
                {[
                { title: "24/7 Support", desc: "Our medical helpline is always open for emergency queries and bookings.", icon: "🕒" },
                { title: "Verified Expertise", desc: "Every professional on our platform goes through a rigorous 3-step verification.", icon: "🛡️" },
                { title: "Data Security", desc: "Your health records are encrypted with bank-level security protocols.", icon: "🔒" },
                { title: "Patient-Centric", desc: "We prioritize your comfort and time above all else in every interaction.", icon: "❤️" }].
                map((item, idx) =>
                <div key={idx} className="flex gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-subtle-gray leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Patient Stories</h2>
            <p className="text-xl text-subtle-gray">Real experiences from our community members.</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-[3rem] p-12 relative">
              <div className="absolute top-0 left-12 -translate-y-1/2 w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-serif">
                "
              </div>
              <p className="text-2xl md:text-3xl font-medium italic text-foreground leading-relaxed mb-10">
                The at-home lab test was so gentle and professional. I didn't have to wait in traffic or long hospital queues. The results were delivered to my app within 24 hours. Highly recommended!
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-subtle-gray/20">
                  <img src="https://i.pravatar.cc/150?u=jane" alt="Patient" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Farzana Yeasmin</h4>
                  <p className="text-primary font-semibold">Verified Patient since 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="bg-foreground rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]"></div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to take control of your health?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto relative z-10">
              Join 50,000+ members who have made the switch to smarter, more compassionate healthcare.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link href="/signup" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                Join Now for Free
              </Link>
              <div className="flex gap-4">
                <button className="bg-white/10 hover:bg-white/20 text-white p-1 rounded-2xl transition-all border border-white/10">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-14" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white p-1 rounded-2xl transition-all border border-white/10">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-background border-t border-foreground/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M5 12h14" /></svg>
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">care<span className="text-primary">X</span>patient</span>
              </div>
              <p className="text-lg text-subtle-gray max-w-sm mb-10 leading-relaxed">
                Empowering your health journey with accessible, compassionate, and digital-first care in Bangladesh and beyond.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) =>
                <Link key={i} href="#" className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <div className="w-6 h-6 bg-current opacity-20 rounded-sm"></div>
                  </Link>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-foreground font-bold text-lg mb-8 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Find Doctors</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Book Lab Tests</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">For Doctors</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-bold text-lg mb-8 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Press</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-bold text-lg mb-8 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-subtle-gray hover:text-primary transition-colors">Trust & Safety</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-subtle-gray font-medium">© 2026 CareXPatient Healthcare. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 font-bold text-sm text-foreground/70">
                <span>🌐</span> English (US)
              </button>
              <button className="flex items-center gap-2 font-bold text-sm text-foreground/70">
                <span>৳</span> BDT
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Nav (Optional for mobile feel) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 glass h-16 rounded-2xl border border-white/50 flex items-center justify-around px-4 shadow-2xl">
        <button className="text-primary flex flex-col items-center gap-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="text-subtle-gray flex flex-col items-center gap-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-bold">Search</span>
        </button>
        <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg -translate-y-6 border-4 border-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button className="text-subtle-gray flex flex-col items-center gap-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold">Booking</span>
        </button>
        <button className="text-subtle-gray flex flex-col items-center gap-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
      
      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-24"></div>
    </div>);

}