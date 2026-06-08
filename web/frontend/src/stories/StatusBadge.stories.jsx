import React from 'react';
import StatusBadge from '../components/StatusBadge';

export default {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  argTypes: {
    demoStep: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  },
};

const Template = (args) => <StatusBadge {...args} />;

export const NewRequest = Template.bind({});
NewRequest.args = {
  demoStep: 1,
};

export const Accepted = Template.bind({});
Accepted.args = {
  demoStep: 2,
};

export const AssignedStaff = Template.bind({});
AssignedStaff.args = {
  demoStep: 3,
};

export const CollectorArrived = Template.bind({});
CollectorArrived.args = {
  demoStep: 4,
};

export const SampleCollected = Template.bind({});
SampleCollected.args = {
  demoStep: 5,
};

export const DeliveredToLab = Template.bind({});
DeliveredToLab.args = {
  demoStep: 6,
};

export const Processing = Template.bind({});
Processing.args = {
  demoStep: 7,
};

export const ReadyForReport = Template.bind({});
ReadyForReport.args = {
  demoStep: 8,
};

export const Completed = Template.bind({});
Completed.args = {
  demoStep: 9,
};

export const Cancelled = Template.bind({});
Cancelled.args = {
  demoStep: 0,
};
