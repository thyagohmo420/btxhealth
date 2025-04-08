'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Stethoscope, 
  ClipboardCheck, 
  UserPlus, 
  Pill, 
  Receipt, 
  UserCog,
  BarChart,
  Settings,
  Brain,
  MessageSquare,
  Phone,
  FileText,
  PieChart,
  Building,
  UserCheck,
  Thermometer,
  TestTube
} from 'lucide-react';

type MenuItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
};

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <Home size={20} />,
    roles: ['admin', 'medico', 'recepcao', 'enfermagem', 'farmacia', 'financeiro', 'rh']
  },
  {
    name: 'Recepção',
    href: '/reception',
    icon: <UserPlus size={20} />,
    roles: ['admin', 'recepcao']
  },
  {
    name: 'Triagem',
    href: '/triage',
    icon: <ClipboardCheck size={20} />,
    roles: ['admin', 'enfermagem']
  },
  {
    name: 'Consultório',
    href: '/medical-office',
    icon: <Stethoscope size={20} />,
    roles: ['admin', 'medico']
  },
  {
    name: 'Farmácia',
    href: '/pharmacy',
    icon: <Pill size={20} />,
    roles: ['admin', 'farmacia']
  },
  {
    name: 'Financeiro',
    href: '/financial',
    icon: <Receipt size={20} />,
    roles: ['admin', 'financeiro']
  },
  {
    name: 'Pacientes',
    href: '/patients',
    icon: <Users size={20} />,
    roles: ['admin', 'medico', 'recepcao', 'enfermagem']
  },
  {
    name: 'Setores',
    href: '/sectors',
    icon: <Building size={20} />,
    roles: ['admin', 'rh', 'recepcao', 'medico', 'enfermagem']
  },
  {
    name: 'Profissionais',
    href: '/professionals',
    icon: <UserCheck size={20} />,
    roles: ['admin', 'rh', 'medico']
  },
  {
    name: 'Enfermagem',
    href: '/nursing',
    icon: <Thermometer size={20} />,
    roles: ['admin', 'enfermagem', 'medico']
  },
  {
    name: 'Laboratório',
    href: '/laboratory',
    icon: <TestTube size={20} />,
    roles: ['admin', 'enfermagem', 'medico', 'laboratorio']
  },
  {
    name: 'IA Telefonista',
    href: '/ai/phone',
    icon: <Phone size={20} />,
    roles: ['admin', 'recepcao']
  },
  {
    name: 'IA WhatsApp',
    href: '/ai/whatsapp',
    icon: <MessageSquare size={20} />,
    roles: ['admin', 'recepcao', 'enfermagem']
  },
  {
    name: 'IA Diagnóstica',
    href: '/ai/diagnostic',
    icon: <FileText size={20} />,
    roles: ['admin', 'medico']
  },
  {
    name: 'IA Cidadão',
    href: '/ai/citizen',
    icon: <Users size={20} />,
    roles: ['admin', 'recepcao', 'enfermagem']
  },
  {
    name: 'IA Prescrição',
    href: '/ai/prescription',
    icon: <FileText size={20} />,
    roles: ['admin', 'medico']
  },
  {
    name: 'IA Triagem',
    href: '/ai/triage',
    icon: <ClipboardCheck size={20} />,
    roles: ['admin', 'enfermagem']
  },
  {
    name: 'IA Estoque',
    href: '/ai/inventory',
    icon: <PieChart size={20} />,
    roles: ['admin', 'farmacia']
  },
  {
    name: 'IA Assistente Médico',
    href: '/ai/medical-assistant',
    icon: <Brain size={20} />,
    roles: ['admin', 'medico']
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: <BarChart size={20} />,
    roles: ['admin']
  },
  {
    name: 'Controle de Usuários',
    href: '/user-access',
    icon: <UserCog size={20} />,
    roles: ['admin']
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: <Settings size={20} />,
    roles: ['admin']
  }
];

interface AppMenuProps {
  userRole: string;
}

const AppMenu: React.FC<AppMenuProps> = ({ userRole }) => {
  const pathname = usePathname();

  // Filtrar itens do menu com base no papel do usuário
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="space-y-1">
      {filteredMenu.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default AppMenu; 