import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, checkSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    // Verifica a sessão apenas uma vez na montagem do componente
    checkSession();

    // Configura o listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Executa apenas na montagem

  useEffect(() => {
    // Gerencia redirecionamentos baseado no estado de autenticação
    if (!loading) {
      if (!user && !isPublicRoute) {
        navigate('/login', { replace: true });
      } else if (user && isPublicRoute) {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, isPublicRoute, location.pathname]);

  // Mostra loading apenas durante a verificação inicial
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Renderiza o conteúdo se estiver em uma rota pública ou autenticado
  return <>{children}</>;
}