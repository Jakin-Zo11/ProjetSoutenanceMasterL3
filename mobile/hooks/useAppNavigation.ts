/**
 * ViewModel — Navigation globale de l'application.
 *
 * Extrait de App.tsx : gère la pile d'écrans, navigateTo, goBack
 * et l'interception du bouton retour matériel Android.
 *
 * (MVVM — ViewModel partagé, consommé par App.tsx)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';

// ─── Type union de tous les écrans ────────────────────────────────────────────

export type MobileScreen =
  | 'select'
  | 'student-access'
  | 'student-theme'
  | 'student'
  | 'student-defense'
  | 'student-convocation'
  | 'student-thesis'
  | 'student-result'
  | 'student-pv'
  | 'student-notifications'
  | 'student-profile'
  | 'jury-login'
  | 'jury'
  | 'jury-defense'
  | 'jury-history'
  | 'jury-students'
  | 'jury-evaluation'
  | 'jury-confirmation'
  | 'jury-profile';

const JURY_SCREENS: MobileScreen[] = [
  'jury',
  'jury-defense',
  'jury-history',
  'jury-students',
  'jury-evaluation',
  'jury-confirmation',
  'jury-profile',
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppNavigation(initial: MobileScreen = 'select') {
  const [screen, setScreen]               = useState<MobileScreen>(initial);
  const [screenHistory, setScreenHistory] = useState<MobileScreen[]>([]);
  const lastJuryBackPress                 = useRef(0);

  // ── navigateTo : push sur la pile ─────────────────────────────────────────
  const navigateTo = useCallback((next: MobileScreen) => {
    setScreenHistory((h) => [...h, screen]);
    setScreen(next);
  }, [screen]);

  // ── goBack : pop depuis la pile ───────────────────────────────────────────
  const goBack = useCallback(() => {
    setScreenHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setScreen(previous);
      return h.slice(0, -1);
    });
  }, []);

  // ── resetTo : remise à zéro de la pile sur un écran racine ───────────────
  const resetTo = useCallback((target: MobileScreen) => {
    setScreenHistory([]);
    setScreen(target);
  }, []);

  // ── Bouton retour Android ─────────────────────────────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const isJury = JURY_SCREENS.includes(screen);

      if (!isJury) {
        if (screenHistory.length === 0) return false;
        goBack();
        return true;
      }

      if (screenHistory.length > 0) {
        goBack();
        return true;
      }

      const now = Date.now();
      if (now - lastJuryBackPress.current < 2000) return false;
      lastJuryBackPress.current = now;

      if (Platform.OS === 'android') {
        ToastAndroid.show('Appuyez encore pour quitter', ToastAndroid.SHORT);
      }
      return true;
    });

    return () => sub.remove();
  }, [screen, screenHistory, goBack]);

  return { screen, screenHistory, navigateTo, goBack, resetTo, setScreen };
}
