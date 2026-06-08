import React from 'react';
import SampleCollectionRow from '../components/SampleCollectionRow';

export default {
  title: 'Components/SampleCollectionRow',
  component: SampleCollectionRow,
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-50">
        <table className="w-full border-collapse border border-outline-variant bg-white rounded-xl overflow-hidden shadow-sm">
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
};

const Template = (args) => <SampleCollectionRow {...args} />;

const mockOrder = {
  id: 1004,
  patient_name: 'Sultana Razia',
  patient_phone: '+880 1913 789123',
  patient_photo: '/assets/8b050976103bda6b4905d66fb1351961.png',
  test_names: ['Fasting Blood Sugar (FBS)', 'Urine Routine Examination'],
  home_collection: true,
  collection_address: 'House 12/A, Road 2, Banani, Dhaka',
  collection_slot: '07:30 AM - 09:30 AM',
  created_at: new Date().toISOString(),
  demo_step: 3,
  assigned_staff: 'Kamal Hossain',
};

export const Unassigned = Template.bind({});
Unassigned.args = {
  order: {
    ...mockOrder,
    demo_step: 2,
    assigned_staff: null,
  },
  avatar: '/assets/8b050976103bda6b4905d66fb1351961.png',
};

export const Assigned = Template.bind({});
Assigned.args = {
  order: mockOrder,
  avatar: '/assets/8b050976103bda6b4905d66fb1351961.png',
};

export const SampleCollected = Template.bind({});
SampleCollected.args = {
  order: {
    ...mockOrder,
    demo_step: 5,
  },
  avatar: '/assets/8b050976103bda6b4905d66fb1351961.png',
};
