'use client';

import { useEffect, useState } from 'react';

export default function OnboardingBanner({ t }: { t: any }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('onboardingDismissed');
    if (!stored) setDismissed(false);
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="font-semibold text-sm text-gray-900 mb-2">{t.howToMakeCard}</p>
          <ol className="space-y-1.5">
            {[t.step1, t.step2, t.step3].map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <button
          onClick={() => {
            localStorage.setItem('onboardingDismissed', 'true');
            setDismissed(true);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0"
          aria-label={t.close}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
