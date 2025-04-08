import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // Simplesmente renderiza os filhos sem qualquer verificação
  return <>{children}</>;
}