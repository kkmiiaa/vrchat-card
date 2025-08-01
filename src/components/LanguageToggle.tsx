// components/LanguageToggle.tsx
'use client';

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
      className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
    >
      {language === 'ja' ? 'EN' : 'JA'}
    </button>
  );
}
