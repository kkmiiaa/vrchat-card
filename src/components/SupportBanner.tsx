// components/SupportBanner.tsx
'use client';

type Props = {
  t: {
    support: string;
    supportButton: string;
  };
};

export default function SupportBanner({ t }: Props) {
  return (
    <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 p-4 rounded-lg shadow-md text-center my-4">
      <p className="font-bold text-gray-800">
        {t.support}
      </p>
      <a
        href="https://www.buymeacoffee.com/yota3d"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block bg-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition"
      >
        {t.supportButton}
      </a>
    </div>
  );
}
