# Entités Réellement présentes dans le code

Cette section documente uniquement les entités qui existent réellement dans le code Laravel et la base de données. Aucune entité théorique n'est ajoutée.

## User (Utilisateur)

- **Modèle/table** : `app/Models/User.php`, table `users`
- **Clé primaire** : `id`
- **Rôles disponibles** (via Spatie Permission) :
  - `admin_scolarite` - Administrateur scolaire
  - `president_jury` - Président de jury
  - `rapporteur` - Rapporteur
  - `examinateur` - Examinateur
  - `jury` - Membre de jury
  - `etudiant` - Étudiant
- **Méthodes utiles** :
  - `isAdminScolarite()`, `isPresidentMention()`, `isEtudiant()`
- **Utilisé par** : Authentification, contrôle d'accès, API
- **Web/Mobile** : Web (admin, jury), Mobile (jury, étudiant)

## Soutenance

- **Modèle/table** : `app/Models/Soutenance.php`, table `soutenances`
- **Clé primaire** : `id`
- **Champs fillables** : `depot_id`, `session_soutenance_id`, `room_id`, `date`, `status`, `remarques`
- **Relations** :
  - `depot()` → `BelongsTo(Depot)`
  - `sessionSoutenance()` → `BelongsTo(SessionSoutenance)`
  - `room()` → `BelongsTo(Room)`
  - `evaluations()` → `HasMany(Evaluation::class)` - Retourne les évaluations jury
  - `sessionsSoutenance()` → `BelongsTo(SessionSoutenance)`
- **Utilisé par** : Backend (toutes les parties), Mobile (jury, étudiant), Web (admin)
- **Web/Mobile** : Toutes les parties (Web, Mobile Étudiant, Mobile Jury)

## Evaluation (Modèle racine - Nouveau flux Jury)

- **Modèle/table** : `app/Models/Evaluation.php`, table `evaluations`
- **Clé primaire** : `id`
- **Champs fillables** : `soutenance_id`, `jury_user_id`, `note_presentation`, `note_manuscrit`, `note_reponses`, `note_finale`, `remarques`, `status`
- **Relations** :
  - `soutenance()` → `BelongsTo(Soutenance)` via `soutenance_id` ⬅ **Clé étrangère vers soutenances.id**
  - `juryUser()` → `BelongsTo(User)` via `jury_user_id` ⬅ **Clé étrangère vers users.id**
- **Champs de notation** (nouveau flux Jury) :
  - `note_finale` - Note globale sur 20 (modèle Laravel)
  - `note_presentation` - Note sur la présentation (optionnel)
  - `note_manuscrit` - Note sur le manuscrit (optionnel)
  - `note_reponses` - Note sur les réponses (optionnel)
  - `status` - Statut (draft, validated, etc.)
- **Utilisé par** : Nouveau flux Jury, administration
- **Web/Mobile** : Mobile (Jury), Web (admin)

**⚠️ Incohérence de nommage importante :**
- Le modèle Laravel possède `note_finale`
- L'API mobile et l'interface Jury utilisent `note_generale`
- Ces deux champs représentent la même chose : la note globale sur 20 saisie par le jury
- **Recommandation** : Documenter les deux noms mais privilégier `note_generale` dans le flux mobile/API

## Jury

- **Modèle/table** : Pas de modèle "Jury" dédié - l'identité jury est reprise dans le modèle `User` via le champ `role`
- **Identification** : Via le champ `role` de l'utilisateur (`admin_scolarite`, `president_jury`, `rapporteur`, `examinateur`, `jury`, `etudiant`)
- **Utilisé par** : Contrôle d'accès, API Jury mobile
- **Web/Mobile** : Mobile (jury), Web (admin)

## Étudiant

- **Modèle/table** : Non trouvé sous le nom "Étudiant" en tant que modèle Laravel séparé
- **Référence** : Présent via le modèle `Depot` et les relations `Soutenance`
- **Champs importants** : `matricule`, `email`, `telephone`, `formation`, `themeTitle`, `company`
- **Utilisé par** : Module Étudiant mobile, Web admin
- **Web/Mobile** : Mobile (étudiant), Web (admin)

## Créneau (Creneau)

- **Modèle/table** : `app/Models/Creneau.php`, table `creneaux`
- **Champs fillables** : `reference`, `heure_debut`, `heure_fin`, `jours`, `type`, `capacite`, `actif`
- **Relations** : Aucune relation directe notable
- **Utilisé par** : Backend (administration), Frontend (planning)
- **Web/Mobile** : Web (administration), Mobile (planification)

## Session de Soutenance

- **Modèle/table** : `app/Models/SessionSoutenance.php`
- **Champs importants** : `id`, `libelle`, `date_debut`, `date_fin`
- **Relations** → `Soutenance.sessionSoutenance()`
- **Utilisé par** : Backend administration
- **Web/Mobile** : Web administration

## Depot

