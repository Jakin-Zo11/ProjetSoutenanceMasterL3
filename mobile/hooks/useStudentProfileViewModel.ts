/**
 * ViewModel — Profil étudiant : consultation et édition.
 *
 * Extrait de StudentProfileScreen.tsx : état édition (email, telephone),
 * save/cancel, appel updateStudentProfile, confirmation déconnexion.
 *
 * (MVVM — ViewModel, consommé par StudentProfileScreen)
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { updateStudentProfile, logoutStudent } from '../services/studentApi';
import type { StudentProfile } from '../types/etudiant';

// ─── Helpers purs (pas de React, testables unitairement) ─────────────────────

/** Initiales depuis le nom complet — ex: "RAKOTO Jean" → "RJ" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Traduit le statut backend en libellé affichable */
export function formatStatus(status: string): string {
  return status === 'actif' ? 'Actif' : 'Inactif';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudentProfileViewModel(
  student: StudentProfile,
  onExit: () => void,
) {
  const [email,       setEmail]       = useState(student.email);
  const [telephone,   setTelephone]   = useState(student.telephone);
  const [isEditing,   setIsEditing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initials = getInitials(student.name);
  const statusLabel = formatStatus(student.status);

  // ── Édition ────────────────────────────────────────────────────────────────

  const handleEdit = useCallback(() => {
    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEmail(student.email);
    setTelephone(student.telephone);
    setSaveError('');
    setIsEditing(false);
  }, [student.email, student.telephone]);

  const handleSave = useCallback(async () => {
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await updateStudentProfile({ email, telephone });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Impossible de sauvegarder. Vérifiez votre connexion.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [email, telephone]);

  // ── Déconnexion ────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => { logoutStudent(); onExit(); },
        },
      ],
    );
  }, [onExit]);

  return {
    // données dérivées
    initials,
    statusLabel,
    // champs éditables
    email,       setEmail,
    telephone,   setTelephone,
    // état du mode édition
    isEditing,
    isSaving,
    saveError,
    saveSuccess,
    // handlers
    handleEdit,
    handleCancel,
    handleSave,
    handleLogout,
  };
}
