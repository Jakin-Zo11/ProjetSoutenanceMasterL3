# Contrats d'API Réalistes

Cette section documente les API réellement présentes et utilisées dans le projet, basées sur l'analyse du code backend et mobile.

## Avertissement Important
Les noms de champs suivants nécessitent une attention particulière en raison d'incohérences de nommage :
- `note_finale` (modèle Laravel `Evaluation`) vs `note_generale` (API mobile)
- `commentaire` (modèle) vs `commentaire` (API mobile)
- `status` (commun) vs `evaluation_status` (non utilisé)

## API Authentification

### POST /api/v1/auth.login
- **Méthode** : POST
- **URL** : `/api/v1/auth.login`
- **Contrôleur** : `AuthController@login`
- **Authentification** : Non authentifié
- **Paramètres** :
  - `email` (string) - Email de l'utilisateur
  - `password` (string) - Mot de passe
- **Payload** : `{"email": "scolarite@emit.mg", "password": "password123"}`
- **Réponse** :
  ```json
  {
    "success": true,
    "token": "token_sanctum",
    "user": {
      "id": 1,
      "name": "Nom Utilisateur",
      "email": "scolarite@emit.mg",
      "roles": ["admin_scolarite"]
    }
  }
- **Consommateur** : Mobile (Jury/Login Screen), Web (admin)
- **État** : ✅ Réaliste et utilisé

### GET /api/v1/auth.me
- **Méthode** : GET
- **URL** : `/api/v1/auth.me`
- **Contrôleur** : `AuthController@me`
- **Authentification** : `auth:sanctum`
- **Paramètres** : Aucun (utilise token dans header)
- **Réponse** :
  ```json
  {
    "id": 1,
    "name": "Nom Utilisateur",
    "email": "scolarite@emit.mg",
    "roles": ["admin_scolarite"]
  }
- **Consommateur** : Mobile (vérification rôle), Web (admin)
- **État** : ✅ Réaliste

### POST /api/v1/auth.logout
- **Méthode** : POST
- **URL** : `/api/v1/auth.logout`
- **Authentification** : `auth:sanctum`
- **Paramètres** : Aucun spécifique
- **Réponse** : `{ "success": true }`
- **Consommateur** : Mobile (Jury), Web (admin)
- **État** : ✅ Réaliste

## API Évaluations (Jury)

### GET /api/v1/evaluations/assigned
- **Méthode** : GET
- **URL** : `/api/v1/evaluations/assigned`
- **Contrôleur** : `DefenseEvaluationController@assigned` *(maintenant modifié pour utiliser Evaluation racine)*
- **Authentification** : `auth:sanctum` + rôle `jury` ou `admin`
- **Paramètres** : Aucun (utilise token dans header)
- **Payload** : Aucun
- **Réponse** :
  ```json
  [
    {
      "id": 1,
      "soutenance_id": 12,
      "student_name": "Jean Rakoto",
      "theme": "Optimisation des algorithmes",
      "date": "11/11/2026",
      "heure": "Non disponible",
      "salle": "Salle non disponible",
      "status": "evaluation_en_attente",
      "note_generale": 15,
      "commentary": null
    }
  ]
- **Consommateur** : Mobile (JuryHomeScreen - listes des soutenances)
- **État** : ✅ Réaliste - Modifié pour utiliser `Evaluation` (racine) avec `jury_user_id` et relation `soutenance`
- **Identifiants** : `soutenance_id`, `jury_user_id`

### POST /api/v1/evaluations
- **Méthode** : POST
- **URL** : `/api/v1/evaluations`
- **Contrôleur** : `DefenseEvaluationController@store` *(maintenant adapté pour flux note globale)*
- **Authentification** : `auth:sanctum` + `requireJury`
- **Paramètres** :
  - `soutenance_id` (integer, requis) - ID de la soutenance
  - `note_generale` (numeric, requis) - Note sur 20
  - `commentaire` (string, optionnel) - Commentaire
- **Payload** : `{"soutenance_id": 12, "note_generale": 15, "commentaire": "Bonne soutenance"}`
- **Réponse** :
  ```json
  {
    "id": 1,
    "soutenance_id": 12,
    "note_generale": 15,
    "commentaire": "Bonne soutenance",
    "status": "draft"
  }
- **Consommateur** : Mobile (JuryHomeScreen - saisie note)
- **État** : ✅ Réaliste - Crée/Met à jour une Evaluation avec note globale
- **Identifiants** : `soutenance_id`, `jury_user_id`, `note_generale`

### PUT /api/v1/evaluations/{id} *(via updateNote)*
- **Méthode** : PUT
- **URL** : `/api/v1/evaluations/{id}`
- **Contrôleur** : `DefenseEvaluationController@updateNote` *(méthode ajoutée)*
- **Authentification** : `auth:sanctum` + vérification `jury_user_id === user.id`
- **Paramètres** :
  - `note_generale` (numeric, requis) - Note sur 20
  - `commentaire` (string, optionnel)
