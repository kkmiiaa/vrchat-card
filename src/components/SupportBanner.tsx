'use client';

type Props = {
  t: {
    support: string;
    supportButton: string;
    supportLink: string;
  };
};

export default function SupportBanner({ t }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 mb-3 rounded-xl bg-gray-50 border border-gray-200">
      <p className="text-xs text-gray-500 leading-snug">{t.support}</p>
      <a
        href={t.supportLink}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs font-medium text-gray-700 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
      >
        {t.supportButton}
      </a>
    </div>
  );
}
