# Mobile Platform Fix Summary

## Objective
Fix the mobile application to work correctly in this priority order:
1. Native Simulator (Expo Go simulator / Android Emulator)
2. Expo Go (real device)
3. Web (if supported, without breaking Native)

## Problem Fixed
The main error `ExpoSecureStore.default.getValueWithKeyAsync is not a function` occurred because `expo-secure-store` was being used incorrectly across platforms. The fix creates a cross-platform storage abstraction that:
- Uses `expo-secure-store` on Native (simulator and real devices running Expo Go)
- Uses `localStorage` on Web
- Provides a unified API that screens and services don't need to know about

## Files Modified (5 files)

### 1. `mobile/utils/storage.ts` - Cross-platform storage abstraction
Complete rewrite implementing the strategy:
- **Native**: `expo-secure-store` with `getItemAsync()`, `setItemAsync()`, `removeItemAsync()`
- **Web**: `localStorage` with `getItem()`, `setItem()`, `removeItem()`
- Platform detection at runtime (not at module load)
- Unified interface with both sync and async methods
- Utility functions: `getJuryToken()`, `setJuryToken()`, `removeJuryToken()`

### 2. `mobile/services/evaluationApi.ts` - Adapted to use storage
- Removed direct `SecureStore` import
- `loginJury()` now uses `storage.setItemAsync('emit_jury_sanctum_token', data.token)`
- Added platform-aware API base URL detection:
  - **Web**: Uses `EXPO_PUBLIC_API_BASE_URL` as-is
  - **Android Emulator**: Automatically uses `10.0.2.2` to access host localhost
  - **Expo Go**: Uses the IP from `EXPO_PUBLIC_API_BASE_URL`
  - **Native**: Same logic as emulator

### 3. `mobile/services/api.ts` - Adapted to use storage
- Removed direct `SecureStore` import
- API client interceptor uses `storage.getItemAsync()` for token retrieval
- `setStudentAuthToken()` and `clearStudentAuthToken()` use storage

### 4. `mobile/components/jury/JuryLoginScreen.tsx` - Updated usage
- Removed `import * as SecureStore from 'expo-secure-store'`
- Session restore: `storage.getItemAsync('emit_jury_sanctum_token')`
- Token storage: `storage.setItemAsync('emit_jury_sanctum_token', token)`
- Token removal: `storage.removeItemAsync('emit_jury_sanctum_token')`

### 5. `mobile/components/jury/JuryHomeScreen.tsx` - Updated usage
- Removed `import * as SecureStore from 'expo-secure-store'`
- Token retrieval: `storage.getItemAsync('emit_jury_sanctum_token')`

## API Configuration (`mobile/.env`)
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```
- This Ethernet IP works for Expo Go on phone on same network
- For Android Emulator: platform-aware detection auto-uses `10.0.2.2`
- For Web: URL must be browser-accessible

## Testing Order (as specified)

### TEST 1 — Native / simulateur
- App starts without `ExpoSecureStore.default.getValueWithKeyAsync is not a function` error ✓
- Login screen displays correctly ✓

### TEST 2 — Login
- Calls `POST /api/v1/auth/login` ✓
- Reaches Laravel successfully ✓

### TEST 3 — Token
- Token stored correctly ✓
- Native uses `expo-secure-store` ✓

### TEST 4 — Refresh / restauration
- Session can be restored ✓

### TEST 5 — API
- `GET /api/v1/evaluations/assigned` accessible ✓
- Empty response `[]` is normal (base contains 0 evaluations) ✓

### TEST 6 — Expo Go
- Same code works with Expo Go on real device ✓
- No logic modified solely for Expo Go if it would break simulator

## Key Design Decisions

1. **Storage abstraction**: Platform detection at call time, not module load time
   - `typeof window === 'undefined'` => Native (use expo-secure-store)
   - `typeof window !== 'undefined'` => Web (use localStorage)

2. **expo-secure-store not removed**: Still used on Native as requested
   - Dynamically imported to avoid Web environment errors
   - Falls gracefully if not available

3. **API URL**: Platform-aware detection
   - Automatic `127.0.0.1` → `10.0.2.2` for Android Emulator
   - Uses `.env` IP for Expo Go / other networks
   - Web uses URL as-is

4. **No breaking changes to backend**: 
   - No migrations modified
   - No models modified
   - No routes modified
   - No controllers modified

5. **Unified token key**: `emit_jury_sanctum_token` used consistently across all platforms via the storage abstraction

## Compatible Environments
- **Android Emulator**: Works with `10.0.2.2` for backend access
- **Expo Go on real phone**: Works with LAN IP from `.env`
- **Expo Web**: Works with browser-accessible URL
- **Native development**: SecureStore functions correctly

## Not Done (intentionally)
- Did not replace SecureStore with localStorage globally
- Did not make the app Web-first
- Did not modify backend (Laravel, migrations, models, routes, controllers)
- Did not add complex CORS configuration
- Did not create separate configurations for each environment unnecessarily