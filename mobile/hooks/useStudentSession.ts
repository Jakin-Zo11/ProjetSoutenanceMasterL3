/**
 * ViewModel — Session étudiant courante.
 *
 * Extrait de App.tsx : gère le profil connecté, le thème soumis,
 * le timer de convocation et la réinitialisation de session.
 *
 * (MVVM — ViewModel partagé, consommé par App.tsx et les écrans étudiant)
 */

import { useCallback, useEffect, useState } from 'react';
import type { StudentProfile } from '../types/etudiant';

const CONVOCATION_DELAY_MS = 15_000;

export function useStudentSession() {
  const [student, setStudent]               = useState<StudentProfile | null>(null);
  const [themeSubmitted, setThemeSubmitted] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState('');
  const [convocationReady, setConvocationReady] = useState(false);

  // Déclenche le timer de convocation 15 s après la soumission du thème
  useEffect(() => {
    if (!themeSubmitted) return undefined;
    const timer = setTimeout(() => setConvocationReady(true), CONVOCATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [themeSubmitted]);

  const login = useCallback((profile: StudentProfile) => {
    setStudent(profile);
  }, []);

  const submitTheme = useCallback((theme: string) => {
    setSubmittedTheme(theme);
    setThemeSubmitted(true);
  }, []);

  const logout = useCallback(() => {
    setStudent(null);
    setThemeSubmitted(false);
    setSubmittedTheme('');
    setConvocationReady(false);
  }, []);

  return {
    student,
    themeSubmitted,
    submittedTheme,
    convocationReady,
    login,
    submitTheme,
    logout,
  };
}
