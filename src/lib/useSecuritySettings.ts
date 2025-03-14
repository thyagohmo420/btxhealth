import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SecuritySettings {
  minPasswordLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactorRequired: boolean;
  sessionTimeout: number;
  passwordHistory: number;
}

interface SecuritySettingsStore extends SecuritySettings {
  updateSettings: (settings: Partial<SecuritySettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  minPasswordLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  passwordExpiryDays: 90,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  twoFactorRequired: false,
  sessionTimeout: 30,
  passwordHistory: 3
};

export const useSecuritySettings = create<SecuritySettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          ...state,
          ...newSettings
        }));
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
      }
    }),
    {
      name: 'security-settings',
      partialize: (state) => {
        const { updateSettings, resetToDefaults, ...settings } = state;
        return settings;
      }
    }
  )
);

// Hook para validação de senha baseado nas configurações
export const usePasswordValidation = () => {
  const settings = useSecuritySettings();

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < settings.minPasswordLength) {
      errors.push(`A senha deve ter pelo menos ${settings.minPasswordLength} caracteres`);
    }

    if (settings.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }

    if (settings.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    if (settings.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    validatePassword,
    settings
  };
};

// Hook para gerenciamento de tentativas de login
export const useLoginAttempts = () => {
  const settings = useSecuritySettings();
  const attempts = new Map<string, { count: number; timestamp: number }>();

  const checkLoginAttempt = (email: string): boolean => {
    const now = Date.now();
    const attempt = attempts.get(email) || { count: 0, timestamp: now };

    // Reseta tentativas após o período de bloqueio
    if (now - attempt.timestamp > settings.lockoutDuration * 60 * 1000) {
      attempts.set(email, { count: 1, timestamp: now });
      return true;
    }

    // Incrementa tentativas
    attempt.count++;
    attempt.timestamp = now;

    if (attempt.count > settings.maxLoginAttempts) {
      return false;
    }

    attempts.set(email, attempt);
    return true;
  };

  const resetAttempts = (email: string) => {
    attempts.delete(email);
  };

  const getRemainingAttempts = (email: string): number => {
    const attempt = attempts.get(email);
    if (!attempt) return settings.maxLoginAttempts;
    return Math.max(0, settings.maxLoginAttempts - attempt.count);
  };

  return {
    checkLoginAttempt,
    resetAttempts,
    getRemainingAttempts
  };
};

// Hook para gerenciamento de sessão
export const useSessionTimeout = () => {
  const settings = useSecuritySettings();

  const startSessionTimer = (onTimeout: () => void) => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onTimeout, settings.sessionTimeout * 60 * 1000);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return cleanup;
  };

  return {
    startSessionTimer
  };
}; 