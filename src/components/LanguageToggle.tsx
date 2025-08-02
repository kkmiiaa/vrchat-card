// components/LanguageToggle.tsx
'use client';

import { GlobeAltIcon } from '@heroicons/react/24/outline';

type Props = {
  language: 'ja' | 'en';
  setSystemLanguage: (language: 'ja' | 'en') => void;
};

export default function LanguageToggle({ language, setSystemLanguage }: Props) {
  const toggleLanguage = () => {
    setSystemLanguage(language === 'ja' ? 'en' : 'ja');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
    >
      <GlobeAltIcon className="h-5 w-5" />
      {language === 'ja' ? 'English' : '日本語'}
    </button>
  );
}
