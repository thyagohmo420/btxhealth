import React from 'react'
import { Shield, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/data/users'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessDeniedProps {
  userRole: UserRole
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ userRole }) => {
  // Mapear funções para páginas iniciais padrão
  const roleHomePages: Record<UserRole, string> = {
    medico: '/medical-office',
    recepcao: '/reception',
    enfermagem: '/triage',
    farmacia: '/pharmacy',
    financeiro: '/financial',
    rh: '/hr',
    admin: '/dashboard'
  }

  const homePage = roleHomePages[userRole] || '/dashboard'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Acesso Negado</CardTitle>
          <CardDescription className="text-lg">
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Seu perfil atual ({userRole}) não possui as permissões necessárias para visualizar este conteúdo.
          </p>
          <p className="text-gray-600">
            Por favor, entre em contato com o administrador do sistema se acredita que este é um erro.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="mr-2">
            <Link href={homePage} className="flex items-center gap-2">
              <Home size={16} />
              <span>Voltar à Página Inicial</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AccessDenied 