# Périmètre de ma Tâche - Documentation d'Intégration

> Ce document fait référence au dossier commun `docs/project-integration/`.
> Avant toute modification, consulter impérativement :
> 1. README.md 2. workflow.md 3. dependencies.md 4. api-contracts.md
> 5. mobile-web-integration.md 6. task-contracts.md 7. current-state.md
> 8. Inspector le code réel correspondant.

---

## 1. Périmètre de ma tâche

Mon périmètre couvre 4 modules interdépendants :

### A. CRÉNEAUX / PLANNING

**Responsabilité :**
- Gestion des créneaux horaires
- Affichage des créneaux
- Liaison avec les soutenances lorsque cette liaison existe réellement dans le code
- Récupération des informations nécessaires au Jury et à l'Étudiant

**Fichiers potentiellement concernés :**
- `backend/app/Models/Creneau.php`
- `backend/app/Models/SessionSoutenance.php`
- `backend/app/Http/Controllers/Api/CreneauController.php`
- Routes API réellement utilisées pour les créneaux
- Fichiers frontend liés à Créneaux si nécessaire
- Fichiers mobile uniquement si nécessaire pour afficher les données réelles

**IMPORTANT :**
Ne pas inventer de relation ou de colonne qui n'existe pas réellement dans le code.
La relation Créneau ↔ Soutenance doit vérifiée dans les modèles existants, pas supposée.

---

### B. ÉVALUATION / NOTE JURY

**Responsabilité :**
- Nouveau flux : NOTE GLOBALE /20 par jury
- Ne PAS réintroduire :
  - Grille d'évaluation
  - Critères
  - Saisie par critère
  - DefenseEvaluation comme nouveau système
  - Table jury_soutenance sans décision explicite du groupe

**Modèle utilisé :**
`backend/app/Models/Evaluation.php` avec :
- `soutenance_id`
- `jury_user_id`
- `note_finale`
- `status`
- `remarques`

**Incohérence à documenter (ne pas corriger automatiquement) :**
- `note_finale` (modèle Laravel Evaluation)
- `note_generale` (API mobile / interface Jury)
- Ces deux champs représentent la même chose : la note globale sur 20 saisie par le jury
- **Action** : Documenter les deux noms, privilégier `note_generale` dans le flux mobile/API

---

### C. JURY MOBILE

**Ce que le Jury doit pouvoir faire :**
1. Se connecter
2. Être authentifié par Sanctum
3. Récupérer ses informations
4. Voir les soutenances qui lui sont destinées selon le mécanisme actuellement implémenté
5. Voir pour chaque soutenance :
   - Étudiant
   - Thème
   - Date
   - Heure
   - Salle
6. Saisir une note globale /20
7. Enregistrer/modifier cette note
8. Participer ensuite au flux de délibération selon les API existantes

**Fichiers actuellement concernés :**
- `mobile/components/jury/JuryLoginScreen.tsx`
- `mobile/components/jury/JuryHomeScreen.tsx`
- `mobile/services/api.ts`
- `mobile/services/evaluationApi.ts`

**À vérifier dans le projet :**
- Noms réels des composants et services
- Format des données retournées par `GET /api/v1/evaluations/assigned`
- Mécanisme d'affectation jury → supported (implique via Evaluation.jury_user_id)

---

### D. ÉTUDIANT MOBILE

**Situation :**
- L'interface graphique existe déjà
- Ne pas refaire l'interface inutilement

**Travail consistant à identifier :**
- Comment elle doit recevoir les données backend réelles concernant :
  - Profil étudiant
  - Soutenance
  - Date
  - Heure
  - Salle
  - Thème
  - Convocation
  - Statut du dépôt lorsque disponible

**Fichiers potentiellement concernés :**
- `mobile/components/student/StudentHomeScreen.tsx`
- `mobile/services/studentService.ts`
- Autres fichiers student réellement présents

**IMPORTANT :**
- Ne pas modifier `StudentLoginScreen.tsx` sauf nécessité technique clairement démontrée
- L'objectif est l'intégration de données réelles, pas le redesign de l'interface

---

## 2. Workflow global

```
Planning / Créneaux
    ↓
Convocation Étudiant + Jury
    ↓
Soutenance
    ↓
Évaluation / Note Jury (note globale /20)
    ↓
Délibération
    ↓
Résultat final
```

