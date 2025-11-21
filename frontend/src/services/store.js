import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global application state using Zustand
 */

export const useStore = create(
  persist(
    (set, get) => ({
      // API Keys
      apiKeys: {
        anthropic: '',
        openai: '',
        google: '',
      },
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      // User Preferences
      preferences: {
        defaultProvider: 'anthropic',
        defaultModel: 'claude-3-5-sonnet-20241022',
        theme: 'light',
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      // Current Workflow
      currentWorkflow: 'legal-transcript',
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      // Processing State
      isProcessing: false,
      setIsProcessing: (status) => set({ isProcessing: status }),

      // Results History (for current session)
      resultsHistory: [],
      addResult: (result) =>
        set((state) => ({
          resultsHistory: [
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              ...result,
            },
            ...state.resultsHistory,
          ].slice(0, 10), // Keep last 10 results
        })),
      clearHistory: () => set({ resultsHistory: [] }),

      // Cost Tracking
      totalCostSession: 0,
      addCost: (cost) =>
        set((state) => ({
          totalCostSession: state.totalCostSession + cost,
        })),
      resetCost: () => set({ totalCostSession: 0 }),
    }),
    {
      name: 'synk-workflows-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        preferences: state.preferences,
      }),
    }
  )
);

export default useStore;