- **Modèle/table** : Non affiché dans l'extrait mais présent dans le code
- **Relations** → `Soutenance.depot()`
- **Utilisé par** : Soutenance, Étudiant (dépôt de manuscrit)
- **Web/Mobile** : Mobile Étudiant, Web admin

## Room (Salle)

- **Modèle/table** : `app/Models/Room.php`
- **Champs importants** : `id`, `numéro_salle`
- **Relations** → `Soutenance.room()`
- **Utilisé par** : Soutenance, Planning
- **Web/Mobile** : Web administration, Mobile planning

## Convocation

- **Modèle/table** : Non trouvé comme modèle Laravel dédié
- **Référence** : Présent via les modèles `Soutenance` et `User`
- **Utilisé par** : Backend (routes convocation), Mobile (étudiant, jury)
- **Web/Mobile** : Mobile (étudiant, jury)

## Résultat Final

- **Modèle/table** : Non trouvé comme modèle Laravel dédié spécifique
- **Référence** : Basé sur les modèles `Evaluation` (validated status, decision, mention)
- **Utilisé par** : Backend (délibération), Frontend (résultats)
- **Web/Mobile** : Web (admin), Mobile (jury - consultation)

---

## Relations entre les entités clés

```
Soutenance (id)
    ├── évaluations → Evaluation (via soutenance_id) ✅
    └── convictions (via User/Étudiant)

Evaluation (id)
    ├── soutenance_id → Supported.id (FK) ✅
    ├── jury_user_id → User.id (FK) ✅
    ├── note_finale ← Note globale jury ⚠️ (diffère de note_generale mobile)
    └── status

User (id)
    └── jury_user_id → Evaluation (via jury_user_id) ✅
    └── rôles (admin_scolarite, president_jury, etc.)
```

---

## Ce qui manque dans le code

Les entités suivantes sont **référencées mais pas pleinement modélisées** (existent en base ou dans le code, mais sans modèle Laravel dédié ou relations complètes) :

- Table de liaison formelle `jury_soutenance` (n'existe pas)
- Identification Jury → Soutenance via moyen autre que Evaluation (implicite seulement)
- Interface admin d'affectation Jury → Soutenance

---

## Cohérences et Incohérences Critiques

### Cohérences ✅
- `Soutenance.id` ↔ `Evaluation.soutenance_id` ✅ (relation BelongsTo/Hasmany)
- `User.id` ↔ `Evaluation.jury_user_id` ✅ (relation BelongsTo)
- `Soutenance.evaluations()` ↔ `Evaluation.soutenance()` ✅

### Incohérences ⚠️ (À documenter, ne pas corriger dans le code)
1. **`note_finale` (modèle Evaluation) vs `note_generale` (API mobile / interface Jury)** :
   - Les deux représentent la note globale sur 20 saisie par le jury
   - `note_finale` est le nom du champ en base/Laravel
   - `note_generale` est le nom utilisé dans l'API mobile et l'interface
   - **Impact** : Les développeurs doivent être conscients de cette différence selon qu'ils travaillent sur le backend ou le frontend mobile
   - **Recommandation** : Utiliser de façon cohérente `note_generale` dans le nouveau flux mobile/Jury, `note_finale` restant en base

2. **`defense_id` dans `DefenseEvaluation` sans lien vers `Soutenance.id`** ❌ :
   - Le modèle `DefenseEvaluation` possède `defense_id` mais sans relation Eloquent vers `Soutenance`
   - Cette table appartient à l'ancien système grille/critères et n'est plus utilisée
   - **Action** : Laisser en lecture seule pour compatibilité, ne pas supprimer

3. **Ancien système grille/critères coexiste avec nouveau flux note globale** ⚠️ :
   - Tables `evaluation_grids`, `evaluation_criteria`, `evaluation_scores`, `defense_evaluations` existent
   - Elles ne doivent **pas** être considérées comme le flux métier Jury actuel
   - **Action** : Conserver pour compatibilité, ne pas y faire référence dans le nouveau code

4. **Méthode `validateDeliberation` ne vérifie pas formellement le rôle admin** ⚠️ :
   - La méthode utilise `requireJury` mais ne vérifie pas formellement `admin_scolarite`
   - **Action** : Renforcer la vérification des droits

---

## Nouveau flux Jury - Résumé

Le flux attendu côté Jury est :

```
Jury connecté
    → voit les soutenances qui lui sont destinées (via GET /api/v1/evaluations/assigned)
    → ouvre une soutenance
    → consulte étudiant / thème / date / heure / salle
    → saisit une note globale sur 20 (champ note_generale / note_finale)
    → peut ajouter un commentaire
    → enregistre sa note
    → plusieurs jurys peuvent donner chacun leur note
    → ensuite intervient la délibération
    → puis le résultat final
```

**Ne contient jamais :**
- Grille d'évaluation
- Critères d'évaluation à remplir par critère
- Saisie par critère

Les anciennes tables (`evaluation_grids`, `evaluation_criteria`, `evaluation_scores`, `defense_evaluations`) restent en lecture seule pour compatibilité mais ne doivent pas être utilisées dans le nouveau flux.