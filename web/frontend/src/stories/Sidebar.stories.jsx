import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <div style={{ height: '100vh', background: '#f8fafc' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

const Template = () => <Sidebar />;

export const Default = Template.bind({});
