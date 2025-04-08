'use client'

import { useRouter } from 'next/navigation'
import {
  TestTube,
  FileSpreadsheet,
  Syringe,
  Microscope,
  FileCheck,
  ImagePlus,
  BarChart3,
  Settings2,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Laboratory() {
  const router = useRouter()

  const sections = [
    {
      title: 'Solicitações',
      description: 'Gerenciar solicitações de exames',
      icon: FileSpreadsheet,
      href: '/laboratory/requests',
      color: 'bg-blue-500'
    },
    {
      title: 'Coleta',
      description: 'Controle de coletas e amostras',
      icon: Syringe,
      href: '/laboratory/collection',
      color: 'bg-green-500'
    },
    {
      title: 'Análises',
      description: 'Acompanhamento de análises',
      icon: Microscope,
      href: '/laboratory/analysis',
      color: 'bg-purple-500'
    },
    {
      title: 'Resultados',
      description: 'Gestão de resultados e laudos',
      icon: FileCheck,
      href: '/laboratory/results',
      color: 'bg-yellow-500'
    },
    {
      title: 'Imagens',
      description: 'Exames de imagem',
      icon: ImagePlus,
      href: '/laboratory/images',
      color: 'bg-pink-500'
    },
    {
      title: 'Relatórios',
      description: 'Relatórios e estatísticas',
      icon: BarChart3,
      href: '/laboratory/reports',
      color: 'bg-orange-500'
    },
    {
      title: 'Configurações',
      description: 'Configurações do laboratório',
      icon: Settings2,
      href: '/laboratory/settings',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <TestTube className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratório</h1>
          <p className="text-gray-600">Gestão completa do laboratório</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(section.href)}
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {section.description}
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Acessar
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 