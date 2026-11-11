'use client';

import { useCallback, useEffect, useState } from 'react';

export type Lang = 'en' | 'bn';

const LANG_KEY = 'nctb_lang';

/** App-wide UI language, persisted across home + all lessons. Defaults to English. */
export function useLang() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'bn') setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next: Lang = prev === 'bn' ? 'en' : 'bn';
      try {
        window.localStorage.setItem(LANG_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return { lang, toggleLang };
}
