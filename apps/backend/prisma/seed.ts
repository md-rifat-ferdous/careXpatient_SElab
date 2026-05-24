import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const DOCTOR_EMAIL = "doctor@carexpatient.com";
  
  const user = await prisma.user.upsert({
    where: { email: DOCTOR_EMAIL },
    update: {},
    create: {
      email: DOCTOR_EMAIL,
      name: 'Dr. Sarah Jenkins',
      role: 'DOCTOR',
    },
  });

  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'Square Hospitals Ltd.',
      address: '18/F, West Panthapath, Dhaka',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMv_TYSrT_3KeSZg3p4zjLr_-N3VuAHM_P7u0cwzTi9tou4pVL2vZoyJm7GN2F439-5pG6aXAJqxV5GrJBKhnobb1IlFJe8vtNM57MEVVn_o76WHPU-IB3PvxUPx1kA2-dHXtvssMjQ0Is3uF1pa5ltC7X9ivYhDBaBIMQjQ7UYNIwQBpC3gE5dGZaVnMhNsEpMVN7UQTOjVK91lHv_9_apw6FZdmjqSv0I0z9ruJzumTS39aRFwMooTXDpKvCQtr1qEQAcazWQVRk"
    }
  });

  const clinic2 = await prisma.clinic.create({
    data: {
      name: 'Labaid Specialized Hospital',
      address: 'House-06, Road-04, Dhanmondi, Dhaka',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC39k9HeAha4gzW-KGW0XgXhHExi3ZKECyY5MERbQ3D2Okk8t5-PVIM065tJcZ8WUCIMPrKj5aqvErqw86QEdUlPVz-iUv9Nlt-UqLANJ9GknEk8PhYg8a-SVyTLsLDovXBDfvR9HHxJe2-vF7Fc3zEzvPGIz_tdS1ZT5i0S8rMv3ev5yge4uUXkmqdRCR8Zl2ZHOrAr1x0uatoco0DGhDqVmYG7W_NMNTvE_VeHsZtM17G4BUpgQZF960MxwlsimZC6nuR38eoJGi"
    }
  });

  const clinic3 = await prisma.clinic.create({
    data: {
      name: 'United Hospital Limited',
      address: 'Plot 15, Road 71, Gulshan-2, Dhaka',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBljrzyx7-vgwipwujMdjsDmqubqekSgAgmB4LhEnM-ooBLWtML5fBoUXV1THcKYzDjuyrQ1Kwk2x97PoxIKwKUFtlqOHispOiYm2fpPhYHRcO4snqRjwp_j_O7GfU3qJrpJubsto0kp9QhvJeLo9WhDsEAdXjfgmOFhy88ndtAKpIhI2Pi7-NAlNGCdg5WNQ6BXkxInQ56g5uGpIFkbsgScwrbPm5BDfFNeWm2gmJjs07LJQXJc12TqXzi6AkloaZS8_tixS3_YvQ9"
    }
  });

  await prisma.doctorClinic.create({
    data: { userId: user.id, clinicId: clinic1.id, shift: 'Mon-Wed | 08:00 - 16:00', status: 'Active' }
  });
  await prisma.doctorClinic.create({
    data: { userId: user.id, clinicId: clinic2.id, shift: 'Thu | 09:00 - 18:00', status: 'Active' }
  });
  await prisma.doctorClinic.create({
    data: { userId: user.id, clinicId: clinic3.id, shift: 'Fri | On-Call', status: 'Consultant Only' }
  });

  await prisma.scheduleModification.create({
    data: { clinicId: clinic1.id, type: 'Shift Extension', description: 'Extended Monday shift by 2 hours', date: new Date('2023-10-24'), status: 'Approved' }
  });
  await prisma.scheduleModification.create({
    data: { clinicId: clinic2.id, type: 'Emergency Block', description: 'Emergency block added (Surgery)', date: new Date('2023-10-22'), status: 'Approved' }
  });
  await prisma.scheduleModification.create({
    data: { clinicId: clinic3.id, type: 'Shift Trade', description: 'Shift trade request with Dr. Aris', date: new Date('2023-10-20'), status: 'Pending' }
  });

  const patient = await prisma.patient.create({
    data: {
      name: 'Rafid Ahmed',
      age: 28,
      gender: 'Male',
      weight: '72kg',
      bp: '120-80',
    }
  });

  const prescription = await prisma.prescription.create({
    data: {
      patientId: patient.id,
      doctorId: user.id,
      clinicId: clinic1.id,
      diagnosis: 'Bronchitis',
      chiefComplaints: 'Chronic dry cough for 2 weeks\nSlight fever in evening\nBody ache and fatigue',
      clinicalHistory: 'Patient has a history of seasonal allergies. Non-smoker. No previous major surgeries recorded.',
      doctorNotes: 'Avoid cold drinks and dust. Take plenty of warm fluids and rest. Please review after 7 days or earlier if condition worsens.',
      issuedAt: new Date('2026-05-17'),
    }
  });

  await prisma.medicine.createMany({
    data: [
      { prescriptionId: prescription.id, name: "Ace 500mg", dosage: "1+0+1", duration: "5 Days", instruction: "After meal" },
      { prescriptionId: prescription.id, name: "Napa Extend", dosage: "1+1+1", duration: "3 Days", instruction: "When needed" },
      { prescriptionId: prescription.id, name: "Fexo 120mg", dosage: "0+0+1", duration: "10 Days", instruction: "Before sleep" },
      { prescriptionId: prescription.id, name: "Monas 10mg", dosage: "0+0+1", duration: "1 Month", instruction: "Empty stomach" },
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
