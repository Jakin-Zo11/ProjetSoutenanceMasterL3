/**
 * ViewModel — Session étudiant courante.
 *
 * Gère le profil connecté et les dépôts PDF locaux associés au matricule.
 *
 * (MVVM — ViewModel partagé, consommé par App.tsx et les écrans étudiant)
 */

import { useCallback, useState } from 'react';
import type { StudentProfile } from '../types/etudiant';

export interface StudentPdfSubmission {
  studentMatricule: string;
  name: string;
  uri: string;
  submittedAt: string;
}

export function useStudentSession() {
  const [student, setStudent]               = useState<StudentProfile | null>(null);
  const [pdfSubmissions, setPdfSubmissions] = useState<Record<string, StudentPdfSubmission>>({});
  const pdfSubmission = student ? pdfSubmissions[student.matricule] ?? null : null;

  const login = useCallback((profile: StudentProfile) => {
    setStudent(profile);
  }, []);

  const submitPdf = useCallback((submission: { name: string; uri: string }) => {
    if (!student) throw new Error('Une session étudiant est requise pour enregistrer le dépôt.');
    setPdfSubmissions((current) => ({
      ...current,
      [student.matricule]: {
        ...submission,
        studentMatricule: student.matricule,
        submittedAt: new Date().toISOString(),
      },
    }));
  }, [student]);

  const getPdfSubmission = useCallback((matricule: string) => pdfSubmissions[matricule] ?? null, [pdfSubmissions]);

  const logout = useCallback(() => {
    setStudent(null);
  }, []);

  return {
    student,
    pdfSubmission,
    login,
    submitPdf,
    getPdfSubmission,
    logout,
  };
}
