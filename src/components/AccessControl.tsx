import React, { ReactNode } from 'react';
import { hasPermission, canAccessPage } from '@/data/permissions';
import { UserRole } from '@/data/users';

interface AccessControlProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  pagePath?: string;
  userRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Componente que controla acesso baseado em papéis e permissões
 * 
 * @param children - O conteúdo que será renderizado se o usuário tiver acesso
 * @param allowedRoles - Papéis que têm permissão para acessar o conteúdo
 * @param requiredPermissions - Permissões necessárias para acessar o conteúdo
 * @param pagePath - Caminho da página para verificação de acesso
 * @param userRole - Papel do usuário atual
 * @param fallback - Conteúdo alternativo a ser exibido quando o acesso é negado
 */
const AccessControl: React.FC<AccessControlProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  pagePath,
  userRole,
  fallback = null
}) => {
  // Verificar por papel
  const hasRole = allowedRoles ? allowedRoles.includes(userRole) : true;
  
  // Verificar por permissões específicas
  const hasRequiredPermissions = requiredPermissions
    ? requiredPermissions.every(permission => hasPermission(userRole, permission))
    : true;
  
  // Verificar por acesso à página
  const hasPageAccess = pagePath ? canAccessPage(userRole, pagePath) : true;
  
  // Admin tem acesso total
  if (userRole === 'admin') {
    return <>{children}</>;
  }
  
  // Retornar o conteúdo se tiver acesso, ou o fallback caso contrário
  if (hasRole && hasRequiredPermissions && hasPageAccess) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default AccessControl; 