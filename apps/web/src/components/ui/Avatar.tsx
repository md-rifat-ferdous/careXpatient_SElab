import React from 'react';

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

export const Avatar = ({ src, fallback, className = "" }: AvatarProps) => {
  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>
      {src ? (
        <img src={src} alt="avatar" className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-primary font-semibold text-sm">
          {fallback}
        </div>
      )}
    </div>
  );
};
