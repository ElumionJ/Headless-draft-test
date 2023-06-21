import {useEffect, useState} from 'react';

export function useLanguageText(type: any) {
  const [languageText, setLanguageText] = useState('');

  useEffect(() => {
    const currentURL = window.location.href;

    if (currentURL.includes('/ar-sa/')) {
      setLanguageText(<span>{type.ar_text}</span>);
    } else {
      setLanguageText(<span>{type.en_text}</span>);
    }
  }, [type.ar_text, type.en_text]);

  return languageText;
}
