# Workflow Métier Compleat

## Flux Global du Projet

Le workflow du projet suit l'ordre logique suivant :

```
Planning
    ↓
Convocation (Étudiant + Jury)
    ↓
Soutenance
    ↓
Évaluation individuelle Jury (note globale /20)
    ↓
Délibération
    ↓
Résultat final
```

Pour chaque étape, les détails sont :

### 1. Planning des soutenances

- **Acteur principal** : Backend (administration), Mobile (planification)
- **Données utilisées** : Calendrier académique, disponibilité des salles, disponibilité des jurys
- **Données produites** : Dates des soutenances, créneaux horaires, affectation des jurys
- **Module concerné** : Planification backend, gestion des créneaux
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Fournit les dates et créneaux nécessaires à la création des soutenances
  - ✅ Fournit les informations de salle nécessaires aux convocations
  - ⚠️ Partielle : Les informations de planning doivent être cohérentes avec lesaffectations jury

### 2. Convocation Étudiant + Jury

- **Acteur principal** : Backend (routes convocation), Mobile (étudiant et jury)
- **Données utilisées** : Dates, heures, salles, thèmes, informations étudiant/jury
- **Données produites** : Informations de convocation (matricule, coordonnées, détails soutenance)
- **Module concerné** : Routes `/v1/student` et `/api/v1/auth`, écrans convocation
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Dépend totalement du Planning (dates, salles) et de la Soutenance (détails)
  - ✅ Forte : Les convocations étudiant et jury sont indépendantes mais utilisent les mêmes données de base
  - ⚠️ Partielle : L'affectation formelle jury ↔ soutenance n'existe pas encore dans les modèles

### 3. Soutenance

- **Acteur principal** : Backend (modèle Soutenance, administration), Mobile (jury consultation, étudiant suivi)
- **Données utilisées** : Informations étudiant, thème, date, heure, salle, jury affectés
- **Données produites** : Enregistrement complet d'une soutenance, statut, jurys affectés
- **Module concerné** : Modèle Soutenance, relations avec Depot, SessionSoutenance, Room
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Dépend du Planning (date, heure, salle) et de la Convocation (étudiant/jury à convier)
  - ✅ Forte : Les évaluations jury dépendent des soutenances créées
  - ⚠️ Partielle : L'affectation des jurys aux soutenances est implicite via Evaluation.jury_user_id

### 4. Évaluation individuelle Jury (note globale /20)

- **Acteur principal** : Jury (mobile), Backend (DefenseEvaluationController)
- **Données utilisées** : ID soutenance, identité jury (via authentification Sanctum)
- **Données produites** : Enregistrement d'une évaluation avec note globale sur 20, commentaire optionnel, statut draft
- **Module concerné** : Mobile Jury (JuryHomeScreen), API `/api/v1/evaluations`, contrôleur DefenseEvaluationController
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Dépend de la Soutenance (soutenance_id doit être valide) et de l'Authentification (jury_user_id via token)
  - ✅ Forte : Les notes produites sont la base de la Délibération
  - ⚠️ Partielle : Vérification que le jury ne peut noter que ses soutenances affectées (non formelle dans les modèles)
  - ⚠️ Partielle : Le champ `note_generale` (mobile/API) vs `note_finale` (modèle) doit rester cohérent

**Règles impératives pour cette étape :**
- ⛔ Le Jury ne doit **pas** utiliser de grille d'évaluation ni de critères
- ⛔ Chaque Jury saisit directement une note globale sur 20 seulement
- ⛔ Les notes individuelles sont poiutilisées pour la Délibération
- ⛔ Ne pas réintroduire evaluation_grids, evaluation_criteria ou une saisie par critère

### 5. Délibération

- **Acteur principal** : Administration (admin/sénat), Backend (validateDeliberation)
- **Données utilisées** : Toutes les notes des jurys pour une soutenance, décision finale, mention optionnelle, commentaire
- **Données produites** : Status `validated` sur les évaluations, décision finale, mention, date de validation
- **Module concerné** : Backend `DefenseEvaluationController@validateDeliberation`, interfaces admin
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Dépend totalement de l'étape Note Jury (toutes les notes doivent exister)
  - ✅ Forte : Dépend du Résultat final (produit la décision officielle)
  - ⚠️ Partielle : La vérification du rôle admin n'est pas formelle au-delà de `requireJury`

### 6. Résultat final

- **Acteur principal** : Backend, Frontend (affichage)
- **Données utilisées** : Décision finale (Admis/Ajourné), mention le cas échéant, commentaire de délibération, date de validation
- **Données produites** : Résultat officiel affiché, documentation du processus
- **Module concerné** : Modèle Evaluation (champs décision/mention), affichage Web et Mobile
- **Dépendances vers les autres tâches** :
  - ✅ Forte : Dépend totalement de la Délibération (toutes les notes validées)
  - ✅ Forte : Produit le résultat officiel du processus de soutenance
  - ⚠️ Aucune : C'est l'étape terminale, aucune dépendance suivante

## Règles transverses du workflow

1. **Pas de grille/critères** : Le flux Jury ne comprend jamais de création de grille ni de critères de notation
2. **Note globale /20** : Chaque jury saisit une note sur 20 pour sa soutenance
3. **Plusieurs jurys** : Plusieurs jurys peuvent noter la même soutenance avec des notes indépendantes
4. **Délibération distincte** : La délibération est une étape distincte de la saisie individuelle des notes
5. **Pas de validation par le jury** : Un jury simple ne doit pas pouvoir valider la délibération finale (réservé admin/sénat)
6. **Cohérence des identifiants** : `soutenance_id` doit toujours correspondre à un `id` valide en table `soutenances`; `jury_user_id` doit correspondre à l'utilisateur connecté