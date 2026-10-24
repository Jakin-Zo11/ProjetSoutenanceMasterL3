# Matrice des Dépendances entre Tâches

Ce document décrit les dépendances entre les différentes tâches du projet. Chaque dépendance est classée par force et par type.

## Légende des symboles

- **↓** : Dépendance forte (sans cette donnée, la tâche ne peut pas fonctionner)
- **↔** : Dépendance faible (la tâche peut fonctionner mais avec des limitations)
- **⚠️** : Blocage ou risque identifié
- **↔ Partagé** : Donnée partagée entre tâches

## Matrice de dépendances

### Planning ↓ Soutenance

- **Type** : Dépendance forte
- **Donnée échangée** : Dates des soutenances, créneaux horaires, affectation des jurys, disponibilité des salles
- **Module concerné** : `backend/routes/api.php` (routes planning), `backend/app/Models/Soutenance.php`, `backend/app/Models/Creneau.php`
- **État actuel** : ✅ Connecté
- **Problème éventuel** : Aucun identifié majeur
- **Impact sur les tâches aval** :
  - Sans planning, pas de soutenances créables
  - Sans soutenances, pas de convocations possibles
  - Sans soutenances, pas d'évaluations jury possibles

### Convocation ↓ Étudiant

- **Type** : Dépendance forte
- **Donnée échangée** : Identifiant étudiant (matricule), informations de convocation, détails de la soutenance (date, heure, salle)
- **Module concerné** : `mobile/components/student/`, `backend/routes/api.php` (routes `/v1/student`), `mobile/services/studentService.ts`
- **État actuel** : ✅ Connecté
- **Problème éventuel** : Aucun identifié majeur
- **Impact sur les tâches aval** :
  - Sans convocation, l'étudiant ne sait pas quand/où se présenter
  - Le dépôt de manuscrit est lié à la convocation étudiant

### Convocation ↓ Jury

- **Type** : Dépendance forte ↓↔ Partielle
- **Donnée échangée** : Informations jury (rôles, affectation), liste des jurys affectés, liste des soutenances disponibles
- **Module concerné** : `mobile/components/jury/`, `backend/routes/api.php` (routes auth, evaluation), `DefenseEvaluationController@assigned`
- **État actuel** : ⚠️ Partiellement connecté
- **Problème éventuel** ⚠️ :
  - L'affectation jury ↔ soutenance n'est pas formelle dans les modèles
  - Un jury peut techniquement noter n'importe quelle soutenance via `Evaluation.jury_user_id`
  - La convocation jury dépend de l'étape Planning → Soutenance
- **Impact sur les tâches aval** :
  - Sans convocation jury, le jury ne sait pas quelles soutenances lui sont destinées
  - Risque que le jury note n'importe quelle soutenance plutôt que les siennes

### Soutenance ↓ Évaluation (Jury)

- **Type** : Dépendance forte
- **Donnée échangée** : `soutenance_id` valide, identité jury (`jury_user_id`)
- **Module concerné** : `backend/app/Models/Soutenance.php`, `backend/app/Models/Evaluation.php`, `DefenseEvaluationController@store`, `@updateNote`
- **État actuel** : ✅ Connecté
- **Problème éventuel** : Aucun identifié majeur (mais voir incohérence `note_finale`/`note_generale`)
- **Impact sur les tâches aval** :
  - Sans soutenance, pas d'évaluation possible
  - Les évaluations sont la base de la Délibération
  - Résultat final dépend de la totalité des évaluations

### Évaluation (Jury) ↓ Délibération

- **Type** : Dépendance forte
- **Donnée échangée** : Toutes les notes des jurys pour une soutenance, statut de chaque évaluation
- **Module concerné** : `DefenseEvaluationController@validateDeliberation`, `mobile/components/jury/`
- **État actuel** : ⚠️ Connecté en partie
- **Problème éventuel** ⚠️ :
  - La méthode `validateDeliberation` ne vérifie pas formellement le rôle admin au-delà de `requireJury`
  - Il faut s'assurer que toutes les notes existent avant de pouvoir délibérer
- **Impact sur les tâches aval** :
  - Sans toutes les notes, pas de délibération possible
  - Sans délibération, pas de résultat final

### Délibération ↓ Résultat Final

- **Type** : Dépendance forte
- **Donnée échangée** : Décision finale (Admis/Ajourné), mention le cas échéant, commentaire de délibération, date de validation
- **Module concerné** : `DefenseEvaluationController@validateDeliberation`, affichage Web/Mobile
- **État actuel** : ✅ Connecté
- **Problème éventuel** : Aucun identifié majeur
- **Impact sur les tâches aval** :
  - C'est l'étape terminale, aucune tâche ne dépend du résultat final
  - Le résultat final officialise le processus de soutenance

### Jury ↓ Note

- **Type** : Dépendance forte
- **Donnée échangée** : Note globale sur 20, commentaire optionnel, `soutenance_id`, `jury_user_id`
- **Module concerné** : `mobile/services/evaluationApi.ts`, `DefenseEvaluationController@store/@updateNote`, `mobile/components/jury/JuryHomeScreen.tsx`
- **État actuel** : ✅ Connecté
- **Problème éventuel** ⚠️ :
  - Vérification que `jury_user_id` correspond bien au jury connecté
  - Vérification que `soutenance_id` correspond à une soutenance affectée à ce jury
  - Incohérence `note_generale` (mobile) vs `note_finale` (modèle)

### Note ↓ Délibération

- **Type** : Dépendance forte
- **Donnée échangée** : Toutes les notes individuelles collectées pour chaque soutenance
- **Module concerné** : `DefenseEvaluationController`, interfaces d'édition
- **État actuel** : ✅ Connecté
- **Problème éventuel** : Aucun identifié majeur (à condition que les vérifications d'affectation soient renforcées)

##Résumé des dépendances critiques

| Dépendance | Force | Statut | Action requise |
|------------|-------|--------|----------------|
| Planning → Soutenance | Forte | ✅ Connecté | Maintenir cohérence dates/créneaux |
| Convocation → Jury | Forte ↓↔ Partielle | ⚠️ Attention | Renforcer affectation formelle |
| Soutenance → Évaluation | Forte | ✅ Connecté | Vérifier `soutenance_id` cohérent |
| Évaluation → Délibération | Forte | ⚠️ Attention | Vérifier toutes les notes existantes |
| Délibération → Résultat Final | Forte | ✅ Connecté | S'assurer décisions documentées |
| Jury → Note | Forte | ⚠️ Attention | Renforcer vérification `jury_user_id` |

## Recommandations pour éviter les blocages

1. **Avant de commencer une tâche**, vérifier la section "Dépendances" dans ce document
2. **Toute modification d'une donnée partagée** (soutenance_id, jury_user_id, note_generale/note_finale) doit être vérifiée contre toutes les tâches en aval
3. **L'affectation jury ↔ soutenance** doit être renforcée formellement (même si implicite via Evaluation) pour éviter que les jurys ne notent n'importe quelle soutenance
4. **La cohérence `note_generale`/`note_finale`** doit être discutée avant toute modification d'API ou de modèle
5. **La Délibération ne doit jamais être déclenchée** sans vérifier que toutes les notes jury existent et ont un statut `draft`