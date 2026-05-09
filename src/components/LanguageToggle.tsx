'use client';

type Props = {
  language: 'ja' | 'en';
  setSystemLanguage: (language: 'ja' | 'en') => void;
};

export default function LanguageToggle({ language, setSystemLanguage }: Props) {
  return (
    <button
      onClick={() => setSystemLanguage(language === 'ja' ? 'en' : 'ja')}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
    >
      {language === 'ja' ? 'EN' : 'JA'}
    </button>
  );
}