**Règles impératives :**
- ⛔ Aucun grille, aucun critère, aucune saisie par critère
- ⛔ Note globale /20 par jury uniquement
- ⛔ Les notes individuelles sont utilisées pour la Délibération
- ⛔ Ne pas réintroduire evaluation_grids, evaluation_criteria, evaluation_scores

---

## 3. Mes responsabilités

| Domaine | Responsabilités précises |
|---------|------------------------|
| **Créneaux/Planning** | Vérifier la liaison créneau↔supported dans les modèles. Récupérer les infos créneaux pour affichage Jury/Étudiant. Ne créer aucune nouvelle relation qui n'existe pas. |
| **Évaluation/Note Jury** | S'assurer que la saisie note utilise le flux `note_generale` (mobile/API) vers le modèle `note_finale`. Vérifier que les notes sont stockées avec `soutenance_id` + `jury_user_id`. Ne pas réintroduire de grille/critère. Documenter l'incohérence nommage. |
| **Jury Mobile** | Vérifier que l'écran d'accueil affiche les supported assignées jury. S'assurer de l'affichage étudiant, thème, date, heure, salle. Vérifier la saisie et l'enregistrement note globale /20 via `POST /api/v1/evaluations`. |
| **Étudiant Mobile** | Identifier comment l'écran existant reçoit les données réelles : profil, soutenance, convocation, dépôt. Appeler les API `/api/v1/student.*` à la place des mock/demo. Afficher les informations soutenance/convocation sans refaire l'interface. |

---

## 4. Dépendances amont (ce dont je dépends)

| Dépendance | Source | Importance | État | Conséquence si non résolu |
|------------|--------|------------|------|--------------------------|
| **Modèle Evaluation** | Tâche Évaluation/Note | ⛔ Forte | ✅ DONE (modèle existant) | Sans `soutenance_id` + `jury_user_id`, impossible de lier notes |
| **Planning → Créneaux** | Tâche Planning | ⚠️ Forte | ⚠️ PARTIAL | Si créneaux non associés à supported, affichage incomplet |
| **Authentification Sanctum** | Tâche Authentification | ⛔ Forte | ✅ DONE | Jury/Étudiant ne peuvent pas se connecter |
| **Rôles User (jury/etudiant)** | Tâche Authentification | ⛔ Forte | ✅ DONE | Contrôle d'accès impossible |
| **Convocation données** | Tâche Convocation | ⚠️ Moyenne | ⚠️ PARTIAL | Affichage étudiant incomplet sans données convocation |
| **Base de données peuplée** | Infrastructure | ⛔ Forte | ⚠️ PARTIAL | Aucun données à afficher sans jeu de test |

**Blocages possibles en amont :**
- Si Planning n'a pas associé les supported aux créneaux, mon affichage sera incomplet
- Si Authentification n'a pas configuré les rôles, connexion impossible
- Si les données de test ne sont pas en base, je travaille en mode MOCK

---

## 5. Dépendances aval (ce qui dépend de mon travail)

| Dépendance | Destination | Importance | État |
|------------|-------------|------------|------|
| **Note Jury → Délibération** | Tâche Délibération | ⛔ Forte | Sans mes notes (jury + étudiant), pas de délibération possible |
| **Note Jury → Résultat Final** | Tâche Résultat Final | ⛔ Forte | Sans notes collectées, pas de résultat officiel |
| **Jury Mobile → Note Jury** | Tâche Évaluation/Note | ⛔ Forte | Ma saisie note globale est l'entrée principale du système |
| **Étudiant Mobile → Convocation** | Tâche Convocation | ⚠️ Moyenne | Mes données affichées alerte les convocations étudiante |
| **Planning → Délibération** (via supported) | Tâche Délibération | ⚠️ Faible | Mes créneaux planifiés influencent l'organisation de la dél |

**Risque si je ne livre pas à temps :**
- Blocage de la Délibération (aucune note à traiter)
- Blocage du Résultat Final (aucune décision officielle possible)
- Confusion jury sur ses supported assignées

---

## 6. Données reçues

### A. Données que je RECEVE (depuis les autres tâches / backend)

