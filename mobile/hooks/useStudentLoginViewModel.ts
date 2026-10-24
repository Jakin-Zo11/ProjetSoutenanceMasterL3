/**
 * ViewModel — Connexion étudiant par matricule.
 * Utilise exclusivement les données retournées par l'API Laravel.
 */

import { useCallback, useState } from 'react';
import {
  loginWithMatricule,
  type StudentApiData,
} from '../services/studentApi';
import type { StudentProfile } from '../types/etudiant';

export const MATRICULE_REGEX = /^\d{3}I\d{2}$/;

export function mapApiDataToProfile(data: StudentApiData): StudentProfile {
  return {
    id: data.id,
    matricule: String(data.matricule),
    name: data.name,
    email: data.email ?? '',
    telephone: data.telephone ?? '',
    formation: data.formation ?? '',
    promotion: data.promotion ?? '',
    status: data.status ?? 'actif',
    themeTitle: data.themeTitle ?? undefined,
    company: data.company ?? undefined,
  };
}

export function useStudentLoginViewModel(
  onSuccess: (profile: StudentProfile) => void,
) {
  const [matricule, setMatricule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = MATRICULE_REGEX.test(matricule);
  const showError = touched && matricule.length > 0 && !isValid;

  const handleChangeText = useCallback((text: string) => {
    setMatricule(text.trim().toUpperCase().slice(0, 6));
    setErrorMessage('');
  }, []);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const handleLogin = useCallback(async () => {
    setTouched(true);

    if (!isValid) {
      setErrorMessage('Format incorrect. Exemple : 001I26');
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
          : 'Connexion impossible. Vérifiez le serveur et réessayez.',
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
    isDemoMode: false,
    handleChangeText,
    handleBlur,
    handleLogin,
  };
}