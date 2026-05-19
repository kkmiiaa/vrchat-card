'use client';

export default function OnboardingBanner({ t }: { t: any }) {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-xl p-4 mb-3">
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
  );
}
