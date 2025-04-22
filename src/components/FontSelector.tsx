'use client';

type FontOption = {
  label: string;
  value: string;
};

const fontOptions: FontOption[] = [
  { label: 'Rounded M+', value: '"Rounded Mplus 1c", sans-serif' },
  { label: 'Kosugi Maru', value: '"Kosugi Maru", sans-serif' },
  { label: 'Zen Maru Gothic', value: '"Zen Maru Gothic", sans-serif' },
  { label: 'うずらフォント', value: 'Uzura' },
  { label: 'kawaii手書き文字', value: 'kawaii手書き' },
  { label: 'マルミーニャM', value: 'マルミーニャM' },
];

export default function FontSelector({
    fontFamily,
    setFontFamily,
  }: {
    fontFamily: string;
    setFontFamily: (val: string) => void;
  }) {
    return (
    <div className="flex flex-col gap-4 pt-2 pb-2">
      <h2 className="text-lg font-bold">フォントの設定</h2>
        <div className="flex flex-wrap gap-2">
          {fontOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFontFamily(opt.value)}
              className={`px-4 py-2 rounded border text-sm transition
                ${fontFamily === opt.value
                  ? 'border-blue-600 bg-blue-100 text-blue-800'
                  : 'border-gray-300 bg-white hover:bg-gray-50'}
              `}
              style={{ fontFamily: opt.value }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