| Donnée | Source | Format | Utilisation dans mon périmètre |
|--------|--------|--------|--------------------------------|
| `soutenance_id` | Base de données `soutenances.id` | Entier | Lier créneau, affichage jury, saisie note |
| `jury_user_id` | Base de données `users.id` | Entier | Authentification jury, vérification droits |
| `student_id` / matricule | Base de données `users` | Chaîne | Afficher profil étudiant, convocation |
| `creneau_id` / référence | Base de données `creneaux.id` | Entier | Lier créneau ↔ supported, affichage planning |
| `date` / `heure` / `salle` | Base de données `soutenances` | Chaîne/Date | Affichage détails supported jury/étudiant |
| `theme` / `sujet` | Base de données `soutenances.themeTitle` | Chaîne | Afficher thème supported |
| `status` évaluation | Base de données `evaluations.status` | Chaîne (draft/validated) | Savoir si note enregistrée ou validée |
| `token` Sanctum | Authentification | Chaîne d'auth | Connexion jury mobile & étudiant mobile |
| `rôle` user | Base de données `users.roles` | Chaîne [jury/etudiant/admin] | Contrôle d'accès interfaces mobiles |
| `note_generale` | API mobile / Evaluation modèle | Entier (0-20) | Note globale saisie par jury (champ API) |
| `note_finale` | Modèle Evaluation | Entier (0-20) | Note globale modèle base (diffère de note_generale) |

---

## 7. Données fournies

### A. Données que je FOURNIS (aux autres tâches / interfaces)

| Donnée | Vers quelle tâche | Format | Importance |
|--------|------------------|--------|------------|
| **Infos créneaux affichés** | Tâche Délibération / Convocation | `id`, `reference`, `heure_debut`, `heure_fin`, `supported_id` | Forte - enable planification dél |
| **Notes Jury saisies** | Tâche Délibération, Interface Jury | `soutenance_id`, `jury_user_id`, `note_generale` (0-20), `commentaire`, `status` | ⛔ Critique - input délibération |
| **Affichage supported jury** | Tâche Convocation, Tâche Délibération | Tableau `soutenance_id`, `student_name`, `theme`, `date`, `heure`, `salle`, `note_generale` | Forte - input délibération + convocation |
| **Profil étudiant jour** | Tâche Convocation Étudiant | Profil + supported + statut dépôt | Moyenne - info étudiant |
| **Liste supported affectées** | Tâche Délibération | Tableau complet supported avec notes le cas échéant | Forte - input délibération |

---

## 8. API utilisées

### A. API Backend que j'utilise

| API | Méthode | URL | Usage dans mon périmètre |
|-----|---------|-----|------------------------|
| `Creneau index` | GET | `/api/creneaux` | Récupérer liste des créneaux planifiés |
| `Creneau show` | GET | `/api/creneaux/{id}` | Détails d'un créneau spécifique |
| `Soutenance index` | GET | `/api/soutenances` | Liste toutes les supported |
| `Soutenance show` | GET | `/api/soutenances/{id}` | Détails supported (étudiant, thème, date, etc.) |
| `Évaluations assigned` | GET | `/api/v1/evaluations/assigned` | Listes supported assignées jury (vérification) |
| `Auth login (jury)` | POST | `/api/v1/auth.login` | Connexion interface jury mobile |
| `Auth me` | GET | `/api/v1/auth.me` | Vérifier rôle jury connecté |
| `Student login` | POST | `/api/v1/student.login` | Connexion interface étudiante |
| `Student profile` | GET | `/api/v1/student.profile` | Récupérer profil étudiant + supported |

### B. API Mobile que j'utilise

| API | Méthode | URL | Usage |
|-----|---------|-----|-------|
| `ListAssignedEvaluations` (mobile) | GET | via `evaluationApi.ts` | Afficher supported jury avec notes existantes |
| `SaisieNote` | POST | `/api/v1/evaluations` | Enregistrer note globale /20 jury |
| `ModificationNote` | PUT | `/api/v1/evaluations/{id}` | Modifier note existante jury |
| `Etudiant.login` | POST | `/api/v1/student.login` | Connexion étudiante mobile |

**Points d'attention API :**
- `GET /api/v1/evaluations/assigned` retourne `note_generale` (champ API)
- `POST /api/v1/evaluations` accepte `note_generale` (payload)
- Le modèle stocké est `note_finale` - veillez à la cohérence

---

## 9. Modèles et tables concernés

