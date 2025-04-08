'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  TestTube,
  FileSpreadsheet,
  Syringe,
  Microscope,
  FileCheck,
  ImagePlus,
  BarChart3,
  Settings2
} from 'lucide-react'

export default function LaboratoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    {
      title: 'Solicitações',
      href: '/laboratory/requests',
      icon: FileSpreadsheet
    },
    {
      title: 'Coleta',
      href: '/laboratory/collection',
      icon: Syringe
    },
    {
      title: 'Análises',
      href: '/laboratory/analysis',
      icon: Microscope
    },
    {
      title: 'Resultados',
      href: '/laboratory/results',
      icon: FileCheck
    },
    {
      title: 'Imagens',
      href: '/laboratory/images',
      icon: ImagePlus
    },
    {
      title: 'Relatórios',
      href: '/laboratory/reports',
      icon: BarChart3
    },
    {
      title: 'Configurações',
      href: '/laboratory/settings',
      icon: Settings2
    }
  ]

  const isRootPath = pathname === '/laboratory'

  if (isRootPath) {
    return children
  }

  return (
    <div className="flex h-full">
      {/* Navegação lateral */}
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <Link 
            href="/laboratory"
            className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
          >
            <TestTube className="h-5 w-5" />
            <span>Laboratório</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 