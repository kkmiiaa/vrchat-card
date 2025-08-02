// components/SupportBanner.tsx
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
    <div className="bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] p-4 rounded-lg shadow-md text-center my-4">
      <p className="font-bold text-white">
        {t.support}
      </p>
      <a
        href={t.supportLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block bg-blue-700 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-800 transition"
      >
        {t.supportButton}
      </a>
    </div>
  );
}
