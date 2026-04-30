import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const Image: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    name: 'Dr. Jane Smith',
    size: 'lg',
  },
};

export const Large: Story = {
  args: {
    name: 'MD',
    size: 'xl',
  },
};
