import React from 'react';

export const MathFrac: React.FC<{
  num: React.ReactNode;
  den: React.ReactNode;
  className?: string;
}> = ({ num, den, className = '' }) => (
  <span className={`inline-flex flex-col items-center align-middle mx-1 leading-tight ${className}`}>
    <span className="px-1.5 pb-0.5 border-b-2 border-current font-serif italic">{num}</span>
    <span className="px-1.5 pt-0.5 font-serif italic">{den}</span>
  </span>
);
