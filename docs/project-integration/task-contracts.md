# Contrats de Tâche - Documentation d'Intégration Inter-Tâches

> Ce fichier est le plus important du dossier. Il permet à chaque membre du groupe de travailler sur sa tâche sans casser celles des autres.

Chaque contrat ci-dessous suit la même structure pour assurer la cohérence. Pour chaque tâche :
1. Objectif
2. Fichiers concernés
3. Données d'entrée
4. Données produites
5. API utilisées
6. Modèles utilisés
7. Dépendances
8. Ce que les autres tâches attendent d'elle
9. Ce qu'elle ne doit pas modifier
10. État actuel (DONE / PARTIAL / BLOCKED / TODO)

---

## 1. Tâche : Planning des soutenances

### Objectif
Gérer le calendrier académique des soutenances, créer les créneaux horaires et affecter les jurys aux soutenances selon les disponibilités.

### Fichiers concernés
- `backend/app/Models/Creneau.php`
- `backend/app/Models/SessionSoutenance.php`
- `backend/routes/api.php` (routes `/creneaux`, `/sessions-soutenance`)
- `backend/app/Http/Controllers/Api/CreneauController.php`

### Données d'entrée
- Calendrier académique (dates de début/fin de semestre)
- Disponibilité des salles
- Disponibilité des jurys et des étudiants
- Règles d'organisation (nombre de soutenances par jour, etc.)

### Données produites
- Créneaux horaires dispo avec capacité
- Affectation des soutenances aux créneaux
- Liste des soutenances planifiées avec dates/heures/salles

### API utilisées
- `GET /api/creneaux` - Liste des créneaux
- `POST /api/creneaux` - Créer un nouveau créneau
- `PUT /api/creneaux/{id}` - Modifier un créneau
- `GET /api/sessions-soutenance` - Listes des sessions

### Modèles utilisés
- `Creneau` : `reference`, `heure_debut`, `heure_fin`, `jours`, `type`, `capacite`, `actif`
- `SessionSoutenance` : `libelle`, `date_debut`, `date_fin`
- `Soutenance` : `depot_id`, `session_soutenance_id`, `room_id`, `date`, `status`

