"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tr from '@/locales/tr.json';
import en from '@/locales/en.json';

export type Language = 'tr' | 'en';

type Translations = typeof tr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const translations: Record<Language, Translations> = { tr, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Tarayıcıdan kayıtlı dili al
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Nested key erişimi için yardımcı fonksiyon: t('navbar.searchPlaceholder')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Bulunamazsa key'i döndür
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // SSR uyumluluğu için mount kontrolü
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ 
        language: 'tr', 
        setLanguage, 
        t: (key) => {
          const keys = key.split('.');
          let value: any = translations['tr'];
          for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
              value = value[k];
            } else {
              return key;
            }
          }
          return typeof value === 'string' ? value : key;
        },
        translations: translations['tr']
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      translations: translations[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Kısa kullanım için alias
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
};

