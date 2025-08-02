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
    <div className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 bg-gray-100 font-semibold text-sm hover:bg-gray-200 flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 py-3 bg-white">{children}</div>}
    </div>
  );
}
