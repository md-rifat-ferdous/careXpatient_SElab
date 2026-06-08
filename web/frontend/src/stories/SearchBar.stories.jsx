import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

export default {
  title: 'Components/SearchBar',
  component: SearchBar,
};

const Template = (args) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <div className="p-6 bg-slate-50 max-w-md">
      <SearchBar {...args} value={value} onChange={setValue} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search by ID or Patient Name...',
};

export const WithFilterButton = Template.bind({});
WithFilterButton.args = {
  placeholder: 'Search patient details...',
  onFilterClick: () => alert('Filter clicked!'),
};
