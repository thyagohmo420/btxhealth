'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseConfig'
import { UserRole } from '@/data/users'

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  sectors?: string[]
  created_at?: string
  last_sign_in_at?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados adicionais do usuário do Supabase
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Erro ao buscar dados do usuário:', error)
              setUser(null)
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: data.name,
                role: data.role as UserRole,
                active: data.active,
                sectors: data.sectors,
                created_at: session.user.created_at,
                last_sign_in_at: session.user.last_sign_in_at,
              })
            }
            setLoading(false)
          })
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Buscar dados adicionais do usuário do Supabase
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Erro ao buscar dados do usuário:', error)
              setUser(null)
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: data.name,
                role: data.role as UserRole,
                active: data.active,
                sectors: data.sectors,
                created_at: session.user.created_at,
                last_sign_in_at: session.user.last_sign_in_at,
              })
            }
          })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    router.push('/dashboard')
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/login')
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
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
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 