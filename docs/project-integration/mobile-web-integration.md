# Intégration Mobile Web - Flux de Données

Documentation des échanges entre WEB → BACKEND → DATABASE → MOBILE ÉTUDIANT → MOBILE JURY.

## Schéma d'architecture

```
WEB (Application Web Administration)
    ↓ API Routes
BACKEND (Laravel + Sanctum Auth)
    ↓ Requêtes SQL / Modèles
DATABASE (MySQL / PostgreSQL)
    ↓ API Responses
MOBILE ÉTUDIANT (Expo React Native)
    ↓
MOBILE JURY (Expo React Native)
```

---

## 1. WEB → BACKEND

### Données qui coulent du Web vers le Backend
- **Requêtes HTTP** : Toutes les routes `admin/*` dans `backend/routes/api.php`
- **Types de données** :
  - Gestion d'utilisateurs (création, modification, suppression des rôles spatie/permission)
  - Création et modification de soutenances
  - Clôture des PV de soutenance
  - Statistiques et rapports
  - Recherche et filtrage d'éléments

### API utilisées par le Web
- `GET /admin/soutenances` - Liste des soutenances (vérification rôle `admin_scolarite`)
- `POST /admin/soutenances/{id}/cloturer` - Clôturer un PV de soutenance
- `GET /admin/dashboard/stats` - Statistiques globales du projet
- `GET /admin/sessions-soutenance` - Listes des sessions de soutenance
- `GET /admin/soutenances/{id}/pv` - Procès-verbal de soutenance

### Données produites par le Web
- Listes administratives à jour
- Rapports et statistiques sur le projet
- Décisions d'administration
- État des utilisateurs et de leurs rôles

---

## 2. BACKEND → DATABASE

### Données échangées avec la base de données
- **Modèles Laravel** : `User`, `Soutenance`, `Evaluation`, `Creneau`, `SessionSoutenance`, `Depot`, `Room`
- **Opérations SQL** :
  - Create/Read/Update sur toutes les tables principales
  - Relations BelongsTo/HasMany entre Supported, Evaluation, User
  - Mise à jour du statut `status` sur les évaluations (draft → validated)
  - Enregistrement des décisions et mentions lors de la délibération
  - Gestion des tokens Sanctum pour l'authentification

### Modèles et relations clés
- `Soutenance` ↔ `Evaluation` (1:N via `soutenance_id`)
- `User` ↔ `Evaluation` (1:N via `jury_user_id`)
- `Soutenance` ↔ `Depot` (1:N via `depot_id`)
- `Soutenance` ↔ `Room` (1:N via `room_id`)
- `Soutenance` ↔ `SessionSoutenance` (1:N via `session_soutenance_id`)

---

## 3. DATABASE → BACKEND (API Responses)

### Données retournées par le Backend vers les applications mobiles
- **Token d'authentification** (Sanctum) pour maintenir la session
- **Informations utilisateur** : ID, nom, email, rôles (`admin_scolarite`, `president_jury`, `jury`, `etudiant`)
- **Informations de soutenance** : ID, date, heure, salle, thème,étudiant, jury affectés
- **Notes jury** : `note_generale` (mobile/API) / `note_finale` (modèle), `commentaire`, `status`
- **Statuts** : `draft`, `validated`, décision `Admis`/`Ajourné`, mention le cas échéant

### Points d'attention sur les noms de champs
- `note_finale` (nom en base/Laravel `Evaluation` modèle) vs `note_generale` (nom utilisé API mobile)
- Ces deux champs représentent la même chose : note globale sur 20
- **Recommandation** : Dans l'API et le mobile, privilégier `note_generale` pour le nouveau flux Jury

---

## 4. BACKEND → MOBILE ÉTUDIANT

### Données qui coulent du Backend vers le Mobile Étudiant

#### Authentification
- `POST /api/v1/student.login` → token étudiant
- Stockage en `SecureStore` sur l'appareil mobile
- Rôle `etudiant` vérifié via `isEtudiant()`

#### Profil étudiant
- `GET /api/v1/student.profile` → Informations de base (nom, email, matricule, formation)
- Stats sur les soutenances suivies

