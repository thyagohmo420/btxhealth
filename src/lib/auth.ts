import { supabase } from './supabase';
import { create } from 'zustand';
import { toast } from 'sonner';
import { persist } from 'zustand/middleware';

interface LoginAttempt {
  count: number;
  timestamp: number;
  blocked: boolean;
}

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos
const loginAttempts = new Map<string, LoginAttempt>();

const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, timestamp: now, blocked: false };

  // Verifica se o bloqueio já expirou
  if (attempt.blocked && now - attempt.timestamp > BLOCK_DURATION) {
    loginAttempts.set(email, { count: 0, timestamp: now, blocked: false });
    return true;
  }

  // Se ainda está bloqueado
  if (attempt.blocked) {
    const remainingTime = Math.ceil((BLOCK_DURATION - (now - attempt.timestamp)) / 60000);
    toast.error(`Conta temporariamente bloqueada. Tente novamente em ${remainingTime} minutos.`);
    return false;
  }

  // Reseta contagem após 30 minutos
  if (now - attempt.timestamp > 30 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, timestamp: now, blocked: false });
    return true;
  }

  // Incrementa tentativas
  attempt.count++;
  attempt.timestamp = now;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.blocked = true;
    toast.error('Muitas tentativas de login. Conta bloqueada por 15 minutos.');
    loginAttempts.set(email, attempt);
    return false;
  }

  loginAttempts.set(email, attempt);
  return true;
};

interface AuthState {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  checkSession: () => Promise<boolean>;
  getRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      checkSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            set({ user: null });
            return false;
          }

          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            set({ user: null });
            return false;
          }

          set({ user: currentUser });
          return true;
        } finally {
          set({ loading: false });
        }
      },

      getRole: () => {
        const user = get().user;
        return user?.user_metadata?.role || null;
      },

      signIn: async (email: string, password: string) => {
        try {
          if (!checkRateLimit(email)) {
            return false;
          }

          set({ loading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            const attempt = loginAttempts.get(email);
            if (attempt) {
              const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempt.count;
              toast.error(`Erro no login: ${error.message}. Tentativas restantes: ${remainingAttempts}`);
            } else {
              toast.error('Erro no login: ' + error.message);
            }
            return false;
          }

          loginAttempts.delete(email);
          set({ user: data.user });
          toast.success('Login realizado com sucesso!');
          return true;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string, userData: any) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) {
            toast.error('Erro no cadastro: ' + error.message);
            return;
          }

          set({ user: data.user });
          toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar o cadastro.');
        } catch (err) {
          toast.error('Erro inesperado ao cadastrar.');
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            toast.error('Erro ao fazer logout.');
            return;
          }
          
          set({ user: null });
          toast.success('Logout realizado com sucesso!');
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (error) throw error;
          toast.success('Email de recuperação enviado com sucesso!');
        } catch (error) {
          toast.error('Erro ao enviar email de recuperação.');
        } finally {
          set({ loading: false });
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) throw error;
          toast.success('Senha atualizada com sucesso!');
        } catch (error) {
          toast.error('Erro ao atualizar senha.');
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);
