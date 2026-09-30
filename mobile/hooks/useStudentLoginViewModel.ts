/**
 * ViewModel — Connexion étudiant par matricule.
 *
 * Extrait de StudentLoginScreen.tsx : validation du format XXXIXX,
 * mapping StudentApiData → StudentProfile, appel à loginWithMatricule().
 *
 * (MVVM — ViewModel, consommé par StudentLoginScreen)
 */

import { useCallback, useState } from 'react';
import { loginWithMatricule, type StudentApiData } from '../services/studentApi';
import type { StudentProfile } from '../types/etudiant';

// ─── Validation ───────────────────────────────────────────────────────────────

export const MATRICULE_REGEX = /^\d{3}I\d{2}$/;

/**
 * Mappe les données brutes du backend vers le type StudentProfile de l'app.
 * Le matricule est toujours conservé en string — jamais Number().
 */
export function mapApiDataToProfile(data: StudentApiData): StudentProfile {
  return {
    id:         data.id,
    matricule:  String(data.matricule),
    name:       data.name,
    email:      data.email       ?? '',
    telephone:  data.telephone   ?? '',
    formation:  data.formation   ?? '',
    promotion:  data.promotion   ?? '',
    status:     data.status      ?? 'actif',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudentLoginViewModel(
  onSuccess: (profile: StudentProfile) => void,
) {
  const [matricule,     setMatricule]     = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [errorMessage,  setErrorMessage]  = useState('');
  const [touched,       setTouched]       = useState(false);

  const isValid   = MATRICULE_REGEX.test(matricule);
  const showError = touched && matricule.length > 0 && !isValid;

  const handleChangeText = useCallback((text: string) => {
    setMatricule(text.toUpperCase().slice(0, 6));
    if (errorMessage) setErrorMessage('');
  }, [errorMessage]);

  const handleBlur = useCallback(() => setTouched(true), []);

  const handleLogin = useCallback(async () => {
    setTouched(true);
    if (!isValid) {
      setErrorMessage('Le matricule doit être au format 001I24.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await loginWithMatricule(matricule);
      onSuccess(mapApiDataToProfile(response.student));
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de se connecter. Vérifiez votre connexion.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isValid, matricule, onSuccess]);

  return {
    matricule,
    isLoading,
    errorMessage,
    isValid,
    showError,
    handleChangeText,
    handleBlur,
    handleLogin,
  };
}