| Modèle/Table | Champs Clés | Usage dans mon périmètre |
|--------------|-------------|-------------------------|
| **Creneau** | `id`, `reference`, `heure_debut`, `heure_fin`, `jours`, `type`, `capacite`, `actif` | Lier ↔ supported, affichage planning |
| **SessionSoutenance** | `id`, `libelle`, `date_debut`, `date_fin` | Contexte temporel supported |
| **Soutenance** | `id`, `depot_id`, `session_soutenance_id`, `room_id`, `date`, `status`, `remarques` | Point central - lier créneau, jury, étudiant |
| **Evaluation** (racine `app/Models/Evaluation.php`) | `id`, `soutenance_id`, `jury_user_id`, `note_finale`/`note_generale`, `status`, `commentaire` | **Coeur** - recevoir note jury /20 |
| **User** (app/Models/User.php) | `id`, `name`, `email`, `roles` [jury/etudiant/admin] | Authentification, contrôle accès jury/étudiant |
| **Creneau** (app/Models/Creneau.php) | `reference`, `heure_debut`, `heure_fin`, `type`, `capacite` | Lier supported, affichage planning |
| **Room** (app/Models/Room.php) | `id`, `numéro_salle` | Afficher salle supported jury/étudiant |
| **Depot** | `id`, `nom_structure` | Lier dépôt manuscrit ↔ supported |

**⚠️ Incohérence majeure :**
- `note_finale` (champ modèle Evaluation) ≠ `note_generale` (champ API mobile/interface)
- Les deux = note globale sur 20
- **Action** : Documenter les deux, mais utiliser `note_generale` dans le flux mobile/Jury

---

## 10. Fichiers que je PEUX modifier

### A. Fichiers documentation (obligatoire à consulter avant toute modif)

| Fichier | Pourquoi |
|---------|----------|
| `docs/project-integration/README.md` | Règles absolues du projet |
| `docs/project-integration/workflow.md` | Workflow confirmé |
| `docs/project-integration/dependencies.md` | Dépendances amont/aval |
| `docs/project-integration/api-contracts.md` | Contrats API |
| `docs/project-integration/entities.md` | Entités réelles |
| `docs/project-integration/mobile-web-integration.md` | Intégration mobile/web |
| `docs/project-integration/task-contracts.md` | Contrats tâches groupe |
| `docs/project-integration/current-state.md` | État actuel |

### B. Fichiers Backend (modifications légères, coordination requise)

| Fichier | Modifications autorisées |
|---------|-------------------------|
| `backend/app/Http/Controllers/Api/CreneauController.php` | ✅ Ajouter méthodes, modifier logique liaison supported/créneau |
| `backend/routes/api.php` | ✅ Ajouter/Modifier routes relatifs à mes endpoints (creneaux, supported, auth partielle) |
| `backend/app/Models/Creneau.php` | ✅ Ajouter des scopes, modifier des accès, ajouter des attributs accessors |
| `backend/app/Models/SessionSoutenance.php` | ✅ Métiers légers, ajouter des relations |
| `backend/app/Models/Soutenance.php` | ⚠️ **Avec précaution seulement** : champs liés à mon périmètre (affichage, status). Pas de modification de relations `evaluations()` ni de champs `soutenance_id`/`jury_user_id` |
| `backend/app/Models/Evaluation.php` | ⚠️ **Uniquement** : aider à standardiser `note_generale` vs `note_finale`. Pas de modification de structure FK ni de relations. |
| `backend/app/Modules/Evaluation/Http/Controllers/DefenseEvaluationController.php` | ⚠️ **Uniquement** : ajouter méthode de récupération pour mon interface, ne pas modifier `store`/`updateNote`/`validateDeliberation` existants |

### C. Fichiers Mobile que je peux modifier

| Fichier | Modifications autorisées |
|---------|-------------------------|
| `mobile/services/evaluationApi.ts` | ✅ Modifier les appels API, ajouter des méthodes de récupération pour mon affichage |
| `mobile/components/jury/JuryHomeScreen.tsx` | ✅ Modifier l'interface d'accueil jury, ajouter affichage notes, corriguer affichage supported |
| `mobile/components/jury/JuryLoginScreen.tsx` | ✅ Modifier flux connexion, ajouter vérification rôles |
| `mobile/services/api.ts` | ✅ Ajouter des helpers d'auth, modifier configurations base URL |
| `mobile/components/student/StudentHomeScreen.tsx` | ✅ **Mon domaine principal** : intégrer donnéesBackend réelles (supported, convocation, dépôt) |
| `mobile/services/studentService.ts` | ✅ **Mon domaine principal** : appeler les API `/api/v1/student.*`, formater les données pour affichage |
| `mobile/constants/` | ✅ Mettre à jour les URLs, les rôles statiques, les messages d'erreur |

