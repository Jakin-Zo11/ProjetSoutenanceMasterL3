# Dossier de Référence Inter-Tâches - Documentation d'Intégration

> **Ce dossier est le contrat commun du projet.**
> Toute modification d'une donnée, API, relation ou workflow partagé doit être vérifiée contre ce dossier avant d'être effectuée.

## Objectif

Ce dossier sert de point d'entrée unique pour tous les membres du groupe travaillant sur le projet de gestion des soutenances de Master de l'EMIT Fianarantsoa. Il documente :
- Le workflow métier réel
- Les entités présentes dans le code
- Les dépendances entre les tâches
- Les contrats d'API
- L'état actuel de chaque composant
- Les contrats de tâche pour chaque module

Aucune modification d'une partie partagée du projet ne doit être effectuée sans avoir consulté d'abord ce dossier pour identifier les tâches impactées.

## Structure du dossier

| Fichier | Contenu |
|---------|---------|
| `README.md` | Point d'entrée : objectifs, règles importantes, fichiers à consulter |
| `workflow.md` | Workflow métier complet (Planning → Résultat final) |
| `entities.md` | Entités réellement présentes dans le code |
| `dependencies.md` | Matrice des dépendances entre tâches |
| `api-contracts.md` | Contrats d'API réellement existantes |
| `mobile-web-integration.md` | Relations Backend ↔ Web ↔ Mobile Étudiant ↔ Mobile Jury |
| `task-contracts.md` | Contrats détaillés pour chaque tâche du groupe |
| `current-state.md` | État réel du projet (DONE/PARTIAL/MOCK/BLOCKED/TODO) |

## Règles importantes

1. **Toute modification d'une donnée partagée** (soutenance_id, jury_user_id, note_generale/note_finale, status, etc.) doit être vérifiée contre ce dossier pour identifier les tâches impactées.

2. **Le nouveau flux Jury n'utilise jamais de grille ni de critères** : Chaque jury saisit une note globale sur 20. La réintroduire de quelque forme que ce soit est formellement interdite.

3. **Incohérence `note_finale` vs `note_generale`** : Documentée dans les fichiers entities.md et api-contracts.md. À standardiser mais ne pas corriger automatiquement dans le code pendant cette étape d'audit.

4. **Aucune migration, base de données ou fichier applicatif ne doit être modifié** pendant la présente étape d'audit (hors création de cette documentation).

5. **L'affectation jury ↔ soutenance** est implicite via `Evaluation.jury_user_id` et `Evaluation.soutenance_id`. Aucun table de liaison formelle `jury_soutenance` n'existe et n'a été créée pendant cette étape.

6. **L'ancien système grille/critères** (tables `evaluation_grids`, `evaluation_criteria`, `evaluation_scores`, `defense_evaluations`) reste en lecture seule pour compatibilité mais ne doit pas être utilisé dans le nouveau flux Jury.

## Workflow global confirmé

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

Chaque étape possède des dépendances fortes vers les étapes suivantes. Toute modification en amont (ex: Planning) doit être répercutée sur les étapes aval.

## Fichiers à consulter avant modification

### Avant de modifier le backend (routes, modèles, contrôleurs) :
1. `task-contracts.md` - Identifier quelles tâches utilisent les fichiers modifiés
2. `dependencies.md` - Vérifier les dépendances aval
3. `api-contracts.md` - Vérifier les contrats d'API impacted
4. `current-state.md` - Vérifier l'état actuel des composants

### Avant de modifier l'interface mobile (écrans Jury, Étudiant) :
1. `task-contracts.md` - Identifier la tâche concernée
2. `mobile-web-integration.md` - Vérifier le flux de données
3. `current-state.md` - Vérifier l'état actuel de l'interface mobile
4. `api-contracts.md` - Vérifier les API utilisées

### Avant de modifier l'API :
1. `api-contracts.md` - Documenter le contrat existant
2. `task-contracts.md` - Vérifier quelles tâches utilisent cette API
3. `dependencies.md` - Vérifier les dépendances aval et amont
4. `current-state.md` - Vérifier l'impact sur l'état actuel

## Dépendances inter-tâches - Avertissement

Les tâches suivantes ont des dépendances fortes qui doivent être respectées :

| Ordre | Tâche | Dépendance critique | Conséquence d'un non-respect |
|-------|-------|---------------------|------------------------------|
| 1 | Planning | Fournit dates/heures/salles | Sans planning, pas de soutenances possibles |
| 2 | Convocation | Dépend du Planning et de la Soutenance | Sans convocation, étudiants/jury mal informés |
| 3 | Soutenance | Dépend du Planning | Sans soutenance, pas de déroulement possible |
| 4 | Note Jury | Dépend de la Soutenance (soutenance_id) et de l'Authentification | Sans note, pas de délibération possible |
| 5 | Délibération | Dépend totalement de l'étape Note Jury (toutes les notes doivent exister) | Sans délibération, pas de résultat final |
| 6 | Résultat final | Dépend de la Délibération | Pas de résultat officiel sans délibération |

## Prochaines étapes recommandées

1. **Standardiser le nom `note_generale`** : Décider si le flux utilisera `note_generale` (mobile/API) ou `note_finale` (modèle Laravel) de façon cohérente
2. **Renforcer la vérification d'affectation** : S'assurer que le jury ne peut noter que ses soutenances assignées
3. **Renforcer la vérification rôle admin** : Dans `validateDeliberation`, vérifier formellement `admin_scolarite` au-delà de `requireJury`
4. **Documenter l'affectation Jury → Soutenance** : Même si implicite via Evaluation, la rendre formelle dans les contrats
5. **Mettre à jour la documentation** : Dès qu'une modification d'API ou de modèle est effectuée, mettre à jour `docs/project-integration/`

## Contact

En cas de doute sur l'impact d'une modification, consulter l'ensemble des fichiers de ce dossier avant d'agir. En cas de conflit entre informations, la règle suivante s'applique : **ne pas casser le workflow existant** (Planning → Convocation → Soutenance → Note Jury → Délibération → Résultat final).