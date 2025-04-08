"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import allUsers from '@/data/users'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos')
      return
    }
    
    try {
      setIsSubmitting(true)
      await signIn(email, password)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      // Mensagem de erro já exibida no contexto de auth
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = (role: string) => {
    let demoUser = null
    
    // Encontrar um usuário da função especificada
    switch (role) {
      case 'medico':
        demoUser = allUsers.medicos[0]
        break
      case 'recepcao':
        demoUser = allUsers.recepcao[0]
        break
      case 'enfermagem':
        demoUser = allUsers.enfermagem[0]
        break
      case 'admin':
        demoUser = allUsers.admin[0]
        break
      default:
        demoUser = null
    }
    
    if (demoUser) {
      setEmail(demoUser.email)
      setPassword(demoUser.password)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="BTX Health Logo" 
              width={150} 
              height={60} 
            />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao BTX Health</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou entre como</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button variant="outline" onClick={() => handleDemoLogin('medico')}>
                Médico
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin('recepcao')}>
                Recepção
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin('enfermagem')}>
                Enfermagem
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin('admin')}>
                Administrador
              </Button>
            </div>
            <div className="text-center text-xs text-gray-500">
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle size={14} />
                <span>Versão de demonstração - Não use para dados reais</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 