import React from 'react';
import LabShell from './LabShell';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>;
}
