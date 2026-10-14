/**
 * Local-only student service. This module deliberately performs no network I/O.
 */

const DEMO_STUDENTS = [
  {
    name: 'Jean Rakoto',
    email: 'jean.rakoto@emit.mg',
    telephone: '+261 34 00 000 01',
    formation: 'Master 2 Informatique de Gestion',
    promotion: 'Master 2 · 2026',
    themeTitle: 'Optimisation des algorithmes de machine learning pour la prédiction de la demande énergétique',
    company: 'JIRAMA',
  },
  {
    name: 'Marie Randrianasolo',
    email: 'marie.randrianasolo@emit.mg',
    telephone: '+261 34 00 000 02',
    formation: 'Master 2 Informatique de Gestion',
    promotion: 'Master 2 · 2026',
    themeTitle: 'Développement d’une application mobile de gestion des stocks pour les PME',
    company: 'Tech Mada',
  },
  {
    name: 'Paul Ravelonarivo',
    email: 'paul.ravelonarivo@emit.mg',
    telephone: '+261 34 00 000 03',
    formation: 'Master 2 Informatique de Gestion',
    promotion: 'Master 2 · 2026',
    themeTitle: 'Analyse des données de trafic routier pour l’optimisation urbaine',
    company: 'Commune Urbaine de Fianarantsoa',
  },
  {
    name: 'Fara Rasoa',
    email: 'fara.rasoa@emit.mg',
    telephone: '+261 34 00 000 04',
    formation: 'Master 2 Informatique de Gestion',
    promotion: 'Master 2 · 2026',
    themeTitle: 'Système de reconnaissance faciale pour le contrôle d’accès',
    company: 'EMIT Fianarantsoa',
  },
  {
    name: 'Luc Andriamanitra',
    email: 'luc.andriamanitra@emit.mg',
    telephone: '+261 34 00 000 05',
    formation: 'Master 2 Informatique de Gestion',
    promotion: 'Master 2 · 2026',
    themeTitle: 'Plateforme e-learning adaptative basée sur l’intelligence artificielle',
    company: 'Orange Madagascar',
  },
] as const;

export interface StudentApiData {
  id: number;
  /** Matricule toujours string — ex : "001I24" — jamais converti en nombre */
  matricule: string;
  /** Nom complet (la BDD n'a pas first_name / last_name séparés) */
  name: string;
  email: string;
  telephone: string;
  formation: string;
  promotion: string;
  status: string;
  promotion_id: number | null;
}

export interface StudentLoginResponse {
  success: boolean;
  message: string;
  token: string;
  student: StudentApiData;
}

export interface StudentProfileResponse {
  success: boolean;
  message?: string;
  student: StudentApiData;
}

let activeStudent: StudentApiData | null = null;
let localToken: string | null = null;

function createStudent(matricule: string): StudentApiData {
  const digits = matricule.match(/\d+/)?.[0] ?? '';
  const index = digits ? Math.max(0, Number(digits.slice(0, 3)) - 1) % DEMO_STUDENTS.length : 0;
  const sample = DEMO_STUDENTS[index];

  return {
    id: index + 1,
    matricule,
    ...sample,
    status: 'actif',
    promotion_id: 1,
  };
}

export async function loginWithMatricule(matricule: string): Promise<StudentLoginResponse> {
  const normalizedMatricule = matricule.trim().toUpperCase();
  if (!normalizedMatricule) throw new Error('Saisissez un matricule pour continuer.');

  activeStudent = createStudent(normalizedMatricule);
  localToken = `demo-student-${normalizedMatricule}`;
  return {
    success: true,
    message: 'Connexion de démonstration réussie.',
    token: localToken,
    student: { ...activeStudent },
  };
}

export async function getStudentProfile(): Promise<StudentProfileResponse> {
  if (!activeStudent || !localToken) {
    throw new Error('Aucune session étudiant locale n’est active.');
  }
  return { success: true, student: { ...activeStudent } };
}

export async function updateStudentProfile(
  data: Partial<Pick<StudentApiData, 'email' | 'telephone'>>,
): Promise<StudentProfileResponse> {
  if (!activeStudent || !localToken) {
    throw new Error('Aucune session étudiant locale n’est active.');
  }
  activeStudent = { ...activeStudent, ...data };
  return { success: true, student: { ...activeStudent } };
}

export function logoutStudent(): void {
  activeStudent = null;
  localToken = null;
}

/** Indique si un token étudiant est actif en mémoire. */
export function hasStudentSession(): boolean {
  return _studentToken !== null;
}
