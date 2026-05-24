import React from 'react';
import { OverrideTimeline, TimelineItem } from './OverrideTimeline';

export type Override = {
  id: string;
  type: string;
  date: Date;
  clinicName: string;
  doctorName?: string;
  description?: string;
};

export const RightSidebarOverrides: React.FC<{
  overrides: Override[];
  onClose?: () => void;
}> = ({ overrides, onClose }) => {
  // Convert overrides to timeline items
  const items: TimelineItem[] = overrides.map((o) => ({
    id: o.id,
    type: o.type,
    date: o.date,
    clinicName: o.clinicName,
    doctorName: o.doctorName,
    description: o.description,
  }));

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-border shadow-lg overflow-y-auto lg:relative lg:w-full lg:border-0">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50">
        <h3 className="text-lg font-semibold text-foreground">Active Overrides</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-4">
        {items.length > 0 ? (
          <OverrideTimeline items={items} />
        ) : (
          <p className="text-sm text-gray-600">No overrides currently active.</p>
        )}
      </div>
      {/* Additional sections such as history can be added here if needed */}
    </div>
  );
};
