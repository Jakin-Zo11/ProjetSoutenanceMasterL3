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
    themeTitle: data.themeTitle ?? undefined,
    company:    data.company    ?? undefined,
  };
}

/**
 * Données de démonstration locale en cas d'erreur réseau.
 */
const mockStudents: Record<string, StudentApiData> = {
  '001I26': {
    id: 1,
    matricule: '001I26',
    name: 'Jean Rakoto',
    email: 'jean.rakoto@emit.mg',
    telephone: '+261 34 00 000 01',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2025-2026',
    status: 'actif',
    promotion_id: 1,
    themeTitle: 'Optimisation des algorithmes de machine learning',
    company: 'EMIT',
  },
  '002I26': {
    id: 2,
    matricule: '002I26',
    name: 'Marie Randrianasolo',
    email: 'marie.randrianasolo@emit.mg',
    telephone: '+261 34 00 000 02',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2025-2026',
    status: 'actif',
    promotion_id: 1,
    themeTitle: 'Application mobile de gestion des stocks',
    company: 'Tech Solutions',
  },
  '003I26': {
    id: 3,
    matricule: '003I26',
    name: 'Paul Ravelonarivo',
    email: 'paul.ravelonarivo@emit.mg',
    telephone: '+261 34 00 000 03',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2025-2026',
    status: 'actif',
    promotion_id: 1,
    themeTitle: 'Analyse des données de trafic routier',
    company: 'City Planning',
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudentLoginViewModel(
  onSuccess: (profile: StudentProfile) => void,
) {
  const [matricule,     setMatricule]     = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [errorMessage,  setErrorMessage]  = useState('');
  const [touched,       setTouched]       = useState(false);
  const [isDemoMode,    setIsDemoMode]    = useState(false);

  const isValid   = MATRICULE_REGEX.test(matricule);
  const showError = touched && matricule.length > 0 && !isValid;

  const handleChangeText = useCallback((text: string) => {
    setMatricule(text.trim().toUpperCase().slice(0, 6));
    if (errorMessage) setErrorMessage('');
    setIsDemoMode(false);
  }, [errorMessage]);

  const handleBlur = useCallback(() => setTouched(true), []);

  const handleLogin = useCallback(async () => {
    setTouched(true);
    if (!isValid) {
      setErrorMessage('Format incorrect. Exemple : 001I26');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setIsDemoMode(false);

    try {
      // Tentative de connexion via l'API Laravel
      const response = await loginWithMatricule(matricule);
      onSuccess(mapApiDataToProfile(response.student));
    } catch (error: unknown) {
      // Vérification si c'est une erreur réseau (serveur injoignable)
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Network Error') || 
         error.message.includes('serveur ne répond pas') ||
         error.message.includes('Connexion impossible'));

      if (isNetworkError) {
        // Fallback vers le mode démo en cas d'erreur réseau
        setIsDemoMode(true);
        const mockStudent = mockStudents[matricule];
        
        if (mockStudent) {
          onSuccess(mapApiDataToProfile(mockStudent));
        } else {
          setErrorMessage('Mode démo : Matricule non trouvé. Essayez 001I26, 002I26 ou 003I26');
        }
      } else {
        // Erreur de validation ou autre erreur API
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de se connecter. Vérifiez votre connexion.',
        );
      }
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
    isDemoMode,
    handleChangeText,
    handleBlur,
    handleLogin,
  };
}
