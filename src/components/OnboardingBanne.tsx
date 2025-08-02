// components/OnboardingBanner.tsx
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
    <div className="fixed bottom-6 left-6 bg-white text-gray-800 shadow-lg rounded-xl p-4 z-50 max-w-sm border">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-bold mb-1">{t.howToMakeCard}</p>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
          </ol>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-500 hover:text-gray-800 text-sm"
          aria-label={t.close}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