- **Payload** : `{"note_generale": 16, "commentaire": "Amélioration"}`
- **Réponse** :
  ```json
  {
    "id": 1,
    "note_generale": 16,
    "commentaire": "Amélioration",
    "status": "draft"
  }
- **Consommateur** : Mobile (JuryHomeScreen - modification note)
- **État** : ✅ Nouveau - Méthode ajoutée pour le flux actuel
- **Identifiants** : `id` (évaluation), `note_generale`, `commentaire`

### POST /api/v1/evaluations/{id}/validate
- **Méthode** : POST
- **URL** : `/api/v1/evaluations/{id}/validate`
- **Contrôleur** : `DefenseEvaluationController@validateDeliberation`
- **Authentification** : `auth:sanctum` + `requireJury` *(vérification de rôle approximative)*
- **Paramètres** :
  - `decision` (string, requis) - Ex: "Admis", "Ajourné"
  - `mention` (string, optionnel) - Ex: "Mention Très Bien"
  - `commentaire_deliberation` (string, optionnel)
- **Payload** : `{"decision": "Admis", "mention": "TB", "commentaire_deliberation": "Soutenance réussie"}`
- **Réponse** :
  ```json
  {
    "id": 1,
    "status": "validated",
    "decision": "Admis",
    "mention": "TB",
    "commentaire_deliberation": "Soutenance réussie",
    "validated_at": "2026-10-15T14:30:00"
  }
- **Consommateur** : Web (admin personne autorisée), Mobile (Jury - mais ne devrait pas'utiliser cette API directement)
- **État** : ⚠️ Attention - La méthode ne vérifie pas formellement le rôle admin au-delà de `requireJury`
- **Identifiants** : `id` (évaluation), `decision`, `mention`, `commentaire_deliberation`

## API Soutenance

### GET /api/soutenances
- **Méthode** : GET
- **URL** : `/api/soutenances`
- **Contrôleur** : `SoutenanceAdminController@index`
- **Authentification** : `auth:sanctum` + `role:admin_scolarite`
- **Paramètres** : Aucun
- **Réponse** : Tableau d'objets Soutenance
- **Consommateur** : Web (admin)
- **État** : ✅ Réaliste

### GET /api/soutenances/{id}/pv
- **Méthode** : GET
- **URL** : `/api/soutenances/{id}/pv`
- **Contrôleur** : `PvSoutenanceController@getPv`
- **Authentification** : `auth:sanctum` + `role:admin_scolarite`
- **Paramètres** : `id` (ID de la soutenance)
- **Réponse** : Procès-verbal de la soutenance
- **Consommateur** : Web (admin)
- **État** : ✅ Réaliste

## API Créneaux

### GET /api/creneaux
- **Méthode** : GET
- **URL** : `/api/creneaux`
- **Contrôleur** : `CreneauController@index`
- **Authentification** : `auth:sanctum` (peut être admin ou jury)
- **Paramètres** : Aucun
- **Réponse** : Tableau d'objets Creneau
- **Consommateur** : Web (administration), Mobile (planification)
- **État** : ✅ Réaliste

## API Étudiant

### POST /api/v1/student.login
- **Méthode** : POST
- **URL** : `/api/v1/student.login`
- **Contrôleur** : `StudentAuthController@login`
- **Authentification** : Non authentifié
- **Paramètres** :
  - `matricule` (string)
  - `password` (string)
- **Payload** : `{"matricule": "001I24", "password": "password123"}`
- **Réponse** :
  ```json
  {
    "token": "token_étudiant",
    "user": { "id": 1, "name": "Étudiant Nom" }
  }
- **Consommateur** : Mobile (Étudiant)
- **État** : ✅ Réaliste

### GET /api/v1/student.profile
- **Méthode** : GET
- **URL** : `/api/v1/student.profile`
- **Authentification** : `auth:sanctum` + `role:etudiant`
- **Paramètres** : Aucun
- **Réponse** : Informations profil étudiant
- **Consommateur** : Mobile (Étudiant)
- **État** : ✅ Réaliste

## Problèmes de Nomage Repérés

1. **note_finale** (modèle Evaluation) vs **note_generale** (API mobile) :
   - Le modèle Laravel possède `note_finale`
   - L'API mobile et l'interface utilisent `note_generale`
   - **Recommandation** : Standardiser sur `note_generale` pour le flux Jury

2. **commentaire** (modèle) vs **commentaire** (API) :
   - Utilisation cohérente mais à vérifier selon les contextes

3. **status** (commun) vs **evaluation_status** (non utilisé) :
   - Le modèle possède `status`
   - Certains contextes utilisent des valeurs différentes

## Identifiants Utilisés

- `soutenance_id` - Identifiant de la soutenance (utilisé dans Evaluation, routes)
- `jury_user_id` - Identifiant du jury/utilisateur (Evaluation, User)
- `evaluation_id` - Identifiant de l'évaluation
- `id` - Identifiant général (modèles, API responses)
- `session_id` - Identifiant de session (SessionSoutenance)
- `room_id` - Identifiant de salle
- `depot_id` - Identifiant de dépôt

## Recommandation d'Identifiants
Utiliser de manière cohérente :
- `soutenance_id` pour rattacher à une soutenance
- `jury_user_id` pour rattacher à un jury/utilisateur
- `evaluation_id` pour identifiant d'évaluation individ
- Éviter la confusion entre `note_finale` et `note_generale`