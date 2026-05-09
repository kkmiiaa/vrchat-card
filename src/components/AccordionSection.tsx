'use client';

import { useState, ReactNode } from 'react';

export default function AccordionSection({
  title,
  children,
  defaultOpen = false,
  t,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  t: any;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden bg-white">
      <button
        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-gray-800 tracking-wide">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
