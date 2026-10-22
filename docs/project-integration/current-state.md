# État Réel du Projet - Documentation d'Intégration

État au 14 octobre 2026. Classification : DONE = fonction réellement implémentée | PARTIAL = interface ou logique partiellement fonctionnelle | MOCK = données fictives | BLOCKED = dépend d'une autre tâche | TODO = non implémenté.

Séparation par domaine : Backend | Frontend Web | Mobile Étudiant | Mobile Jury | Base de données

---

## 1. Backend

### Planification
- ✅ DONE : Modèles `Creneau` et `SessionSoutenance` présents
- ✅ DONE : Routes `api/creneaux` fonctionnelles
- ✅ DONE : Contrôleur `CreneauController` implémenté
- ⚠️ PARTIAL : Affectation automatique des soutenances aux créneaux non totalement automatisée

### Soutenance
- ✅ DONE : Modèle `Soutenance` avec relations complètes (depot, room, sessionSoutenance, evaluations)
- ✅ DONE : Routes `api/soutenances` fonctionnelles
- ✅ DONE : Route `GET /api/soutenances/{id}/pv` fonctionnelle
- ✅ DONE : Relations `Soutenance.evaluations()` vers `Evaluation` ✅
- ⚠️ PARTIAL : Affectation jury ↔ soutenance implicite via Evaluation (pas formelle)

### Évaluation / Note (nouveau flux Jury)
- ✅ DONE : Modèle `Evaluation` (racine `app/Models/Evaluation.php`) avec `soutenance_id` et `jury_user_id`
- ✅ DONE : API `POST /api/v1/evaluations` - création/mise à jour note globale
- ✅ DONE : API `PUT /api/v1/evaluations/{id}` - modification note existante
- ✅ DONE : API `GET /api/v1/evaluations/assigned` - listes soutenances jury
- ✅ DONE : Nouveau flux Jury : note globale /20, pas de grille, pas de critères
- ⚠️ PARTIAL : Incohérence `note_generale` (mobile/API) vs `note_finale` (modèle) non résolue
- ⚠️ PARTIAL : Vérification `jury_user_id === user.id` n'est pas systématique dans toutes les routes
- ⚠️ PARTIAL : Ancien système grille/critères (`evaluation_grids`, `evaluation_criteria`, `evaluation_scores`, `defense_evaluations`) coexiste en lecture seule

### Délibération
- ✅ DONE : Méthode `validateDeliberation` existante dans `DefenseEvaluationController`
- ✅ DONE : Produit status `validated`, decision, mention, commented_deliberation
- ✅ DONE : La délibération est distincte de la saisie individuelle des notes
- ⚠️ PARTIAL : Vérification rôle admin n'est pas formelle (utilise `requireJury` au lieu de vérifier `admin_scolarite`)
- ⚠️ PARTIAL : S'assurer que toutes les notes existent avant de permettre la délibération
- ⚠️ PARTIAL : Conserver les notes individuelles après production du résultat final

### Authentification
- ✅ DONE : Sanctum tokens pour admin, jury, étudiant
- ✅ DONE : Routes `auth.login`, `auth.me`, `auth.logout` fonctionnelles
- ✅ DONE : Rôles : `admin_scolarite`, `president_jury`, `rapporteur`, `examinateur`, `jury`, `etudiant`
- ✅ DONE : Utilisation de `SecureStore` sur mobile
- ✅ DONE : Authentification étudiant via `student.login` fonctionnelle
- ✅ DONE : Authentification jury via `auth.login` fonctionnelle

### Administration
- ✅ DONE : Routes `admin/*` existantes dans `backend/routes/api.php`
- ✅ DONE : Contrôleurs admin pour gestion soutenances, utilisateurs
- ✅ DONE : Statistiques dashboard fonctionnelles
- ⚠️ PARTIAL : Vérification des rôles admin dans toutes les routes est incomplète
- ❌ TODO : Renforcer les vérifications d'autorisation admin sur toutes les routes

---

## 2. Frontend Web

### Administration
- ✅ DONE : Interface d'administration existante
- ✅ DONE : Gestion des soutenances (CRUD)
- ✅ DONE : Gestion des utilisateurs et rôles
- ✅ DONE : Statistiques dashboard
- ✅ DONE : Clôture des PV de soutenance
- ⚠️ PARTIAL : Certaines vérifications de rôle pourraient être renforcées
- ❌ TODO : S'assurer que l'accès admin ne soit pas possible via URLs directes sans vérification

### Planification / Créneaux
- ✅ DONE : Interface d'affichage des créneaux
- ✅ DONE : Création de nouveaux créneaux
- ⚠️ PARTIAL : Affectation des soutenances aux créneaux pourrait être améliorée

