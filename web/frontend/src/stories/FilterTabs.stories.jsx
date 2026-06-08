import React, { useState } from 'react';
import FilterTabs from '../components/FilterTabs';

export default {
  title: 'Components/FilterTabs',
  component: FilterTabs,
};

const Template = (args) => {
  const [activeTab, setActiveTab] = useState(args.activeTab || 'All');
  return (
    <div className="p-6 bg-slate-50">
      <FilterTabs {...args} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const TestQueueTabs = Template.bind({});
TestQueueTabs.args = {
  tabs: ['All', 'New Requests', 'Accepted', 'Processing', 'Ready for Report', 'Completed'],
  activeTab: 'All',
  counts: {
    'New Requests': 4,
    Accepted: 2,
    Processing: 3,
    'Ready for Report': 1,
  },
};

export const SampleCollectionTabs = Template.bind({});
SampleCollectionTabs.args = {
  tabs: ['All', 'Home Collection', 'In-Lab', 'Pending', 'Collected', 'Urgent', 'Overdue'],
  activeTab: 'All',
  counts: {
    Pending: 6,
    Collected: 8,
    Urgent: 2,
    Overdue: 1,
  },
};