---

## 11. Fichiers sensibles / INTERDITS

| Fichier | Motif |
|---------|-------|
| `backend/app/Modules/Evaluation/Models/EvaluationGrid.php` | Ancien système grille/critères - ne surtout pas réintroduire |
| `backend/app/Modules/Evaluation/Models/EvaluationCriterion.php` | Ancien système grille/critères - ne surtout pas réintroduire |
| `backend/app/Modules/Evaluation/Models/EvaluationScore.php` | Ancien système grille/critères - ne surtout pas réintroduire |
| `backend/app/Modules/Evaluation/Models/DefenseEvaluation.php` | Ancien système - `defense_id` sans lien vers `Soutenance.id`, laisser en lecture seule |
| `backend/routes/api.php` (toutes les routes admin) | Ne modifier aucune route admin sans coordination globale |
| `backend/app/Http/Controllers/Api/Auth/AuthController.php` | Ne pas modifier système d'authentification global |
| `mobile/components/student/StudentLoginScreen.tsx` | Interface existante - uniquement intégrer données, ne pas refaire |
| Tout fichier de migration ou schéma base de données | Règle absolue : pas de migration |
| Aucun fichier en dehors de mon périmètre clairement défini | Principe de non-modification |

**Règle absolue :** Ne jamais modifier de fichier applicatif sans avoir au préalable :
1. Consulté tous les docs `docs/project-integration/`
2. Vérifié le code réel correspondant
3. Compris l'impact sur les autres tâches

---

## 11. État actuel DONE/PARTIAL/BLOCKED/TODO

### A. Ce qui est DONE (dans mon périmètre)

| Domaine | Ce qui fonctionne |
|---------|------------------|
| **Modèle Evaluation** | ✅ `soutenance_id` + `jury_user_id` présents |
| **API Jury** | ✅ `POST /api/v1/evaluations` création note fonctionne |
| **API Étudiant** | ✅ `student.login` + `student.profile` fonctionnelles |
| **Authentification Jury** | ✅ `auth.login` avec `scolarite@emit.mg` / `password123` fonctionne |
| **Authentification Étudiant** | ✅ `student.login` fonctionne |
| **Affichage supported jury** | ✅ `GET /evaluations/assigned` affiche supported + notes le cas échéant |
| **Saisie note Jury** | ✅ Note globale /20 saisie et enregistrée en base |
| **Créneaux backend** | ✅ Modèles `Creneau` + `SessionSoutenance` présents |
| **Routes API** | ✅ `api/creneaux`, `api/soutenances` fonctionnelles |

### B. Ce qui est PARTIAL (doit être fait dans mon périmètre)

| Domaine | Ce qui manque / doit être fait |
|---------|--------------------------------|
| **Liaison Créneau ↔ Supported** | ⚠️ Vérifier que chaque créneau a `supported_id` valide ou liaison explicite |
| **Affichage détails Jury** | ⚠️ S'assurer que `étudiant`, `thème`, `date`, `heure`, `salle` s'affichent tous |
| **Incohérence note_generale/note_finale** | ⚠️ Documenter les deux noms, décider du standard à utiliser |
| **Intégration Étudiant réelle** | ⚠️ Remplacer les `demoDefenses`/mock par API `/api/v1/student.*` |
| **Vérification jury_user_id** | ⚠️ S'assurer que le jury ne voit que ses supported assignées |
| **Affichage convocation étudiant** | ⚠️ Identifier comment recevoir données soutenance/convocation en temps réel |

### C. Ce qui est BLOCKED (dépend d'autres tâches / infrastructure)

| Domaine | Blocage |
|---------|---------|
| **Serveur Laravel local** | ❌ Nécessite `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 expo start` |
| **Base de données peuplée** | ❌ Données de test nécessaires pour valider les affichages |
| **Standardisation nom note** | ❌ Décision du groupe entier à prendre (voir incohérence note_finale/note_generale) |
| **Création table jury_soutenance** | ❌ Interdite sans décision explicite du groupe |

### D. Ce qui est TODO (dans mon périmètre, ordre recommandé)

