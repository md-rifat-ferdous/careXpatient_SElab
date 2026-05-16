const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugData() {
  console.log('--- DEBUGGING PATIENT DATA ---');
  
  const patients = await prisma.patient.findMany({
    include: {
      prescriptions: { select: { date: true }, orderBy: { date: 'desc' }, take: 1 },
      reports: { select: { date: true }, orderBy: { date: 'desc' }, take: 1 }
    }
  });

  patients.forEach(p => {
    console.log(`Patient: ${p.name} (${p.id})`);
    console.log(`- LastVisit Field: ${p.lastVisit}`);
    console.log(`- Prescriptions count: ${p.prescriptions.length}`);
    if (p.prescriptions.length > 0) {
      console.log(`  - Latest Prescription Date: ${p.prescriptions[0].date}`);
    }
    console.log(`- Reports count: ${p.reports.length}`);
    if (p.reports.length > 0) {
      console.log(`  - Latest Report Date: ${p.reports[0].date}`);
    }
    
    const dates = [];
    if (p.lastVisit) dates.push(new Date(p.lastVisit));
    if (p.prescriptions[0]?.date) dates.push(new Date(p.prescriptions[0].date));
    if (p.reports[0]?.date) dates.push(new Date(p.reports[0].date));
    
    const finalDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : 'None';
    console.log(`- CALCULATED LAST VISIT: ${finalDate}`);
    console.log('----------------------------');
  });
}

debugData().catch(console.error).finally(() => prisma.$disconnect());
