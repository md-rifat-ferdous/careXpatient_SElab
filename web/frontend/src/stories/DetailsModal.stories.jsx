import React from 'react';
import DetailsModal from '../components/DetailsModal';

export default {
  title: 'Components/DetailsModal',
  component: DetailsModal,
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#334155', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
};

const Template = (args) => <DetailsModal {...args} />;

const mockOrder = {
  id: 1001,
  patient_id: 1,
  lab_id: 1,
  status: 'Requested',
  demo_step: 1,
  assigned_staff: null,
  total_amount: '1365.00',
  home_collection: true,
  collection_address: 'House 45, Road 11, Sector 4, Uttara, Dhaka',
  collection_slot: '08:00 AM - 10:00 AM',
  created_at: new Date().toISOString(),
  home_collection_fee: '150.00',
  subtotal: '1150.00',
  vat: '65.00',
  patient_name: 'Kazi Ashfaq',
  patient_phone: '+880 1819 123456',
  patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
  test_names: ['Complete Blood Count (CBC)', 'Hemoglobin A1c (HbA1c)'],
  result_id: null,
  result_file_url: null,
  result_summary: null,
};

export const Step1NewRequest = Template.bind({});
Step1NewRequest.args = {
  order: mockOrder,
  onClose: () => alert('Closed modal'),
  onAdvance: (id, step) => alert(`Advancing order ${id} from step ${step}`),
  onAssignStaff: (id, staff) => alert(`Assigning staff ${staff} to order ${id}`),
};

export const Step2Accepted = Template.bind({});
Step2Accepted.args = {
  ...Step1NewRequest.args,
  order: {
    ...mockOrder,
    demo_step: 2,
    status: 'AcceptedByLab',
  },
};

export const Step3Assigned = Template.bind({});
Step3Assigned.args = {
  ...Step1NewRequest.args,
  order: {
    ...mockOrder,
    demo_step: 3,
    status: 'AcceptedByLab',
    assigned_staff: 'Kamal Hossain',
  },
};

export const Step9Completed = Template.bind({});
Step9Completed.args = {
  ...Step1NewRequest.args,
  order: {
    ...mockOrder,
    demo_step: 9,
    status: 'Reported',
    assigned_staff: 'Dr. S. Rahman',
    result_id: 2001,
    result_file_url: '/uploads/report-1001.pdf',
    result_summary: 'CBC results: Platelets stable at 150k. HbA1c: 5.7% (Normal). No abnormal findings.',
  },
};
