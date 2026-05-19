"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { 
  Typography, 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  cn 
} from '@carexpatient/ui';
import { 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

// New components
import { VitalTrends, VitalTrendsSkeleton } from '@/components/dashboard/VitalTrends';
import { ActivityTimeline, ActivityTimelineSkeleton } from '@/components/dashboard/ActivityTimeline';
import { UpcomingConsultations, UpcomingConsultationsSkeleton } from '@/components/dashboard/UpcomingConsultations';

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Upcoming', value: '2', icon: <Calendar className="w-5 h-5" />, color: 'text-primary bg-primary/10' },
    { label: 'Prescriptions', value: '4', icon: <FileText className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Reports', value: '1', icon: <Activity className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Check-up', value: '12 May', icon: <Clock className="w-5 h-5" />, color: 'text-rose-600 bg-rose-50' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Welcome Banner */}
      <motion.section variants={itemVariants} className="relative overflow-hidden bg-primary rounded-[32px] p-8 md:p-12 text-white shadow-soft">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography variant="small" className="text-white/80 font-semibold mb-2 uppercase tracking-widest">
              Patient Portal
            </Typography>
            <Typography variant="h1" className="text-white mb-4">
              Good Morning, {user?.fullName?.split(' ')[0] || 'Rahim'}
            </Typography>
            <Typography variant="body" className="text-white/80 text-lg mb-8 max-w-lg">
              Everything looks good! You have <span className="font-bold text-white underline decoration-white/30 underline-offset-4">2 scheduled consultations</span> today. Stay hydrated and have a great day.
            </Typography>
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <Button className="bg-white text-primary hover:bg-surface-muted rounded-xl px-8 py-6 font-bold shadow-lg shadow-black/5 group">
              <PlusCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Book New Appointment
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-6">
              View Medical History
            </Button>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-10 translate-y-1/4 w-64 h-64 bg-primary-light/20 rounded-full blur-2xl opacity-30" />
        <ShieldCheck className="absolute top-8 right-8 w-12 h-12 text-white/10" />
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
              {stat.icon}
            </div>
            <div>
              <Typography variant="small" className="uppercase tracking-widest text-[10px] font-bold text-text-muted">
                {stat.label}
              </Typography>
              <Typography variant="h3" className="text-xl">
                {stat.value}
              </Typography>
            </div>
          </Card>
        ))}
      </motion.section>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trends & Consultations */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <>
              <VitalTrendsSkeleton />
              <UpcomingConsultationsSkeleton />
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <VitalTrends />
              </motion.div>
              <motion.div variants={itemVariants}>
                <UpcomingConsultations />
              </motion.div>
            </>
          )}
        </div>

        {/* Right Column: Journey & Insights */}
        <div className="space-y-8">
          {isLoading ? (
            <>
              <ActivityTimelineSkeleton />
              <Card className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-20 w-full" />
              </Card>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <ActivityTimeline />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-amber-50 border-amber-200">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold text-amber-900">Health Insight</Typography>
                      <Typography variant="small" className="text-amber-800 mt-1">
                        Your blood sugar levels have been slightly higher this week. Consider reducing sugar intake and monitoring more frequently.
                      </Typography>
                      <Button variant="ghost" size="sm" className="text-amber-700 font-bold p-0 mt-2 h-auto hover:bg-transparent underline">
                        Talk to Nutritionist
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-0 overflow-hidden group">
                  <div className="bg-primary-dark p-6 text-white">
                    <Typography variant="h3" className="text-white mb-2">Telemedicine Plus</Typography>
                    <Typography variant="small" className="text-white/70">Get unlimited video consultations for only $9.99/mo</Typography>
                  </div>
                  <Button className="w-full rounded-none bg-surface-muted text-text-muted hover:text-primary py-4 font-bold uppercase tracking-widest text-[10px]">
                    Upgrade Account <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
