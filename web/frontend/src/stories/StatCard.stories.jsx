import React from 'react';
import StatCard from '../components/StatCard';

export default {
  title: 'Components/StatCard',
  component: StatCard,
};

const Template = (args) => (
  <div className="max-w-xs p-4 bg-slate-50">
    <StatCard {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  icon: 'science',
  iconBg: 'bg-primary-container/10',
  iconColor: 'text-primary-container',
  label: 'Total Tests Done',
  value: '1,245',
  badge: '+12.5%',
  badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

export const Pending = Template.bind({});
Pending.args = {
  icon: 'pending_actions',
  iconBg: 'bg-amber-50',
  iconColor: 'text-amber-600',
  label: 'Pending Requests',
  value: '14',
  badge: 'Needs Action',
  badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
};

export const Revenue = Template.bind({});
Revenue.args = {
  icon: 'payments',
  iconBg: 'bg-teal-50',
  iconColor: 'text-teal-600',
  label: 'Total Revenue',
  value: '৳45,230',
  badge: 'Today',
  badgeColor: 'bg-teal-50 text-teal-700 border border-teal-100',
};