### Dépendances
- **Dépend de** : Aucune tâche critique en amont (base calendrier académique fournie par l'établissement)
- **Dépendé par** : Tâche Soutenance (création des soutenances planifiées), Tâche Convocation (dates/heures/salles à communiquer)

### Ce que les autres tâches attendent d'elle
- Planning fournit les dates, heures et salles nécessaires à la création des soutenances
- Planning fournit les créneaux disponibles pour l'affectation des jurys
- Les informations de planning doivent être cohérentes avec lesaffectations finales

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas modifier les modèles `Soutenance`, `Evaluation`, `User` existants
- ⛔ Ne pas créer de nouvelle table `defenses` ou `jury_soutenance`
- ⛔ Ne pas réintroduire de grilles/critères dans le flux Jury
- ⛔ Ne pas modifier les routes API existantes sans coordination

### État actuel
- **DONE** : Modèles `Creneau` et `SessionSoutenance` présents
- **DONE** : Routes `api/creneaux` fonctionnelles
- **PARTIAL** : Affectation des jurys aux créneaux pas entièrement automatisée
- **TODO** : Documenter formellement l'affectation Planning → Créneaux → Soutenance

---

## 2. Tâche : Convocation

### Objectif
Gérer la convocation des étudiants et des jurys pour les soutenances, inclure les informations de dépôt de manuscrit.

### Fichiers concernés
- `mobile/components/student/StudentHomeScreen.tsx`
- `mobile/components/student/StudentLoginScreen.tsx`
- `mobile/services/studentService.ts`
- `mobile/components/jury/JuryLoginScreen.tsx`
- `mobile/components/jury/JuryHomeScreen.tsx`
- `backend/routes/api.php` (routes `/v1/student`, `/api/v1/auth`)
- `backend/app/Http/Controllers/Api/StudentAuthController.php`
- `backend/app/Http/Controllers/Api/Auth/AuthController.php`

### Données d'entrée
- Identifiant étudiant (matricule) + mot de passe
- Identifiant jury + mot de passe
- Détails de la soutenance (ID, date, heure, salle, thème)

### Données produites
- Token d'authentification (Sanctum) pour l'étudiant ou le jury
- Profil utilisateur avec rôle
- Informations de convocation (date, heure, salle, lieu, thème, dépôt)
- Statut du dépôt (en attente, déposé)

### API utilisées
- `POST /api/v1/student.login` - Connexion étudiant
- `GET /api/v1/student.profile` - Profil étudiant
- `POST /api/v1/auth.login` - Connexion jury
- `GET /api/v1/auth.me` - Profil utilisateur
- `POST /api/v1/auth.logout` - Déconnexion
- Divers routes de dépôt et de convocation

### Modèles utilisés
- `User` : avec rôle (`etudiant`, `jury`, `admin_scolarite`, etc.)
- `Soutenance` : détails de la soutenance à convoquer
- `Depot` : informations sur le dépôt de manuscrit

### Dépendances
- **Dépend de** : Tâche Planning (dates, heures, salles), Tâche Soutenance (informations de la soutenance à convoquer)
- **Dépendé par** : Aucune tâche critique en aval (les convocations sont des informations de lecture)

### Ce que les autres tâches attendent d'elle
- Convocation étudiante fournit les informations de date/heure/salle au étudiant
- Convocation jury fournit les informations de soutenance affectée au jury
- Les deux convocations (étudiant/jury) utilisent les mêmes données de base (issue de la Soutenance)

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas modifier les modèles `Soutenance`, `Evaluation`, `Creneau` existants
- ⛔ Ne pas modifier l'authentification Sanctum ou les rôles utilisateur
- ⛔ Ne pas réintroduire de grille/critères dans les écrans de convocation
- ⛔ Ne pas modifier les tokens d'authentification ou le système Sanctum

### État actuel
- **DONE** : Connexion étudiant via `student.login` fonctionnelle
- **DONE** : Connexion jury via `auth.login` fonctionnelle
- **DONE** : Profil étudiant affichable
- **DONE** : Listes des soutenances affichables pour jury (`GET /evaluations/assigned`)
- **PARTIAL** : Interface convocation étudiant pourrait être améliorée
- **TODO** : Renforcer l'affectation formelle jury ↔ soutenance dans les convocation

---

## 3. Tâche : Soutenance

### Objectif
Gérer la création et le contenu des soutenances, relations avec étudiants et jurys, affichage des informations de soutenance.

### Fichiers concernés
- `backend/app/Models/Soutenance.php`
- `backend/app/Models/Evaluation.php` (racine)
- `backend/app/Modules/Evaluation/Http/Controllers/DefenseEvaluationController.php`
- `backend/routes/api.php`
- `mobile/components/jury/JuryHomeScreen.tsx`
- `mobile/components/student/StudentHomeScreen.tsx`

### Données d'entrée
- Informations étudiant (nom, matricule, formation, thème, entreprise/dépôt)
- Informations jury (rôles, affectation)
- Détails de la soutenance (date, heure, salle, session, dépôt)

### Données produites
- Enregistrement complet d'une soutenance en base
- Liste des jurys affectés à la soutenance
- Statut de la soutenance (planifiée, en cours, validée, etc.)
- Relations avec évaluations (notes jury)

### API utilisées
- `GET /api/soutenances` - Liste des soutenances (admin)
- `GET /api/soutenances/{id}/pv` - Procès-verbal de soutenance (admin)
- `POST /api/v1/evaluations` - Création ou mise à jour évaluation (nouveau flux Jury)
- `GET /api/v1/evaluations/assigned` - Listes évaluations jury
- `GET /soutenances/{id}/pv` - PV soutenance

### Modèles utilisés
- `Soutenance` : `id`, `depot_id`, `session_soutenance_id`, `room_id`, `date`, `status`, `remarques`
- `Evaluation` (racine) : `soutenance_id`, `jury_user_id`, `note_finale`/`note_generale`, `status`, `commentaire`
- `Depot` : lien avec le dépôt de manuscrit
- `Room` : numéro de salle
- `SessionSoutenance` : libelle, date_debut, date_fin

### Dépendances
- **Dépend de** : Tâche Planning (créneaux horaires, dates), Tâche Convocation (étudiant/jury à convier), Tâche Authentification (utilisateurs connectés)
- **Dépendé par** : Tâche Note Jury, Tâche Délibération, Tâche Résultat final

### Ce que les autres tâches attendent d'elle
- Soutenance fournit les informations détaillées (date, heure, salle, thème) aux convocations
- Soutenance acceuille les jurys qui peuvent la noter (via `soutenance_id` et `jury_user_id`)
- Soutenance produit les évaluations qui sont la base de la Délibération
- Le `soutenance_id` doit toujours correspondre à un `id` valide en table `soutenances`

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas modifier la structure `Evaluation.soutenance_id` existante
- ⛔ Ne pas réintroduire les grilles/critères dans le flux Jury
- ⛔ Ne pas créer de nouvelle table `defenses` inexistante
- ⛔ Ne pas modifier les rôles d'utilisateur ou le système d'authentification
- ⛔ Ne pas modifier les champs `depot_id`, `room_id` sans nécessité

### État actuel
- **DONE** : Modèle `Soutenance` avec relations complètes
- **DONE** : Routes `api/soutenances` fonctionnelles
- **DONE** : Relations `Soutenance.evaluations()` vers `Evaluation` ✅
- **DONE** : Modèle `Evaluation` (racine) avec `soutenance_id` et `jury_user_id` ✅
- **PARTIAL** : Affectation jury ↔ soutenance implicite (via Evaluation), pas formelle
- **TODO** : Standardiser `note_generale` vs `note_finale` nommage
- **TODO** : Renforcer vérification que `jury_user_id` correspond au jury connecté

---

## 4. Tâche : Jury (Mobile)

### Objectif
Interface Jury pour visualiser ses soutenances affectées, saisir notes globales sur 20, gérer son tableau de bord.

### Fichiers concernés
- `mobile/components/jury/JuryHomeScreen.tsx`
- `mobile/components/jury/JuryLoginScreen.tsx`
- `mobile/services/evaluationApi.ts`
- `mobile/services/api.ts`
- `mobile/constants/`

### Données d'entrée
- Token d'authentification (via `POST /api/v1/auth.login`)
- ID de la soutenance en cours (via navigation)
- Note globale à saisir (0-20)
- Commentaire optionnel

### Données produites
- Affichage des soutenances affectées au jury courant
- Enregistrement de la note globale + commentaire
- Navigation entre les écrans (liste soutenance, détail, note)
- Stockage du token en SecureStore

### API utilisées
- `POST /api/v1/auth.login` - Connexion jury
- `GET /api/v1/evaluations/assigned` - Listes soutenances affectées jury
- `POST /api/v1/evaluations` - Saisie note globale + commentaire
- `PUT /api/v1/evaluations/{id}` - Modification note existante
- `POST /api/v1/auth.logout` - Déconnexion
- `GET /api/soutenances` - Liste soutenances (pour infos, mais rôle admin)

### Modèles utilisés
- `Evaluation` (racine) : `soutenance_id`, `jury_user_id`, `note_generale`/ `note_finale`, `commentaire`, `status`
- `User` : identification jury via rôle `jury`
- `Soutenance` : détails de la soutenance affichée

### Dépendances
- **Dépend de** : Tâche Authentification (token valide), Tâche Soutenance (identifiants soutenances), Tâche Note Jury (saisie note)
- **Dépendé par** : Aucune tâche critique en aval (la délibération est réservée admin)

### Ce que les autres tâches attendent d'elle
- Jury fournit la saisie de notes globales sur 20 pour ses soutenances assignées
- Jury ne doit modifier que ses propres notes (`jury_user_id` doit correspondre à l'utilisateur connecté)
- Jury ne doit pas pouvoir valider la délibération (c'est réservé admin)
- Jury voit uniquement ses soutenances affectées (via `GET /evaluations/assigned`)

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas réintroduire de grille d'évaluation ni de critères de notation
- ⛔ Ne pas modifier le champ `note_generale` en `note_finale` sans coordination (incohérence connue)
- ⛔ Ne pas modifier le système d'authentification Sanctum
- ⛔ Ne pas créer de nouvelle table `defenses` ou `jury_soutenance`
- ⛔ Ne pas modifier les modèles backend sans passer par les contrats d'intégration
- ⛔ Ne pas permettre la suppression ou modification de notes already validées

### État actuel
- **DONE** : Connexion jury via `auth.login` fonctionne
- **DONE** : Listes des soutenances affectées via `GET /evaluations/assigned` fonctionne
- **DONE** : Saisie note globale /20 fonctionne
- **DONE** : Enregistrement note fonctionne
- **PARTIAL** : Vérification que le jury ne peut noter que ses soutenances assignées (non formelle dans le code)
- **BLOCKED** : Délibération non accessible par jury (réservée admin - c'est voulu)
- **TODO** : Renforcer vérification `jury_user_id === user.id` avant toute écriture de note
- **TODO** : Standardiser `note_generale` (API mobile) vs `note_finale` (modèle)

---

## 5. Tâche : Étudiant (Mobile)

### Objectif
Interface Étudiant pour suivre son soutienance, voir son dépôt, recevoir sa convocation.

### Fichiers concernés
- `mobile/components/student/StudentHomeScreen.tsx`
- `mobile/components/student/StudentLoginScreen.tsx`
- `mobile/services/studentService.ts`
- `mobile/constants/`

### Données d'entrée
- Matricule + mot de passe pour connexion
- ID de la soutenance à suivre

### Données produites
- Affichage du profil étudiant
- Informations de convocation (date, heure, salle)
- Statut du dépôt de manuscrit (en attente, déposé)
- Historique des soutenances suivies

### API utilisées
- `POST /api/v1/student.login` - Connexion étudiant
- `GET /api/v1/student.profile` - Profil étudiant
- Divers routes de dépôt et de convocation

### Modèles utilisés
- `User` : rôle `etudiant`
- `Soutenance` : lien via `depot_id`
- `Depot` : informations sur le dépôt de manuscrit

### Dépendances
- **Dépend de** : Tâche Authentification (connexion étudiant), Tâche Soutenance (informations de la soutenance)
- **Dépendé par** : Aucune tâche critique en aval (affichage seulement)

### Ce que les autres tâches attendent d'elle
- Étudiant affiche ses informations personnelles et ses soutenances
- Étudiant voit le statut de son dépôt de manuscrit
- Étudiant reçoit sa convocation avec date/heure/salle/lieu

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas modifier le système d'authentification étudiant
- ⛔ Ne pas réintroduire grille/critères
- ⛔ Ne pas modifier les modèles backend sans coordination
- ⛔ Ne pas modifier le rôle `etudiant` dans le système de permissions

### État actuel
- **DONE** : Connexion étudiant via `student.login` fonctionne
- **DONE** : Profil étudiant affichable
- **DONE** : Statut de dépôt géré (en attente, déposé)
- **PARTIAL** : Interface convocation pourrait être améliorée
- **TODO** : Améliorer l'affichage des informations de soutenance pour l'étudiant

---

## 6. Tâche : Évaluation / Note Jury

### Objectif
Gérer la saisie, l'enregistrement et le suivi des notes des jurys (note globale sur 20), stockage en base, vérification d'affectation.

### Fichiers concernés
- `mobile/services/evaluationApi.ts`
- `mobile/components/jury/JuryHomeScreen.tsx`
- `backend/app/Modules/Evaluation/Http/Controllers/DefenseEvaluationController.php`
- `backend/routes/api.php`

### Données d'entrée
- `soutenance_id` : ID de la soutenance en cours
- `note_generale` / `note_finale` : Note globale sur 20 (entier ou décimal)
- `commentaire` : Commentaire optionnel sur la soutenance
- `jury_user_id` : Identifiant du jury (via authentification Sanctum)

### Données produites
- Enregistrement d'une évaluation en base avec `status = draft`
- Mise à jour d'une évaluation existante
- Statut de l'évaluation (draft → validated selon règles)
- Plusieurs jurys peuvent noter la même soutenance indépendamment

### API utilisées
- `POST /api/v1/evaluations` - Création/mise à jour note globale
- `PUT /api/v1/evaluations/{id}` - Modification note existante
- `GET /api/v1/evaluations/assigned` - Récupération listes soutenances jury

### Modèles utilisés
- `Evaluation` (racine `app/Models/Evaluation.php`) :
  - `soutenance_id` → FK vers `soutenances.id`
  - `jury_user_id` → FK vers `users.id`
  - `note_finale` → Note globale modèle (nom backend)
  - `note_generale` → Note globale nom mobile/API ⚠️
  - `commentaire` → Commentaire optionnel
  - `status` → draft/validated
- `User` : jury_user_id FK
- `Soutenance` : soutenance_id FK

### Dépendances
- **Dépend de** : Tâche Soutenance (soutenance_id valide), Tâche Authentification (token jury valide, jury_user_id), Tâche Jury (saisie interface)
- **Dépendé par** : Tâche Délibération (toutes les notes doivent exister avant de pouvoir délibérer)

### Ce que les autres tâches attendent d'elle
- Évaluation/stocke la note globale sur 20 saisie par le jury
- Évaluation lie la note à la bonne soutenance (`soutenance_id`)
- Évaluation lie la note au bon jury (`jury_user_id`)
- Le statut initial doit être `draft`
- Après enregistrement, le système permet plusieurs jurys de noter la même soutenance

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas saisir de note en-dehors de la range 0-20
- ⛔ Ne pas modifier une note déjà validée (`status = validated`) sans procédure spéciale
- ⛔ Ne pas réintroduire de grille/critères de notation
- ⛔ Ne pas inverser la signification de `note_generale` et `note_finale` sans accord du groupe
- ⛔ Ne pas modifier les modèles `Soutenance` ou `User` existants

### État actuel
- **DONE** : Saisie note globale /20 fonctionne
- **DONE** : Enregistrement en base fonctionne
- **DONE** : Plusieurs jurys peuvent noter la même soutenance indépendamment
- **PARTIAL** : Vérification `jury_user_id === user.id` n'est pas systématique dans toutes les routes
- **PARTIAL** : Incohérence `note_generale` (mobile) vs `note_finale` (modèle) non résolue
- **TODO** : Standardiser le nom de champ note globale (choix `note_generale` pour le flux mobile)
- **TODO** : Ajouter vérification systématique que `jury_user_id` correspond au jury connecté

---

## 7. Tâche : Délibération

### Objectif
Gérer la phase de délibération après la saisie de toutes les notes des jurys, permettre la décision finale et la mention.

### Fichiers concernés
- `backend/app/Modules/Evaluation/Http/Controllers/DefenseEvaluationController.php` - `validateDeliberation`
- Routes admin d'affichage résultat
- Interface d'administration affichage délibération

### Données d'entrée
- Toutes les notes des jurys pour une soutenance (collectées via l'étape Note Jury)
- Décision finale : `Admis` / `Ajourné` (requis)
- Mention optionnelle : `TB`, `Assez Bien`, `Passable`, etc.
- Commentaire de délibération (optionnel)

### Données produites
- Status `validated` mis à jour sur chaque évaluation concernée
- Décision finale enregistrée sur la soutenance/évaluation
- Mention le cas échéant
- Date de validation (`validated_at`)
- Résultat final officiel

### API utilisées
- `POST /api/v1/evaluations/{id}/validate` - Validation délibération
- Consultation des notes existantes pour une soutenance

### Modèles utilisés
- `Evaluation` (racine) : mise à jour du champ `status` en `validated`, ajout de `decision`, `mention`, `commentaire_deliberation`, `validated_at`
- `Soutenance` : lien avec les évaluations validées

### Dépendances
- **Dépend de** : Tâche Note Jury (toutes les notes individuelles doivent exister et avoir `status = draft`)
- **Dépendé par** : Tâche Résultat final (produit le résultat officiel)

### Ce que les autres tâches attendent d'elle
- Délibération ne doit être effectuée que par un administrateur ou le président de jury
- Délibération doit conserver les notes individuelles avant de produire la décision finale
- La décision finale doit être documentée avec date de validation
- La mention est optionnelle mais doit suivre un format si fournie
- Après délibération, les notes individuelles ne doivent pas être modifiables (verrouillage)

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas autoriser un jury simple à valider la délibération (réservé admin/sénat)
- ⛔ Ne pas modifier les notes individuelles après validation sans procédure de révision
- ⛔ Ne pas supprimer les notes individuelles lors de la production du résultat final
- ⛔ Ne pas réintroduire grille/critères durant la délibération
- ⛔ Ne pas modifier les champs `soutenance_id` ou `jury_user_id` existants

### État actuel
- **DONE** : Méthode `validateDeliberation` existante dans `DefenseEvaluationController`
- **DONE** : Produit status `validated`, decision, mention, commented_deliberation ✅
- **DONE** : La délibération est distincte de la saisie individuelle des notes ✅
- **PARTIAL** : La vérification du rôle admin n'est pas formelle (utilise `requireJury` au lieu de vérifier `admin_scolarite`)
- **TODO** : Renforcer la vérification rôle admin dans `validateDeliberation`
- **TODO** : S'assurer que toutes les notes existent avant de permettre la délibération
- **TODO** : Conserver les notes individuelles après la production du résultat final

---

## 8. Tâche : Résultat Final

### Objectif
Représenter le résultat final après délibération, documentation de la décision et de la mention.

### Fichiers concernés
- `backend/app/Modules/Evaluation/Http/Controllers/DefenseEvaluationController.php` - `validateDeliberation` (déjà vue)
- Interface d'affichage résultat (Web et Mobile)
- Modèle `Evaluation` : champs decision, mention, validated_at

### Données d'entrée
- Décision finale : `Admis` / `Ajourné` (requis)
- Le cas échéant : Mention (`TB`, `Assez Bien`, `Passable`, etc.)
- Commentaire de délibération (déjà existant)
- Date de validation (générée automatiquement)

### Données produites
- Résultat officiel affiché dans les interfaces
- Documentation du processus de soutenance
- Historique des décisions

### API utilisées
- `POST /api/v1/evaluations/{id}/validate` - Already seen in Délibération
- Affichage dans les interfaces Web et Mobile (lecture seule)

### Modèles utilisés
- `Evaluation` (racine) : champs `decision`, `mention`, `validated_at`, `status` = `validated`
- Résultat final = compilation de toutes les évaluations validées d'une soutenance

### Dépendances
- **Dépend de** : Tâche Délibération (toutes les notes existent et ont été validées)
- **Dépendé par** : Aucune (c'est l'étape terminale)

### Ce que les autres tâches attendent d'elle
- Résultat final lie la décision à la soutenance concernée
- La date de validation doit être enregistrée
- La mention est optionnelle mais doit suivre un format si fournie
- Le résultat final ne doit pas modifier les notes individuelles existantes
- Le résultat final officialise le processus de soutenance

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas modifier les notes individuelles existantes après validation
- ⛔ Ne pas perdre le lien entre résultat final et soutenance
- ⛔ Omettre la date de validation
- ⛔ Réouvrir la saisie de notes après avoir produit le résultat final

### État actuel
- **DONE** : Résultat final après validation enregistré ✅
- **DONE** : Décision + mention enregistrées ✅
- **DONE** : Date de validation enregistrée ✅
- **PARTIAL** : Affichage résultat final dans l'interface Mobile Jury (lecture seulement)
- **TODO** : S'assurer que le résultat final soit affiché correctement dans les deux interfaces (Web + Mobile)
- **TODO** : Vérifier que les notes individuelles ne soient pas modifiables après production du résultat

---

## 9. Tâche : Administration (Web)

### Objectif
Interface administration pour gestion globale du projet : gestion des soutenances, jurys, étudiants, délibérations, résultats finaux.

### Fichiers concernés
- `backend/app/Http/Controllers/Admin/*`
- `backend/routes/api.php` (routes `admin/*`)
- Interface Blade/Vue selon l'architecture

### Données d'entrée
- Toutes les données du backend (soutenances, jurys, étudiants, notes, évaluations)
- Filtres, recherches, actions sur les enregistrements

### Données produites
- Listes administratives à jour
- Rapports, statistiques
- Gestion des utilisateurs (création, modification, suppression des rôles)
- Clôture des PV de soutenance

### API utilisées
- `GET /admin/soutenances` - Liste des soutenances
- `POST /admin/soutenances/{id}/cloturer` - Clôturer un PV de soutenance
- `GET /admin/dashboard/stats` - Statistiques globales
- `GET /admin/sessions-soutenance` - Listes sessions
- Toutes les routes `admin/*` selon besoins

### Modèles utilisés
- `User` : gestion des rôles (spatie/permission)
- `Soutenance` : toutes les opérations CRUD
- `Evaluation` : opérations sur les évaluations (notamment validateDeliberation)
- `Depot`, `Room`, `SessionSoutenance` : selon les opérations

### Dépendances
- **Dépend de** : Toutes les autres tâches (données à administrer)
- **Dépendé par** : Aucune (c'est l'interface haute niveau)

### Ce que les autres tâches attendent d'elle
- Administration gère les utilisateurs et leurs rôles
- Administration peut clôturer les PV de soutenance
- Administration a accès aux statistiques globales du projet
- Administration peut valider les délibérations (fonctionnalité qui doit rester réservée)
- Administration ne doit pas modifier les notes individuelles en-dehors des procédures définies

### Ce qu'elle ne doit pas modifier
- ⛔ Ne pas donner accès admin à des utilisateurs non autorisés
- ⛔ Ne pas afficher des données obsolètes par rapport à la base
- ⛔ Ne pas modifier les formulaires sans validation d'entrée
- ⛔ Ne pas modifier les routes d'authentification ou les modèles core
- ⛔ Ne pas réintroduire grille/critères dans aucune interface admin
- ⛔ Ne pas modifier la structure `Evaluation.soutenance_id` ou `jury_user_id`

### État actuel
- **DONE** : Routes admin existantes dans `backend/routes/api.php`
- **DONE** : Contrôleurs admin pour gestion soutenances, utilisateurs
- **DONE** : Statistiques dashboard fonctionnelles
- **PARTIAL** : Vérification des rôles admin dans toutes les routes est incomplète
- **TODO** : Renforcer les vérifications d'autorisation admin sur toutes les routes
- **TODO** : S'assurer que l'accès admin ne soit pas possibilevia URLs directes sans vérification