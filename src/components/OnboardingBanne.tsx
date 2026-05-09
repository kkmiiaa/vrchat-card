'use client';

import { useEffect, useState } from 'react';

export default function OnboardingBanner({ t }: { t: any }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('onboardingDismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('onboardingDismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 bg-white shadow-xl rounded-2xl p-5 z-50 max-w-xs border border-gray-100">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-sm text-gray-900 mb-2">{t.howToMakeCard}</p>
          <ol className="space-y-1">
            {[t.step1, t.step2, t.step3].map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
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
