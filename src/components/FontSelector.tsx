'use client';

type FontOption = {
  label: string;
  value: string;
};

const fontOptions: FontOption[] = [
  { label: 'Rounded M+', value: '"Rounded Mplus 1c", sans-serif' },
  { label: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { label: 'Yomogi（手書き）', value: '"Yomogi", cursive' },
  { label: 'Zen Maru Gothic', value: '"Zen Maru Gothic", sans-serif' },
];

export default function FontSelector({
    fontFamily,
    setFontFamily,
  }: {
    fontFamily: string;
    setFontFamily: (val: string) => void;
  }) {
    return (
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">フォントを選択</p>
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