---

## 3. Mobile Étudiant

### Connexion
- ✅ DONE : Connexion via `student.login` fonctionne
- ✅ DONE : Token stocké en `SecureStore`
- ✅ DONE : Profil étudiant affichable

### Profil & Convocations
- ✅ DONE : Profil étudiant affichable (nom, email, matricule, formation)
- ✅ DONE : Listes des soutenances suivies
- ✅ DONE : Statut de dépôt (en attente, déposé)
- ✅ DONE : Informations de convocation (date, heure, salle, thème)

### Limitations
- ⚠️ PARTIAL : Interface de convocation pourrait être améliorée
- ❌ TODO : Améliorer l'affichage des informations de soutenance pour l'étudiant

---

## 4. Mobile Jury

### Connexion
- ✅ DONE : Connexion via `auth.login` fonctionne
- ✅ DONE : Token stocké en `SecureStore`
- ✅ DONE : Rôles vérifiés (jury, president_jury, etc.)

### Listes des soutenances
- ✅ DONE : Listes des soutenances affectées via `GET /api/v1/evaluations/assigned` fonctionne
- ✅ DONE : Affichage étudiant, thème, date, heure, salle
- ✅ DONE : Statut de chaque soutenance (évaluation_en_attente, draft, validated)

### Saisie de note
- ✅ DONE : Saisie note globale /20 fonctionne
- ✅ DONE : Enregistrement note fonctionne
- ✅ DONE : Plusieurs jurys peuvent noter la même soutenance indépendamment
- ⚠️ PARTIAL : Vérification que le jury ne peut noter que ses soutenances assignées (non formelle dans le code)
- ⚠️ PARTIAL : Incohérence `note_generale` (mobile) vs `note_finale` (modèle) non résolue

### Limitations
- ❌ BLOCKED : Délibération non accessible par jury (réservé admin - c'est voulu)
- ❌ BLOCKED : Ancien système grille/critères non utilisé (coexiste mais inutilisable)
- ⚠️ PARTIAL : Fallback vers `demoDefenses` si pas de token présent
- ⚠️ PARTIAL : Interface pourrait afficher uniquement les soutenances "disponibles" pour chaque jury

### API Mobile Jury
- ✅ DONE : `POST /api/v1/auth.login` - Connexion jury
- ✅ DONE : `GET /api/v1/evaluations/assigned` - Listes soutenances jury
- ✅ DONE : `POST /api/v1/evaluations` - Saisie note globale
- ✅ DONE : `PUT /api/v1/evaluations/{id}` - Modification note
- ❌ BLOCKED : `POST /api/v1/evaluations/{id}/validate` - Doit rester réservé admin

---

## 5. Base de Données

### Tables existantes
- ✅ `soutenances` - Structure principale des soutenances
- ✅ `evaluations` - Notes jurys (nouveau flux) avec `soutenance_id`, `jury_user_id`, `note_finale`/`note_generale`, `status`
- ✅ `users` - Utilisateurs avec rôles Spatie Permission
- ✅ `creneaux` - Créneaux horaires
- ✅ `session_soutenance` - Sessions de soutenance
- ✅ `depots` - Dépôts de manuscrit
- ✅ `rooms` - Salles
- ⚠️ `evaluation_grids` - Ancien système grille (non utilisé pour Jury actuel, garder pour compatibilité)
- ⚠️ `evaluation_criteria` - Ancien système critères (non utilisé pour Jury actuel)
- ⚠️ `evaluation_scores` - Ancien système scores (non utilisé pour Jury actuel)
- ⚠️ `defense_evaluations` - Ancien système (non utilisé pour Jury actuel, `defense_id` sans lien vers `Soutenance.id`)
- ❌ Table `defenses` n'existe pas en base

### Relations
- ✅ `Soutenance.id` ↔ `Evaluation.soutenance_id` ✅ (FK)
- ✅ `User.id` ↔ `Evaluation.jury_user_id` ✅ (FK)
- ✅ `Soutenance.evaluations()` ↔ `Evaluation.soutenance()` ✅
- ❌ `DefenseEvaluation.defense_id` ↔ `Soutenance.id` ❌ (aucun lien Eloquent)
- ⚠️ Pas de table de liaison formelle `jury_soutenance`

### État base de données
- ✅ Schéma global cohérent pour le nouveau flux Jury
- ✅ Modèle `Evaluation` (racine) comme noyau du flux Jury ✅
- ⚠️ Anciennes tables à garder en lecture seule pour compatibilité
- ❌ Table `defenses` manquante
- ⚠️ Incohérence champ `note_finale` (modèle) vs `note_generale` (API)