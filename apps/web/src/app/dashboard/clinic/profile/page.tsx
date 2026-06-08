"use client";

import React from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Input, 
  Badge 
} from '@carexpatient/ui';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Camera,
  Save,
  ShieldCheck,
  Settings
} from 'lucide-react';

export default function ClinicProfile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="h1">Clinic Profile</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Configure your clinic's public identity and operational settings.</Typography>
        </div>
        <Badge variant="primary" className="h-8 px-4 flex items-center gap-2 shadow-lg shadow-primary/10">
          <ShieldCheck className="w-4 h-4" /> Verified Clinic
        </Badge>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-surface-muted border-2 border-dashed border-border-soft flex flex-col items-center justify-center text-text-muted group cursor-pointer hover:border-primary/30 transition-all">
              <Building2 className="w-10 h-10 mb-1 opacity-20" />
              <Typography variant="small" className="text-[10px] font-bold uppercase tracking-widest">Logo</Typography>
              <div className="absolute inset-0 bg-primary/80 text-white flex items-center justify-center rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Clinic Name</Typography>
                <Input defaultValue="Banani Central Clinic" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Clinic ID</Typography>
                <Input defaultValue="CLN-BD-8802" disabled className="h-12 rounded-xl bg-surface-muted/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Short Description</Typography>
              <textarea 
                className="w-full p-4 rounded-xl border border-border-soft focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none bg-surface min-h-[100px]"
                defaultValue="A state-of-the-art diagnostic and consultation center specializing in cardiology and preventive care."
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <Typography variant="h3">Location Details</Typography>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Street Address</Typography>
              <Input defaultValue="House 42, Road 11, Banani" className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">City</Typography>
                <Input defaultValue="Dhaka" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Postcode</Typography>
                <Input defaultValue="1213" className="h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <Typography variant="h3">Contact Channels</Typography>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
              <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Public Phone</Typography>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input defaultValue="+880 1711 000111" className="h-12 pl-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-text-muted">Official Email</Typography>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input defaultValue="contact@bananicentral.care" className="h-12 pl-12 rounded-xl" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-border-soft/50">
        <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">Discard Changes</Button>
        <Button className="h-12 px-10 rounded-xl font-black shadow-xl shadow-primary/20 gap-2">
          <Save className="w-4 h-4" /> Save Clinic Settings
        </Button>
      </div>
    </div>
  );
}
