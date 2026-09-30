/**
 * ViewModel — Soumission du thème de mémoire.
 *
 * Extrait de StudentThemeScreen.tsx : état du champ texte,
 * validation (non vide), handler de soumission.
 *
 * (MVVM — ViewModel, consommé par StudentThemeScreen)
 */

import { useCallback, useState } from 'react';

export function useStudentThemeViewModel(
  onSubmit: (theme: string) => void,
) {
  const [theme, setTheme] = useState('');

  const isValid = theme.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const trimmed = theme.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }, [theme, onSubmit]);

  return { theme, setTheme, isValid, handleSubmit };
}
