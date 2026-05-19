import * as fs from 'fs';
import * as path from 'path';

const replacements = [
  { from: /bg-slate-50/g, to: 'bg-surface-muted' },
  { from: /bg-white/g, to: 'bg-surface' },
  { from: /border-slate-200/g, to: 'border-border-soft' },
  { from: /border-slate-100/g, to: 'border-border-soft' },
  { from: /text-slate-900/g, to: 'text-text' },
  { from: /text-slate-800/g, to: 'text-text' },
  { from: /text-slate-700/g, to: 'text-text' },
  { from: /text-slate-600/g, to: 'text-text-muted' },
  { from: /text-slate-500/g, to: 'text-text-muted' },
  { from: /text-slate-400/g, to: 'text-text-muted' },
  { from: /text-slate-300/g, to: 'text-text-muted' },
  { from: /text-teal-600/g, to: 'text-primary' },
  { from: /text-teal-700/g, to: 'text-primary-dark' },
  { from: /text-teal-900/g, to: 'text-primary-dark' },
  { from: /bg-teal-600/g, to: 'bg-primary' },
  { from: /bg-teal-700/g, to: 'bg-primary-dark' },
  { from: /bg-teal-500/g, to: 'bg-primary' },
  { from: /bg-teal-50/g, to: 'bg-primary/10' },
  { from: /border-teal-50/g, to: 'border-primary/10' },
  { from: /border-teal-100/g, to: 'border-primary/20' },
  { from: /ring-teal-500\/20/g, to: 'ring-primary/20' },
  { from: /border-teal-500/g, to: 'border-primary' },
  { from: /hover:text-teal-600/g, to: 'hover:text-primary' },
  { from: /hover:bg-teal-700/g, to: 'hover:bg-primary-dark' },
  { from: /hover:bg-teal-50/g, to: 'hover:bg-primary/10' },
  { from: /text-red-500/g, to: 'text-alert-critical' },
  { from: /hover:bg-red-50/g, to: 'hover:bg-alert-critical/10' },
  { from: /shadow-sm/g, to: 'shadow-soft' },
  { from: /border-\[\#F1F5F9\]/g, to: 'border-border-soft' },
  { from: /text-\[\#64748B\]/g, to: 'text-text-muted' },
  { from: /border-\[\#0D9488\]\/20/g, to: 'border-primary/20' },
  { from: /border-t-\[\#0D9488\]/g, to: 'border-t-primary' },
];

const files = [
  'apps/web/src/components/prescriptions/PrescriptionDetailView.tsx',
  'apps/web/src/components/prescriptions/PrescriptionFilters.tsx',
  'apps/web/src/components/prescriptions/PrescriptionList.tsx',
  'apps/web/src/app/dashboard/patient/prescriptions/page.tsx',
  'apps/web/src/app/dashboard/patient/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
