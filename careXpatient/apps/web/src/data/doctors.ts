import { Doctor, TimeSlot } from '../types/doctor';

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    experienceYears: 12,
    fee: '120',
    rating: '4.9',
    reviewCount: 320,
    qualification: 'MBBS, MD (Cardiology), FCPS',
    about: 'Dr. Sarah Ahmed is a highly experienced cardiologist with over 12 years of practice in heart-related conditions.',
    user: {
      fullName: 'Dr. Sarah Ahmed',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d1',
      gender: 'Female',
    },
    specialties: [{ specialty: { id: 1, name: 'Cardiologist' } }],
  },
  {
    id: '2',
    experienceYears: 8,
    fee: '80',
    rating: '4.8',
    reviewCount: 512,
    qualification: 'MBBS, DCH, FCPS (Paediatrics)',
    about: 'Dr. Rahim Khan specialized in pediatrics and has been providing expert care to children for over 8 years.',
    user: {
      fullName: 'Dr. Rahim Khan',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d2',
      gender: 'Male',
    },
    specialties: [{ specialty: { id: 2, name: 'Pediatrician' } }],
  },
  {
    id: '3',
    experienceYears: 6,
    fee: '100',
    rating: '5.0',
    reviewCount: 198,
    qualification: 'MBBS, DDV, MD (Dermatology)',
    about: 'Dr. Anika Rahman is an expert dermatologist specialized in skin conditions and aesthetic treatments.',
    user: {
      fullName: 'Dr. Anika Rahman',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d3',
      gender: 'Female',
    },
    specialties: [{ specialty: { id: 3, name: 'Dermatologist' } }],
  },
  {
    id: '4',
    experienceYears: 15,
    fee: '150',
    rating: '4.7',
    reviewCount: 440,
    qualification: 'MBBS, MD (Neurology), PhD',
    about: 'Dr. S.M. Iqbal is a senior neurologist with extensive experience in treating brain and nervous system disorders.',
    user: {
      fullName: 'Dr. S.M. Iqbal',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d4',
      gender: 'Male',
    },
    specialties: [{ specialty: { id: 4, name: 'Neurologist' } }],
  },
  {
    id: '5',
    experienceYears: 10,
    fee: '110',
    rating: '4.9',
    reviewCount: 275,
    qualification: 'MBBS, FCPS (Obs & Gynae)',
    about: 'Dr. Maria Gomez is a dedicated gynecologist providing comprehensive care for women health.',
    user: {
      fullName: 'Dr. Maria Gomez',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d5',
      gender: 'Female',
    },
    specialties: [{ specialty: { id: 5, name: 'Gynecologist' } }],
  },
  {
    id: '6',
    experienceYears: 9,
    fee: '130',
    rating: '4.6',
    reviewCount: 189,
    qualification: 'MBBS, MS (Ortho), FCPS',
    about: 'Dr. Tanvir Hossain is an orthopedic surgeon specializing in joint replacements and sports injuries.',
    user: {
      fullName: 'Dr. Tanvir Hossain',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=d6',
      gender: 'Male',
    },
    specialties: [{ specialty: { id: 6, name: 'Orthopedic' } }],
  },
];

export const slots = (availability: boolean[]): TimeSlot[] => {
  const times = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];
  return times.map((t, i) => ({
    id: String(i),
    time: t,
    available: availability[i] ?? true
  }));
};
