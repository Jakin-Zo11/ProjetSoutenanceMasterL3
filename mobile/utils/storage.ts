
 // utils/storage.ts - Stockage cross-platform Web et Native
 // Web : localStorage
 // Android / iOS : expo-secure-store

type PlatformType = 'web' | 'native';

const getPlatform = (): PlatformType => {
  return typeof window !== 'undefined' ? 'web' : 'native';
};

// Stockage Web
const webStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.debug('WebStorage.getItem error:', error);
    }

    return null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.debug('WebStorage.setItem error:', error);
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.debug('WebStorage.removeItem error:', error);
    }
  },
};

// Interface commune au stockage natif
type NativeStorage = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  removeItemAsync: (key: string) => Promise<void>;
};

let nativeStorage: NativeStorage | null = null;
let nativeStoragePromise: Promise<void> | null = null;

// Initialisation de SecureStore une seule fois
const initNativeStorage = async (): Promise<void> => {
  if (nativeStorage) {
    return;
  }

  if (!nativeStoragePromise) {
    nativeStoragePromise = (async () => {
      try {
        const SecureStoreModule = await import('expo-secure-store');
        const SecureStore = SecureStoreModule.default;

        nativeStorage = {
          getItemAsync: async (key: string): Promise<string | null> => {
            try {
              return await SecureStore.getItemAsync(key);
            } catch (error) {
              console.debug('SecureStore.getItemAsync error:', error);
              return null;
            }
          },

          setItemAsync: async (
            key: string,
            value: string,
          ): Promise<void> => {
            try {
              await SecureStore.setItemAsync(key, value);
            } catch (error) {
              console.debug('SecureStore.setItemAsync error:', error);
              throw error;
            }
          },

          removeItemAsync: async (key: string): Promise<void> => {
            try {
              await SecureStore.deleteItemAsync(key);
            } catch (error) {
              console.debug('SecureStore.deleteItemAsync error:', error);
              throw error;
            }
          },
        };
      } catch (error) {
        console.debug('Could not initialize SecureStore:', error);
        nativeStorage = null;
      }
    })();
  }

  await nativeStoragePromise;
};

// Initialisation anticipée pour Native
if (getPlatform() === 'native') {
  void initNativeStorage();
}

// Interface unifiée Web / Native
export const storage = {
  // Méthodes synchrones : Web uniquement
  getItem(key: string): string | null {
    if (getPlatform() === 'web') {
      return webStorage.getItem(key);
    }

    return null;
  },

  setItem(key: string, value: string): void {
    if (getPlatform() === 'web') {
      webStorage.setItem(key, value);
    }
  },

  removeItem(key: string): void {
    if (getPlatform() === 'web') {
      webStorage.removeItem(key);
    }
  },

  // Méthodes asynchrones : Web et Native
  async getItemAsync(key: string): Promise<string | null> {
    if (getPlatform() === 'web') {
      return webStorage.getItem(key);
    }

    await initNativeStorage();

    if (nativeStorage) {
      return nativeStorage.getItemAsync(key);
    }

    return null;
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (getPlatform() === 'web') {
      webStorage.setItem(key, value);
      return;
    }

    await initNativeStorage();

    if (!nativeStorage) {
      throw new Error(
        'SecureStore indisponible : impossible de sauvegarder la donnée.',
      );
    }

    await nativeStorage.setItemAsync(key, value);
  },

  async removeItemAsync(key: string): Promise<void> {
    if (getPlatform() === 'web') {
      webStorage.removeItem(key);
      return;
    }

    await initNativeStorage();

    if (!nativeStorage) {
      throw new Error(
        'SecureStore indisponible : impossible de supprimer la donnée.',
      );
    }

    await nativeStorage.removeItemAsync(key);
  },
};

// Récupérer le token du jury
export const getJuryToken = async (): Promise<string | null> => {
  return storage.getItemAsync('emit_jury_sanctum_token');
};

// Enregistrer le token du jury
export const setJuryToken = async (token: string): Promise<void> => {
  await storage.setItemAsync('emit_jury_sanctum_token', token);
};

// Supprimer le token du jury
export const removeJuryToken = async (): Promise<void> => {
  await storage.removeItemAsync('emit_jury_sanctum_token');
};
