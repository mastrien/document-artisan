import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS, UILanguage } from './translations';

interface LanguageContextValue {
  lang: UILanguage;
  setLang: (lang: UILanguage) => void;
  t: (typeof TRANSLATIONS)[UILanguage];
}

const STORAGE_KEY = 'document-artisan:lang';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<UILanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch {
      // ignore storage errors
    }
    return 'pt';
  });

  const setLang = (next: UILanguage) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] as (typeof TRANSLATIONS)[UILanguage] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
