import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../lib/auth';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const signUpSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(50, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUp } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });

  const password = watch('password');

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      await signUp(data.email, data.password, {
        fullName: data.fullName
      });
      
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
      router.push('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      if (error.message.includes('already registered') || error.message.includes('já está cadastrado')) {
        setError('email', { 
          type: 'manual',
          message: 'Este email já está cadastrado'
        });
      } else if (error.message.includes('weak password')) {
        setError('password', {
          type: 'manual',
          message: 'A senha é muito fraca. Use pelo menos 8 caracteres com letras, números e caracteres especiais.'
        });
      } else if (error.message.includes('invalid email')) {
        setError('email', {
          type: 'manual',
          message: 'Email inválido'
        });
      } else {
        toast.error('Erro ao criar conta. Por favor, tente novamente.');
      }
      
      reset({ 
        ...data, 
        password: '', 
        confirmPassword: '' 
      }, { 
        keepErrors: true,
        keepValues: true 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          BTx Health - Criar Conta
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <div className="mt-1 relative">
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.fullName
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.fullName && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            
            {/* Indicador de força da senha */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Força da senha:</span>
                  <span className="text-sm font-medium">
                    {passwordStrength === 0 && 'Muito fraca'}
                    {passwordStrength === 1 && 'Fraca'}
                    {passwordStrength === 2 && 'Média'}
                    {passwordStrength === 3 && 'Boa'}
                    {passwordStrength === 4 && 'Forte'}
                    {passwordStrength === 5 && 'Muito forte'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      passwordStrength <= 1 ? 'bg-red-500' :
                      passwordStrength === 2 ? 'bg-yellow-500' :
                      passwordStrength === 3 ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Criando conta...</span>
              </div>
            ) : (
              'Criar Conta'
            )}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-800"
            >
              Fazer login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}