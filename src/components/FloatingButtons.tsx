'use client';

import { useState } from 'react';

type Props = {
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
  t: {
    save: string;
    share: string;
  };
};

export default function FloatingButtons({ onSave, onShare, onDownload, t }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sm:hidden fixed bottom-6 right-4 flex flex-col items-end gap-2 z-50">
      {/* 展開時のボタン群 */}
      <div
        className="flex flex-col items-end gap-2 overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? 200 : 0, opacity: expanded ? 1 : 0 }}
      >
        <button
          onClick={onDownload}
          className="tap-spring flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-full px-4 py-2.5 shadow-md hover:bg-gray-50 text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t.save}
        </button>
        <button
          onClick={onShare}
          className="tap-spring flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 border border-sky-100 rounded-full px-4 py-2.5 shadow-md shadow-sky-100 hover:border-sky-200 hover:bg-sky-50 text-sm font-semibold"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {t.share}
        </button>
        <button
          onClick={onSave}
          className="tap-spring flex items-center gap-2 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white rounded-full px-4 py-2.5 shadow-lg shadow-sky-200 hover:opacity-90 text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          マイページに保存
        </button>
      </div>
      {/* トグルボタン */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white shadow-lg shadow-sky-200 flex items-center justify-center transition-transform duration-300"
        style={{ transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
