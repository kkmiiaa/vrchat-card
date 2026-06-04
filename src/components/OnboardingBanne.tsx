'use client';

type Props = {
  t: {
    howToMakeCard: string
    step1: string
    step2: string
    step3: string
  }
  /** テンプレート固有のステップ（設定されている場合はデフォルトより優先） */
  howToSteps?: string[]
}

export default function OnboardingBanner({ t, howToSteps }: Props) {
  const steps = howToSteps ?? [t.step1, t.step2, t.step3]
  return (
    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-xl p-4 mb-3">
      <p className="font-semibold text-sm text-gray-900 mb-2">{t.howToMakeCard}</p>
      <ol className="space-y-1.5">
        {steps.map((step: string, i: number) => (
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
