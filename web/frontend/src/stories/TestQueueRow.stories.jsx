import React from 'react';
import TestQueueRow from '../components/TestQueueRow';

export default {
  title: 'Components/TestQueueRow',
  component: TestQueueRow,
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

const Template = (args) => <TestQueueRow {...args} />;

const mockOrder = {
  id: 1001,
  patient_name: 'Kazi Ashfaq',
  test_names: ['Complete Blood Count (CBC)', 'Hemoglobin A1c (HbA1c)'],
  home_collection: true,
  created_at: new Date().toISOString(),
  demo_step: 1,
  status: 'Requested',
};

export const NewRequest = Template.bind({});
NewRequest.args = {
  order: mockOrder,
};

export const InProcessing = Template.bind({});
InProcessing.args = {
  order: {
    ...mockOrder,
    demo_step: 7,
    status: 'Processing',
  },
};

export const ReadyForReport = Template.bind({});
ReadyForReport.args = {
  order: {
    ...mockOrder,
    demo_step: 8,
    status: 'Processing',
  },
};
