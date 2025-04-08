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

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const userInitials = user ? getInitials(user.name) : 'U'

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 md:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-4 shrink-0">
          <h1 className="text-xl font-bold">BTX Health</h1>
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

      {/* Conteúdo principal */}
      <div className="flex w-full flex-1 flex-col md:ml-64">
        {/* Header */}
        <header className="z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
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
                    <AvatarFallback>{userInitials}</AvatarFallback>
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
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* Overlay de fundo quando o sidebar está aberto no mobile */}
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