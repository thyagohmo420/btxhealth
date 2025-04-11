'use client'

import React, { ReactNode, useState } from 'react'
import { Menu, X, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import AppMenu from './Menu'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  
  const names = name.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Mapear papéis para nomes legíveis em português
  const roleLabels: Record<string, string> = {
    medico: 'Médico',
    recepcao: 'Recepção',
    enfermagem: 'Enfermagem',
    farmacia: 'Farmácia',
    financeiro: 'Financeiro',
    rh: 'Recursos Humanos',
    laboratorio: 'Laboratório',
    admin: 'Administrador'
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 md:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-4 shrink-0 border-b">
          <h1 className="text-xl font-bold">Hospital de Juquitiba</h1>
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {user && <AppMenu userRole={user.role} />}
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex flex-1 flex-col w-full md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" alt={user?.name || ""} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="mt-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {user?.role ? roleLabels[user.role] || user.role : ''}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut size={16} className="mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] p-4 md:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8 min-h-[calc(100vh-7rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <Toaster position="top-right" />
    </div>
  )
}