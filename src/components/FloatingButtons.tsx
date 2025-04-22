// components/FloatingButtons.tsx
'use client';

export default function FloatingButtons({
  onSave,
  onShare,
}: {
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        onClick={onSave}
        className="bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 transition"
      >
        💾 保存
      </button>
      <button
        onClick={onShare}
        className="bg-black text-white rounded-full px-5 py-3 shadow-lg hover:bg-sky-600 transition"
      >
        Xでシェア
      </button>
    </div>
  );
}
