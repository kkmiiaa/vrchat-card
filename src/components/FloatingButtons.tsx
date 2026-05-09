'use client';

type Props = {
  onSave: () => void;
  onShare: () => void;
  onUpgrade?: () => void;
  t: {
    save: string;
    share: string;
  };
};

export default function FloatingButtons({ onSave, onShare, t }: Props) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <button
        onClick={onShare}
        className="flex items-center gap-2 bg-black text-white rounded-xl px-4 py-2.5 shadow-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {t.share}
      </button>
      <button
        onClick={onSave}
        className="flex items-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t.save}
      </button>
    </div>
  );
}