#### Convocations
- Informations de convocation : date, heure, salle, thème, dépôt de manuscrit
- Statut du dépôt (en attente, déposé)

#### Dépôt de manuscrit
- Informations sur l'état du dépôt
- Liens de téléchargement le cas échéant

### API utilisées par le Mobile Étudiant
- `POST /api/v1/student.login` - Connexion étudiante
- `GET /api/v1/student.profile` - Profil étudiant
- Divers routes de dépôt et de convocation (selon implementation)

### État d'intégration Mobile Étudiant
- ✅ Connexion authentifiée
- ✅ Profil étudiant affichable
- ✅ Convocations gérées avec date/heure/salle/pièce
- ✅ Gestion de dépôt présente
- ⚠️ Certaines fonctionnalités selon implementation spécifique

---

## 5. BACKEND → MOBILE JURY

### Données qui coulent du Backend vers le Mobile Jury

#### Authentification
- `POST /api/v1/auth.login` → token jury
- Stockage en `SecureStore` sur l'appareil mobile
- Rôle `jury` vérifié via les permissions Spatie
- Utilisateur `scolarite@emit.mg` / `password123` selon configuration

#### Listes des soutenances affectées
- `GET /api/v1/evaluations/assigned` → Retourne tableau d'évaluations avec :
  - `soutenance_id`
  - `student_name` (étudiant)
  - `theme` (thème de soutenance)
  - `date` (date de soutenance)
  - `salle` (salle affectée)
  - `status` (évaluation_en_attente, draft, validated)
  - `note_generale` (note saisie, si déjà notée)
  - `commentary` (commentaire le cas échéant)

#### Saisie note globale
- `POST /api/v1/evaluations` → Crée ou met à jour une évaluation
  - `soutenance_id` (requis)
  - `note_generale` (requis, sur 20)
  - `commentaire` (optionnel)
- Réponse : évaluation créée/mise à jour avec `status: draft`

#### Modification note
- `PUT /api/v1/evaluations/{id}` → Modifie une note existante
  - Vérification que `jury_user_id === user.id` (le jury ne peut modifier que ses propres notes)
  - `note_generale` modifiable
  - `commentaire` modifiable

#### Délibération (non accessible par jury)
- `POST /api/v1/evaluations/{id}/validate` → Validation finale
- **Attention** : Cette API ne doit pas être utilisée par l'interface jury
- Vérifie le rôle admin au-delà de `requireJury`

### API utilisées par le Mobile Jury
- `POST /api/v1/auth.login` - Connexion jury
- `GET /api/v1/evaluations/assigned` - Listes soutenances affectées jury
- `POST /api/v1/evaluations` - Saisie note globale (/20)
- `PUT /api/v1/evaluations/{id}` - Modification note
- `POST /api/v1/auth.logout` - Déconnexion