| Priorité | Tâche | Description | Effort estimé |
|----------|-------|-------------|---------------|
| **1** | Intégrer APIStudent réelles en interface Étudiant | Remplacer les mock/demo par API `/api/v1/student.*` + supported/convocation | 1-2 jours |
| **2** | Corriger affichage détails Jury | S'assurer que `étudiant`, `thème`, `date`, `heure`, `salle` s'affichent tous | 1-2 jours |
| **3** | Standardiser `note_generale` dans l'interface Jury | Décider du nom à utiliser et appliquer dans `JuryHomeScreen.tsx` + `evaluationApi.ts` | 1 journée |
| **4** | Vérifier liaison Créneau ↔ Supported | S'assurer que le `supported_id` est bien peuplé ou ajouter la structure | 1 journée |
| **5** | Tester authentification complète | Lancer Expo avec serveur Laravel, se connecter jury + étudiant, vérifier affichage | dépend infrastructure |
| **6** | Renforcer vérification `jury_user_id` | Sécuriser que le jury ne voit que ses supported assignées (optionnel mais recommandé) | 0.5 journée |

---

## 12. Risques d'intégration

| Risque | Probauté | Impact | Atténuation |
|--------|----------|--------|-------------|
| **Incohérence note_finale/note_generale** | ⛔ Certain | Confusion développeur, données incohérentes | Documenter les deux, décider standard groupe |
| **Affectation jury ↔ supported non formelle** | ⛔ Certain | Jury peut noter n'importe quelle supported | Renforcer vérification dans l'affichage |
| **Créneaux non associés supported** | ⚠️ Possible | Affichage incomplete planning | Vérifier modèle Creneau + supported |
| **Authentification échouée** | ⚠️ Possible | Jury/Étudiant ne se connectent pas | Vérifier tokens Sanctum, rôles User |
| **Ancien système grille réintroduit par erreur** | ⛔ Certain | Rupture flux Jury note globale /20 | Vérifier tous les nouveaux code n'ajoute pas de grille/critère |
| **Dépendance Planning non résolue** | ⚠️ Possible | Créneaux affichés incomplets | Vérifier avec équipe Planning |

---

## 13. Points nécessitant coordination avec les autres développeurs

| Point | À discuter avec | Pourquoi |
|-------|----------------|----------|
| **Standardisation `note_generale` vs `note_finale`** | Équipe entière | Décision architecturale impactant tout le projet |
| **Liaison formelle jury ↔ supported** | Équipe Planning + Équipe Évaluation | Déterminer si nouvelle table ou utilisation Evaluation existante |
| **Renforcer vérification `jury_user_id`** | Équipe Évaluation/Note | Décider si vérification obligatoire dans toutes les routes |
| **Données de test base de données** | Infrastructure / Équipe DevOps | Peupler base avec soutenances, créneaux, jurys, étudiants réels |
| **Fallback demoDefenses** | Équipe Qualité | Décider si fallback doit être maintenu ou retiré pour tests réels |
| **Ordres des API dans l'affichage Jury** | Équipe UI/UX | S'assurer que l'ordre d'affichage (étudiant, thème, date, heure, salle) est cohérent |

---

## 14. Ordre recommandé de travail

