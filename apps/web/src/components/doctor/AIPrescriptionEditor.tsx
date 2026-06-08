"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Badge,
  cn 
} from '@carexpatient/ui';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Stethoscope,
  Send
} from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function AIPrescriptionEditor() {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAISuggest = async () => {
    if (!diagnosis) return;
    setIsAnalyzing(true);
    
    // In a real app, this calls the backend AI service
    setTimeout(() => {
      const suggestions: Record<string, Medicine[]> = {
        'hypertension': [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
        ],
        'cold': [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3 days' },
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily (Night)', duration: '5 days' }
        ]
      };

      const key = Object.keys(suggestions).find(k => diagnosis.toLowerCase().includes(k));
      if (key) {
        setMedicines([...medicines, ...suggestions[key]]);
      }
      setIsAnalyzing(false);
    }, 1200);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto shadow-2xl border-primary/10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="h2">E-Prescription Editor</Typography>
            <Typography variant="small" className="text-text-muted">Digital Consultation ID: #PRX-2026-991</Typography>
          </div>
        </div>
        <Badge variant="primary" className="h-8 px-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Secure Session
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <Typography variant="small" className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Diagnosis / Assessment</Typography>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Stage 1 Hypertension, Common Cold..." 
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="h-14 rounded-2xl bg-surface-muted/50"
            />
            <Button 
              onClick={handleAISuggest} 
              disabled={!diagnosis || isAnalyzing}
              className="h-14 px-6 rounded-2xl bg-primary-dark text-white gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-300" />
              )}
              AI Suggest
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="small" className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted">Medications</Typography>
            <Button variant="outline" size="sm" onClick={addMedicine} className="h-9 px-4 gap-2 rounded-xl border-primary/20 text-primary hover:bg-primary/5">
              <Plus className="w-4 h-4" /> Add Manually
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((med, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="grid grid-cols-12 gap-3 items-center p-4 bg-surface-muted/30 rounded-2xl border border-border-soft group"
              >
                <div className="col-span-4">
                  <Input 
                    placeholder="Medicine Name" 
                    value={med.name} 
                    className="h-11 bg-white"
                    onChange={(e) => {
                      const newMeds = [...medicines];
                      newMeds[i].name = e.target.value;
                      setMedicines(newMeds);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Dosage" value={med.dosage} className="h-11 bg-white" />
                </div>
                <div className="col-span-3">
                  <Input placeholder="Frequency" value={med.frequency} className="h-11 bg-white" />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Duration" value={med.duration} className="h-11 bg-white" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => removeMedicine(i)} className="p-2 text-text-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {medicines.length === 0 && (
              <div className="h-32 border-2 border-dashed border-border-soft rounded-3xl flex flex-col items-center justify-center text-text-muted">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                <Typography variant="body" className="text-sm">No medications added yet.</Typography>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex justify-end gap-4 border-t border-border-soft/50">
          <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-text-muted">Save Draft</Button>
          <Button className="h-14 px-10 rounded-2xl font-black shadow-xl shadow-primary/30 gap-2">
            Issue Prescription <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
