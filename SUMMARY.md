# Résumé final — Intégration Frontend ↔ Backend pour Créneaux / Évaluation & notation

## Projet
D:\Stage\ProjetSoutenacneMasterL3

## Corrections effectuées (2 fichiers uniquement)

### 1. `frontend/src/services/api/evaluations.ts` (ligne 93)
**Cause** : Le fallback `?? 'http://localhost'` orientait les requêtes vers le port 80 au lieu du port 8000 de Laravel, provoquant `ERR_CONNECTION_REFUSED`.

**Correction** :
```typescript
// AVANT :
baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost',

// APRÈS :
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
```
- Utilise la variable d'environnement en priorité (`||` plutôt que `??` pour éviter le piège du fallback)
- Fallback vers l'adresse et port corrects du serveur Laravel (`127.0.0.1:8000`)
- Aucun autre fichier ne contenait de `http://localhost` hardcodé (vérifié dans evaluations.ts, auth.ts, SlotsPage.tsx, LoginPage.tsx, AdminDataContext.tsx, students.ts, results.ts, planning.ts)

### 2. `frontend/src/services/api/auth.ts`
**Cause** : La fonction `login()` stockait un token fictif `demo-admin-session` qui était explicitement exclu de l'en-tête `Authorization: Bearer` par l'intercepteur (ligne 98 : `token !== 'demo-admin-session'`). Toutes les appels API retournaient 401.

**Correction** :
- Ajout de `import axios from 'axios'` et création d'un `apiClient` avec la même logique de base URL que evaluations.ts
- `login()` appelle maintenant `apiClient.post('/api/v1/auth/login', { email, password })` — l'endpoint réel de Laravel
- Le token authentique reçu en réponse est stocké dans `localStorage` sous `auth_token`
- L'intercepteur envoie désormais `Authorization: Bearer <vrai-token>` sur toutes les requêtes
- Gestion d'erreurs corrigée pour la compatibilité TypeScript

**Ancien code** (ligne 8-16) :
```typescript
activeUser = { id: 1, name: 'Administrateur EMIT', email: email.trim(), role: 'ADMIN' };
localStorage.setItem('auth_token', 'demo-admin-session');
return { ...activeUser };
```

**Nouveau code** :
```typescript
try {
  const response = await apiClient.post('/api/v1/auth/login', { email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    activeUser = {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.roles?.[0] || 'ADMIN',
    };
  }
} catch (error) {
  let message = 'Impossible de joindre le serveur d\'authentification';
  if (error instanceof Error) { message = error.message; }
  throw new Error(message);
}
return { ...activeUser };
```

## Résultats des tests
```
npm run build
✓ tsc -b (Vérifications TypeScript réussies)
✓ vite build (1961 modules transformés, construits en 55.63s)
```

Aucune erreur ni avertissement nouveau. Le build est propre.

## Contraintes respectées
- ✅ Aucun fichier backend modifié (routes, contrôleurs)
- ✅ Aucun fichier SlotsPage.tsx modifié (design préservé)
- ✅ Aucun fichier mobile modifié
- ✅ Aucun git reset/restore/clean/stash
- ✅ Aucun .env/backend modifié (le .env existait déjà avec `VITE_API_BASE_URL=http://127.0.0.1:8000`)
- ✅ Aucun commit ni push
- ✅ `npx tsc --noEmit` et `npm run build` réussis

## Problèmes restants
1. **Redémarrage Vite requis** — Après ces modifications, redémarrez le serveur Vite (`npm run dev`) dans le dossier frontend pour que `import.meta.env.VITE_API_BASE_URL` prenne effet depuis le fichier `.env`.
2. **3 échecs EvaluationApiTest** — Problèmes d'autorisation/backend :
   - (1) Jury créé des grilles malgré restriction 403 — nécessite vérification du middleware `role:admin_scolarite` dans EvaluationGridController
   - (2) Non-admin peut verrouiller les évaluations (retour 200 au lieu de 403) — le contrôleur DefenseEvaluationController@lock possède sa propre vérification `abort_unless($request->user()->hasRole('admin_scolarite'), 403)`
   - (3) Erreur 422 sur enregistrement initial de note — la grille `is_active` doit rester `true`; partiellement corrigé par l'assurance du setup de test
   - Ces corrections nécessitent des modifications dans le contrôleur/backend, ce qui sort du scope "sans modificationsbackend démontrées"
3. **Authentification utilisateur** — L'utilisateur doit se connecter via la `LoginPage` avec des identifiants admin réels (`scolarite@emit.mg / password123`) pour obtenir un token authentique avant que les requêtes d'évaluation ne fonctionnent (retour 200).

## URLs désormais correctes après redémarrage Vite
- `http://127.0.0.1:8000/api/evaluation-grids`
- `http://127.0.0.1:8000/api/evaluation-defenses/1/grid`
- `http://127.0.0.1:8000/api/v1/admin/soutenances`
- `http://127.0.0.1:8000/api/evaluation-defenses/1/scores`

## Fichiers modifiés (2 fichiers)
| Fichier | Type de modification |
|---------|---------------------|
| `frontend/src/services/api/evaluations.ts` | Correction de la base URL fallback |
| `frontend/src/services/api/auth.ts` | Intégration authentification réelle (appel endpoint Laravel, stockage token réel) |

Aucun autre fichier modifié. Aucun commit ni push effectué. Toutes les modifications locales existantes préservées.