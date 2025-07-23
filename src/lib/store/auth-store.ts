import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponseDto } from '@/lib/api/types';

// Authentication preferences that should persist
interface AuthPreferences {
  rememberMe: boolean;
  lastLoginEmail: string | null;
  preferredLoginMethod: 'email' | 'social';
  autoLogout: boolean;
  autoLogoutDuration: number; // in minutes
}

// Authentication UI state
interface AuthUIState {
  showLoginForm: boolean;
  showRegisterForm: boolean;
  showForgotPasswordForm: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  loginFormStep: 'credentials' | 'verification' | 'complete';
  registerFormStep: 'details' | 'verification' | 'complete';
}

// Authentication store state
interface AuthStoreState {
  // Preferences
  preferences: AuthPreferences;
  
  // UI State
  ui: AuthUIState;
  
  // Session management
  lastActivity: number | null;
  sessionWarningShown: boolean;
  
  // Actions for preferences
  setRememberMe: (remember: boolean) => void;
  setLastLoginEmail: (email: string | null) => void;
  setPreferredLoginMethod: (method: 'email' | 'social') => void;
  setAutoLogout: (enabled: boolean) => void;
  setAutoLogoutDuration: (duration: number) => void;
  
  // Actions for UI state
  showLogin: () => void;
  showRegister: () => void;
  showForgotPassword: () => void;
  hideAllForms: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  setLoginFormStep: (step: AuthUIState['loginFormStep']) => void;
  setRegisterFormStep: (step: AuthUIState['registerFormStep']) => void;
  
  // Actions for session management
  updateLastActivity: () => void;
  setSessionWarningShown: (shown: boolean) => void;
  resetSession: () => void;
  
  // Utility actions
  resetUI: () => void;
  resetPreferences: () => void;
}

// Default preferences
const defaultPreferences: AuthPreferences = {
  rememberMe: false,
  lastLoginEmail: null,
  preferredLoginMethod: 'email',
  autoLogout: true,
  autoLogoutDuration: 30, // 30 minutes
};

// Default UI state
const defaultUIState: AuthUIState = {
  showLoginForm: true,
  showRegisterForm: false,
  showForgotPasswordForm: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  loginFormStep: 'credentials',
  registerFormStep: 'details',
};

// Create the authentication store
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      ui: defaultUIState,
      lastActivity: null,
      sessionWarningShown: false,

      // Preference actions
      setRememberMe: (remember) =>
        set((state) => ({
          preferences: { ...state.preferences, rememberMe: remember },
        })),

      setLastLoginEmail: (email) =>
        set((state) => ({
          preferences: { ...state.preferences, lastLoginEmail: email },
        })),

      setPreferredLoginMethod: (method) =>
        set((state) => ({
          preferences: { ...state.preferences, preferredLoginMethod: method },
        })),

      setAutoLogout: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, autoLogout: enabled },
        })),

      setAutoLogoutDuration: (duration) =>
        set((state) => ({
          preferences: { ...state.preferences, autoLogoutDuration: duration },
        })),

      // UI actions
      showLogin: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showLoginForm: true,
            showRegisterForm: false,
            showForgotPasswordForm: false,
          },
        })),

      showRegister: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showLoginForm: false,
            showRegisterForm: true,
            showForgotPasswordForm: false,
          },
        })),

      showForgotPassword: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showLoginForm: false,
            showRegisterForm: false,
            showForgotPasswordForm: true,
          },
        })),

      hideAllForms: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showLoginForm: false,
            showRegisterForm: false,
            showForgotPasswordForm: false,
          },
        })),

      openLoginModal: () =>
        set((state) => ({
          ui: { ...state.ui, isLoginModalOpen: true },
        })),

      closeLoginModal: () =>
        set((state) => ({
          ui: { ...state.ui, isLoginModalOpen: false },
        })),

      openRegisterModal: () =>
        set((state) => ({
          ui: { ...state.ui, isRegisterModalOpen: true },
        })),

      closeRegisterModal: () =>
        set((state) => ({
          ui: { ...state.ui, isRegisterModalOpen: false },
        })),

      setLoginFormStep: (step) =>
        set((state) => ({
          ui: { ...state.ui, loginFormStep: step },
        })),

      setRegisterFormStep: (step) =>
        set((state) => ({
          ui: { ...state.ui, registerFormStep: step },
        })),

      // Session management actions
      updateLastActivity: () =>
        set(() => ({
          lastActivity: Date.now(),
          sessionWarningShown: false,
        })),

      setSessionWarningShown: (shown) =>
        set(() => ({
          sessionWarningShown: shown,
        })),

      resetSession: () =>
        set(() => ({
          lastActivity: null,
          sessionWarningShown: false,
        })),

      // Utility actions
      resetUI: () =>
        set((state) => ({
          ui: defaultUIState,
        })),

      resetPreferences: () =>
        set((state) => ({
          preferences: defaultPreferences,
        })),
    }),
    {
      name: 'auth-store',
      // Only persist preferences, not UI state or session data
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);

// Selectors for common use cases
export const useAuthPreferences = () => useAuthStore((state) => state.preferences);
export const useAuthUI = () => useAuthStore((state) => state.ui);
export const useSessionState = () => useAuthStore((state) => ({
  lastActivity: state.lastActivity,
  sessionWarningShown: state.sessionWarningShown,
}));

// Hook for session timeout management
export function useSessionTimeout() {
  const { preferences } = useAuthStore();
  const { lastActivity, sessionWarningShown } = useSessionState();
  const { updateLastActivity, setSessionWarningShown, resetSession } = useAuthStore();

  const isSessionExpired = () => {
    if (!preferences.autoLogout || !lastActivity) return false;
    
    const timeoutDuration = preferences.autoLogoutDuration * 60 * 1000; // Convert to milliseconds
    return Date.now() - lastActivity > timeoutDuration;
  };

  const getTimeUntilExpiration = () => {
    if (!preferences.autoLogout || !lastActivity) return null;
    
    const timeoutDuration = preferences.autoLogoutDuration * 60 * 1000;
    const timeRemaining = timeoutDuration - (Date.now() - lastActivity);
    return Math.max(0, timeRemaining);
  };

  const shouldShowWarning = () => {
    if (!preferences.autoLogout || sessionWarningShown) return false;
    
    const timeRemaining = getTimeUntilExpiration();
    if (!timeRemaining) return false;
    
    // Show warning when 5 minutes or less remaining
    return timeRemaining <= 5 * 60 * 1000;
  };

  return {
    isSessionExpired,
    getTimeUntilExpiration,
    shouldShowWarning,
    updateLastActivity,
    setSessionWarningShown,
    resetSession,
    autoLogoutEnabled: preferences.autoLogout,
    autoLogoutDuration: preferences.autoLogoutDuration,
  };
}