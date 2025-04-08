'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Calendar, 
  ClipboardList,
  Stethoscope,
  FileText,
  Settings, 
  LogOut,
  Menu,
  X,
  UserPlus,
  Activity,
  Briefcase,
  Building2,
  Heart,
  Syringe,
  Pill,
  Video,
  Wifi,
  BookOpen,
  PieChart,
  Bell,
  LayoutDashboard,
  Tv,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  Cog,
  DollarSign,
  LineChart,
  ArrowUpDown,
  FileIcon,
  TestTube,
  Microscope,
  History,
  Settings2,
  FileBarChart,
  FileCheck,
  QrCode,
  Printer,
  Upload,
  ImagePlus,
  BarChart3,
  Brain,
  Phone,
  MessageSquare,
  Laptop,
  ClipboardCheck,
  AlertTriangle
} from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Função simulada de logout
  const handleLogout = () => {
    // Apenas redireciona para a página inicial
    router.push('/')
  }

  const menuItems = [
    {
      title: 'Principal',
      items: [
        {
          href: '/dashboard',
          title: 'Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'IA',
      items: [
        {
          href: '/ai/phone',
          title: 'IA Telefonista',
          icon: Phone
        },
        {
          href: '/ai/whatsapp',
          title: 'IA WhatsApp',
          icon: MessageSquare
        },
        {
          href: '/ai/diagnostic',
          title: 'IA Diagnóstica',
          icon: Microscope
        },
        {
          href: '/ai/citizen',
          title: 'IA Cidadão',
          icon: Users
        },
        {
          href: '/ai/prescription',
          title: 'IA Prescrição',
          icon: FileText
        },
        {
          href: '/ai/triage',
          title: 'IA Triagem',
          icon: AlertTriangle
        }
      ]
    },
    {
      title: 'Atendimento',
      items: [
        {
          href: '/reception',
          title: 'Recepção',
          icon: UserPlus
        },
        {
          href: '/triage',
          title: 'Triagem',
          icon: ClipboardList
        },
        {
          href: '/consulting-room',
          title: 'Consultório',
          icon: Stethoscope
        },
        {
          href: '/medical-records',
          title: 'Prontuário',
          icon: FileText
        },
        {
          href: '/tv',
          title: 'Painel TV',
          icon: Tv,
          highlight: true
        }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        {
          href: '/financial/dashboard',
          title: 'Visão Geral',
          icon: DollarSign,
          highlight: true
        },
        {
          href: '/financial/transactions',
          title: 'Transações',
          icon: ArrowUpDown,
          highlight: true
        },
        {
          href: '/financial/receivables',
          title: 'Contas a Receber',
          icon: CreditCard,
          highlight: true
        },
        {
          href: '/financial/payables',
          title: 'Contas a Pagar',
          icon: Receipt,
          highlight: true
        },
        {
          href: '/financial/billing',
          title: 'Faturamento',
          icon: FileSpreadsheet,
          highlight: true
        },
        {
          href: '/financial/cash-flow',
          title: 'Fluxo de Caixa',
          icon: LineChart,
          highlight: true
        },
        {
          href: '/financial/reports',
          title: 'Relatórios',
          icon: LineChart,
          highlight: true
        },
        {
          href: '/financial/contracts',
          title: 'Contratos',
          icon: FileIcon,
          highlight: true
        },
        {
          href: '/financial/settings',
          title: 'Configurações',
          icon: Cog
        }
      ]
    },
    {
      title: 'Agendamentos',
      items: [
        {
          href: '/appointments',
          title: 'Consultas',
          icon: Calendar
        },
        {
          href: '/patients',
          title: 'Pacientes',
          icon: Users
        }
      ]
    },
    {
      title: 'Setores',
      items: [
        {
          href: '/nursing',
          title: 'Enfermaria',
          icon: Heart
        },
        {
          href: '/pharmacy',
          title: 'Farmácia',
          icon: Pill
        },
        {
          href: '/emergency',
          title: 'Pronto Socorro',
          icon: Activity
        },
        {
          href: '/vaccines',
          title: 'Vacinas',
          icon: Syringe
        },
        {
          href: '/laboratory',
          title: 'Laboratório',
          icon: TestTube
        }
      ]
    },
    {
      title: 'Gestão',
      items: [
        {
          href: '/professionals',
          title: 'Profissionais',
          icon: Briefcase
        },
        {
          href: '/sectors',
          title: 'Setores',
          icon: Building2
        },
        {
          href: '/telemedicine',
          title: 'Telemedicina',
          icon: Video
        },
        {
          href: '/monitoring',
          title: 'Monitoramento',
          icon: Wifi
        }
      ]
    },
    {
      title: 'Outros',
      items: [
        {
          href: '/education',
          title: 'Educação',
          icon: BookOpen
        },
        {
          href: '/reports',
          title: 'Relatórios',
          icon: PieChart,
          highlight: true
        },
        {
          href: '/notifications',
          title: 'Notificações',
          icon: Bell
        },
        {
          href: '/settings',
          title: 'Configurações',
          icon: Settings
        }
      ]
    }
  ]

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    if (item.items) {
      return (
        <li key={`${item.title}-${index}`}>
          <div className="flex items-center px-4 py-2 text-sm text-gray-300">
            <Icon className="w-4 h-4 mr-3" />
            {item.title}
          </div>
          <ul className="ml-6 space-y-1">
            {item.items.map((subItem: any, subIndex: number) => (
              <li key={`${subItem.title}-${subIndex}`}>
                <Link
                  href={subItem.href}
                  className={`
                    flex items-center px-4 py-2 rounded-lg text-sm
                    transition-colors duration-200
                    ${pathname === subItem.href
                      ? 'bg-[#2a3b56] text-white font-medium'
                      : 'text-gray-300 hover:bg-[#243247] hover:text-white'}
                  `}
                >
                  {subItem.icon && <subItem.icon className="w-4 h-4 mr-3" />}
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      )
    }

    return (
      <li key={`${item.title}-${index}`}>
        <Link
          href={item.href}
          className={`
            flex items-center px-4 py-2 rounded-lg text-sm
            transition-colors duration-200
            ${isActive
              ? 'bg-[#2a3b56] text-white font-medium'
              : item.highlight 
                ? 'text-yellow-300 hover:bg-[#243247] hover:text-yellow-100 font-medium'
                : 'text-gray-300 hover:bg-[#243247] hover:text-white'}
          `}
        >
          <Icon className={`w-4 h-4 mr-3 ${item.highlight ? 'text-yellow-300' : ''}`} />
          {item.title}
          {item.highlight && (
            <span className="ml-auto bg-yellow-800 text-yellow-200 text-xs px-1.5 py-0.5 rounded-full">
              Novo
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <>
      {/* Botão mobile para abrir/fechar sidebar */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        w-64 bg-[#1a2942] border-r border-[#2a3b56]
      `}>
        <div className="flex flex-col min-h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-[#2a3b56] sticky top-0 bg-[#1a2942] z-10">
            <h1 className="text-xl font-bold text-white">Hospital de Juquitiba</h1>
          </div>

          {/* Menu de navegação */}
          <nav className="flex-1 p-4">
            {menuItems.map((section, index) => (
              <div key={`section-${section.title}-${index}`} className="mb-6">
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Botão de logout */}
          <div className="p-4 border-t border-[#2a3b56] sticky bottom-0 bg-[#1a2942]">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-[#243247] hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}