import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

interface SecuritySettings {
  requireTwoFactor: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordRequireNumber: boolean;
  passwordRequireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

interface SecurityState {
  settings: SecuritySettings;
  updateSettings: (newSettings: Partial<SecuritySettings>) => void;
}

const defaultSettings: SecuritySettings = {
  requireTwoFactor: false,
  passwordMinLength: 8,
  passwordRequireSpecialChar: true,
  passwordRequireNumber: true,
  passwordRequireUppercase: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  lockoutDuration: 15
};

export const useSecuritySettings = create<SecurityState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'security-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export const validatePassword = (password: string): string[] => {
  const { settings } = useSecuritySettings.getState();
  const errors: string[] = [];

  if (password.length < settings.passwordMinLength) {
    errors.push(`A senha deve ter pelo menos ${settings.passwordMinLength} caracteres`);
  }

  if (settings.passwordRequireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  if (settings.passwordRequireNumber && !/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  return errors;
};

interface LoginAttempt {
  count: number;
  timestamp: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

export const checkLoginAttempts = (username: string): boolean => {
  const { settings } = useSecuritySettings.getState();
  const now = Date.now();
  const attempt = loginAttempts.get(username);

  if (attempt) {
    // Verifica se o período de bloqueio já passou
    if (now - attempt.timestamp > settings.lockoutDuration * 60 * 1000) {
      loginAttempts.delete(username);
      return true;
    }

    // Verifica se excedeu o número máximo de tentativas
    if (attempt.count > settings.maxLoginAttempts) {
      return false;
    }
  }

  return true;
};

export const getRemainingAttempts = (username: string): number => {
  const { settings } = useSecuritySettings.getState();
  const attempt = loginAttempts.get(username);

  if (!attempt) return settings.maxLoginAttempts;
  return Math.max(0, settings.maxLoginAttempts - attempt.count);
};

export const recordLoginAttempt = (username: string, success: boolean): void => {
  const now = Date.now();
  const attempt = loginAttempts.get(username) || { count: 0, timestamp: now };

  if (success) {
    loginAttempts.delete(username);
  } else {
    loginAttempts.set(username, {
      count: attempt.count + 1,
      timestamp: now,
    });
  }
};

export const useSessionTimeout = (onTimeout: () => void) => {
  const { settings } = useSecuritySettings.getState();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(onTimeout, settings.sessionTimeout * 60 * 1000);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    resetTimeout();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [settings.sessionTimeout, onTimeout]);
}; 