**JOUR 1 :** 
- [ ] Lancer serveur Laravel + `expo start` avec `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
- [ ] Se connecter en jury (`scolarite@emit.mg` / `password123`) → vérifier affichage supported
- [ ] Se connecter en étudiant → vérifier profil + supported
- [ ] Identifier les données manquantes dans l'affichage Jury (étudiant, thème, date, heure, salle)

**JOUR 2 :**
- [ ] Corriger `mobile/services/studentService.ts` pour appeler API réelles au lieu de mock
- [ ] Remplacer `demoDefenses` par données `GET /api/soutenances/{id}` dans interface Étudiant
- [ ] Afficher soutenance, thème, date, heure, salle dans les deux interfaces (Jury + Étudiant)

**JOUR 3 :**
- [ ] Décider standard `note_generale` vs `note_finale` (documenter choix)
- [ ] Appliquer choix dans `JuryHomeScreen.tsx` et `evaluationApi.ts`
- [ ] Vérifier liaison Créneau ↔ Supported dans modèle/backend

**JOUR 3-4 :**
- [ ] Tester flux complet : Connexion → Supported → Note → Enregistrement
- [ ] Vérifier que plusieurs jurys peuvent noter la même supported indépendamment
- [ ] Noter les éventuelles incohérences restantes

**JOUR 4-5 :**
- [ ] Réditer rapport final état avancé dans `current-state.md`
- [ ] Mettre à jour `docs/project-integration/` si contrats changent
- [ ] Préparer passage relais si nécessaire

---

## 15. Règles absolues à respecter

1. **Lire docs/project-integration/README.md** avant toute modification
2. **Ne jamais réintroduire grille/critères** dans aucun flux Jury
3. **Ne jamais créer de table jury_soutenance** sans décision explicite du groupe
4. **Ne jamais modifier de migration** ni structure base de données
5. **Utiliser `note_generale`** de façon cohérente dans le flux mobile/API (documenter `note_finale` aussi)
6. **Vérifier dans le code réel** avant de déduire l'existence de toute relation/colonne/API
7. **Consulter impérativement** tous les fichiers `docs/project-integration/` avant de modifier quoique ce soit
8. **Ne pas casser le workflow** : Planning → Convocation → Supported → Note Jury → Délibération → Résultat final
9. **Aucun commit, push ou changement de branche** pendant cette étape d'audit
10. **Aucune modification de code applicatif** en dehors de la documentation

---

## Contrat avec les autres tâches

Cette section explique clairement les interactions entre mon module et les autres :

### Planning → Créneaux → Supported

**Ce que j'attends :**
- Créneaux avec `supported_id` associé ou possibilité de créer la liaison
- Informations de base (date, heure, salle) pour affichage

**Ce que je fournis :**
- Récupération des infos créneaux via `GET /api/creneaux`
- Affichage planification Jury/Étudiant

**Ce qui peut bloquer :**
- Si Planning n'a pas associé de `supported_id` aux créneaux, mon affichage sera incomplet
- Dépendance forte envers l'équipe Planning

---

### Supported → Convocation

**Ce que j'attends :**
- `supported_id` valide pour lier la convocation
- Informations étudiant (matricule, nom) et supported (thème, date, heure, salle)

**Ce que je fournis :**
- Interface Jury/Étudiant affichant les supported avec leurs détails
- Notes jury saisies (pour la convocation post-soutenance)

**Ce qui peut bloquer :**
- Si les données supported en base sont incomplètes (manque thème/date/heure)
- Dépendance forte envers les données base peuplées

---

### Supported → Note Jury

**Ce que j'attends :**
- `supported_id` existant et associé à un jury valide
- `jury_user_id` correspondant à l'utilisateur connecté
- Possibilité de saisir `note_generale` (0-20)

**Ce que je fournis :**
- Saisie note globale /20 via interface Jury mobile
- Enregistrement `POST /api/v1/evaluations` avec `soutenance_id` + `jury_user_id` + `note_generale`
- Plusieurs jurys peuvent noter la même supported indépendamment

**Ce qui peut bloquer :**
- Si `jury_user_id` ne correspond pas à l'utilisateur connecté → accès non autorisé
- Si `soutenance_id` invalide → échec enregistrement
- Incohérence `note_generale` vs `note_finale` → confusion dans l'API et la base

---

### Note Jury → Délibération

**Ce que j'attends :**
- Toutes les notes jury collectées avec `status = draft`
- Cohérence des `soutenance_id` pour la même soutenance
- Décision finale en attente de la délibération

**Ce que je fournis :**
- Les notes individuelles stockées en base
- Données nécessaires au calcul de la décision finale

**Ce qui peut bloquer :**
- Si une seule note manque, la Délibération ne peut pas commencer
- Si les notes ne sont pas en `status = draft`, la Délibération peut échouer

---

### Note → Résultat Final

**Ce que j'attends :**
- Délibération terminée avec décisions et mentions
- Toutes les notes validées (`status = validated`)
- Date de validation enregistrée

**Ce que je fournis :**
- Historique des notes et décisions
- Données remontant au résultat final

**Ce qui peut bloquer :**
- Sans délibération, pas de résultat final possible
- Dépendance totale vis-à-vis de l'équipe Délibération

---

### Remerciements / Remarque finale

Ce document de périmètre a été créé en se basant exclusivement sur :
- L'analyse des 8 fichiers existants dans `docs/project-integration/`
- La vérification dans le code réel du projet
- Le workflow confirmé et les règles absolues du projet

**Aucune modification de code applicatif, de migration ni de base de données n'a été effectuée** lors de la création de cette documentation.

La prochaine étape est de commencer le travail d'intégration réelle en suivant l'ordre recommandé du Jour 1 ci-dessus, en commençant par tester les authentifications et les affichages avec un serveur Laravel actif.