### Points d'attention pour le Mobile Jury
- ⚠️ Le mobile Jury utilise maintenant le modèle `Evaluation` (racine) alors que précédemment il utilisait `DefenseEvaluation`
- ⚠️ Incohérence `note_generale` (mobile/API) vs `note_finale` (modèle Laravel) - les deux représentent la note globale sur 20
- ⚠️ Fallback vers `demoDefenses` existe si aucun token n'est présent
- ✅ Listes soutenances via `GET /evaluations/assigned` fonctionne correctement
- ✅ Saisie note globale /20 fonctionne
- ✅ Enregistrement note fonctionne
- ❌ Délibération non accessible par jury (réservé admin - c'est voulu)
- ⚠️ Ancien système grille/critères non utilisé (coexiste mais inutilisable)

### État d'intégration Mobile Jury
- ✅ Connexion authentifiée
- ✅ Listes des soutenances affectées (`GET /evaluations/assigned`)
- ✅ Saisie note globale (/20)
- ✅ Enregistrement note
- ❌ Délibération non accessible par jury (réservé admin)
- ❌ Ancien système grille/critères non utilisé
- ⚠️ Fallback vers données démo si pas de token présent
- ⚠️ Incohérence `note_generale` vs `note_finale` à standardiser

---

## 6. DONNÉES COMMUNES entre tous les niveaux

| Identité | Source | Utilisation |
|-----------|--------|-------------|
| `soutenance_id` | Base de données (`soutenances.id`) ↔ API ↔ Mobile | Rattacher évaluation, soutenance, note |
| `jury_user_id` | Base de données (`users.id`) ↔ API ↔ Mobile | Rattacher évaluation à jury spécifique |
| `student_id` / matricule | Base de données (`users`/`etudiants`) ↔ API ↔ Mobile | Identifier l'étudiant |
| `note` / `note_generale` / `note_finale` | Base de données (`evaluations`) ↔ API ↔ Mobile | Note globale sur 20 (voir incohérence nommage) |
| `status` | Base de données (`evaluations.status`) | draft → validated → résultat final |
| `decision` | Base de données/aprés délibération | Admis / Ajourné |
| `mention` | Base de données/aprés délibération | TB, Assez Bien, etc. (optionnel) |
| `date` / `heure` / `salle` | Base de données (`soutenances`) | Identité de la soutenance |
| `theme` / `sujet` | Base de données (`soutenances.themeTitle` ou similaire) | Description du sujet |
| `token` | Sanctum ↔ Mobile | Authentification session |

---

## 7. Flux de données complets

### Flux 1 : Jury saisit sa note

```
Mobile Jury
    ↓ (authentification POST /api/v1/auth.login)
Backend (vérifie token, rôle jury)
    ↓ (requête SQL sur table evaluations + soutenances + users)
Database
    ↓ (retour JSON évaluation + soutenance info)
Mobile Jury
    ↓ (écran affichant soutenance + saisie note_generale)
    ↓ (POST /api/v1/evaluations avec soutenance_id + note_generale + commentaire)
Backend
    ↓ (Enregistrement en DB, status = draft)
Database
    ✅ Note enregistrée pour ce jury et cette soutenance
```

### Flux 2 : Consultation des soutenances par jury

```
Mobile Jury
    ↓ (authentification POST /api/v1/auth.login)
Backend (vérifie token, récupère évaluations where jury_user_id = user.id)
    ↓ (requête SQL JOIN supported + evaluations)
Database
    ↓ (retour JSON listée évaluations avec soutenances complètes)
Mobile Jury
    ↓ (écran JuryHomeScreen : liste des soutenances avec infos + notes le cas échéant)
```

### Flux 3 : Délibération (admin uniquement)

```
Admin (Web ou API directe)
    ↓ (POST /api/v1/evaluations/{id}/validate avec decision + mention + commentaire)
Backend (vérifie rôle admin_scolarite)
    ↓ (UPDATE evaluations SET status = validated, decision, mention, commented_deliberation, validated_at)
Database
    ✅ Toutes les notes passées en validated
    ↓ (RETour JSON statut validé + décision + mention)
Admin Web / Mobile
    ↓ (Affichage résultat final)
```

---

## 8. Problèmes d'intégration connus

1. **Incohérence `note_finale` vs `note_generale`** :
   - Modèle Laravel : `note_finale`
   - API mobile + interface Jury : `note_generale`
   - Les deux = note globale sur 20
   - **Action** : Documenter les deux, utiliser `note_generale` dans le nouveau flux mobile/Jury

2. **Affectation jury ↔ soutenance non formelle** :
   - Implicite via `Evaluation.jury_user_id` + `Evaluation.soutenance_id`
   - Pas de table de liaison formelle `jury_soutenance`
   - **Risque** : Un jury pourrait techniquement noter n'importe quelle soutenance
   - **Recommandation** : Vérifier que l'écran Jury n'affiche que les soutenances qui lui sont affectées

3. **Ancien système grille/critères en coexistence** :
   - Tables `evaluation_grids`, `evaluation_criteria`, `evaluation_scores`, `defense_evaluations` existent
   - Doivent rester en lecture seule pour compatibilité
   - Ne doivent pas être utilisées dans le nouveau flux Jury (note globale /20 seulement)

4. **Délibération réservée admin** :
   - L'API `validateDeliberation` ne doit pas être accessible depuis l'interface jury mobile
   - Vérification rôle nécessaire au-delà de `requireJury`

5. **Fallback démo** :
   - Si pas de token d'authentification, l'app mobile affiche `demoDefenses` fictives
   - À remplacer par des données réelles lors des tests avec serveur Laravel actif