import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Store {
  apiKey: string | null;
  apiSecret: string | null;
  privateKey: string | null;
  solanaAddress: string | null;
  setApiKey: (key: string) => Promise<void>;
  setApiSecret: (secret: string) => Promise<void>;
  setPrivateKey: (privateKey: string) => Promise<void>;
  setSolanaAddress: (solanaAddress: string) => Promise<void>;
  loadCredentials: () => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  apiKey: null,
  apiSecret: null,
  privateKey: null,
  solanaAddress: null,

  setApiKey: async (apiKey: string) => {
    await SecureStore.setItemAsync('API_KEY', apiKey);
    set({ apiKey });
  },

  setApiSecret: async (apiSecret: string) => {
    await SecureStore.setItemAsync('SECRET_KEY', apiSecret);
    set({ apiSecret });
  },

  setPrivateKey: async (privateKey: string) => {
    await SecureStore.setItemAsync('PRIVATE_KEY', privateKey);
    set({ privateKey });
  },

  setSolanaAddress: async (solanaAddress: string) => {
    await SecureStore.setItemAsync('SOLANA_ADDRESS', solanaAddress);
    set({ solanaAddress });
  },

  loadCredentials: async () => {
    try {
      console.log('[Store] Loading credentials...');
      const storedApiKey = await SecureStore.getItemAsync('API_KEY');
      const storedApiSecret = await SecureStore.getItemAsync('SECRET_KEY');
      const storedPrivateKey = await SecureStore.getItemAsync('PRIVATE_KEY');
      const storedSolanaAddress = await SecureStore.getItemAsync('SOLANA_ADDRESS');
      
      console.log('[Store] Credentials loaded:', {
        hasApiKey: !!storedApiKey,
        hasApiSecret: !!storedApiSecret,
        hasPrivateKey: !!storedPrivateKey,
        hasSolanaAddress: !!storedSolanaAddress
      });

      set({
        apiKey: storedApiKey || '',
        apiSecret: storedApiSecret || '',
        privateKey: storedPrivateKey || '',
        solanaAddress: storedSolanaAddress || ''
      });
    } catch (error) {
      console.error('[Store] Error loading credentials:', error);
    }
  },
}));
