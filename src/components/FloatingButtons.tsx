// components/FloatingButtons.tsx
'use client';

type Props = {
  onSave: () => void;
  onShare: () => void;
  t: {
    save: string;
    share: string;
  };
};

export default function FloatingButtons({ onSave, onShare, t }: Props) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        onClick={onSave}
        className="bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 transition"
      >
        {t.save}
      </button>
      <button
        onClick={onShare}
        className="bg-black text-white rounded-full px-5 py-3 shadow-lg hover:bg-sky-600 transition"
      >
        {t.share}
      </button>
    </div>
  );
}
