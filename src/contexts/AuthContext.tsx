'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseConfig'
import { User, UserRole } from '@/data/users'
import allUsers from '@/data/users'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Buscar usuário pelo email
      const foundUser = allUsers.all.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!foundUser) {
        toast.error('Usuário não encontrado')
        throw new Error('Usuário não encontrado')
      }
      
      // Verificar senha
      if (foundUser.password !== password) {
        toast.error('Senha incorreta')
        throw new Error('Senha incorreta')
      }
      
      // Atualizar último login
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      // Redirecionar com base no papel do usuário
      redirectBasedOnRole(updatedUser.role)
      
      toast.success(`Bem-vindo(a), ${updatedUser.name}!`)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case 'medico':
        window.location.href = '/medical-office'
        break
      case 'recepcao':
        window.location.href = '/reception'
        break
      case 'enfermagem':
        window.location.href = '/triage'
        break
      case 'farmacia':
        window.location.href = '/pharmacy'
        break
      case 'financeiro':
        window.location.href = '/financial'
        break
      case 'rh':
        window.location.href = '/hr'
        break
      case 'laboratorio':
        window.location.href = '/laboratory'
        break
      case 'admin':
        window.location.href = '/dashboard'
        break
      default:
        window.location.href = '/dashboard'
    }
  }

  const signOut = () => {
    try {
      localStorage.removeItem('user')
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const foundUser = allUsers.all.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!foundUser) {
        toast.error('Email não encontrado no sistema')
        throw new Error('Email não encontrado')
      }
      
      toast.success('Se este email estiver cadastrado, você receberá instruções para redefinir sua senha')
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      toast.error('Erro ao enviar email de recuperação')
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 