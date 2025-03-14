import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Stethoscope,
  Calendar,
  FileText,
  Settings,
  Bell,
  UserPlus,
  Activity,
  Briefcase,
  LayoutDashboard,
  Syringe,
  Pill,
  Building2,
  Heart,
  Video,
  Wifi,
  BookOpen,
  PieChart,
  Tv
} from 'lucide-react';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'receptionist', 'nurse', 'doctor']
  },
  {
    title: 'Recepção',
    path: '/reception',
    icon: <UserPlus className="w-5 h-5" />,
    roles: ['admin', 'receptionist']
  },
  {
    title: 'Triagem',
    path: '/triage',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['admin', 'nurse']
  },
  {
    title: 'Consultório',
    path: '/medical-office',
    icon: <Stethoscope className="w-5 h-5" />,
    roles: ['admin', 'doctor']
  },
  {
    title: 'Prontuário',
    path: '/medical-records',
    icon: <FileText className="w-5 h-5" />,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    title: 'Agendamentos',
    path: '/appointments',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['admin', 'receptionist']
  },
  {
    title: 'Pacientes',
    path: '/patients',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin', 'receptionist', 'nurse', 'doctor']
  },
  {
    title: 'Atendimentos',
    path: '/service-management',
    icon: <Activity className="w-5 h-5" />,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    title: 'Profissionais',
    path: '/professionals',
    icon: <Briefcase className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Setores',
    path: '/sectors',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['admin', 'nurse']
  },
  {
    title: 'Enfermaria',
    path: '/nursing',
    icon: <Heart className="w-5 h-5" />,
    roles: ['admin', 'nurse']
  },
  {
    title: 'Vacinas',
    path: '/vaccines',
    icon: <Syringe className="w-5 h-5" />,
    roles: ['admin', 'nurse']
  },
  {
    title: 'Farmácia',
    path: '/pharmacy',
    icon: <Pill className="w-5 h-5" />,
    roles: ['admin', 'pharmacist']
  },
  {
    title: 'Telemedicina',
    path: '/telemedicine',
    icon: <Video className="w-5 h-5" />,
    roles: ['admin', 'doctor']
  },
  {
    title: 'Monitoramento',
    path: '/monitoring',
    icon: <Wifi className="w-5 h-5" />,
    roles: ['admin', 'nurse']
  },
  {
    title: 'Educação',
    path: '/education',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    title: 'Relatórios',
    path: '/reports',
    icon: <PieChart className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'TV',
    path: '/tv',
    icon: <Tv className="w-5 h-5" />,
    roles: ['admin', 'receptionist', 'nurse', 'doctor']
  },
  {
    title: 'Notificações',
    path: '/notifications',
    icon: <Bell className="w-5 h-5" />,
    roles: ['admin', 'receptionist', 'nurse', 'doctor']
  },
  {
    title: 'Configurações',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin']
  }
];

export function Sidebar() {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'admin';

  const filteredItems = sidebarItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span className="font-bold text-xl">Hospital de Juquitiba</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <div className="font-medium">Usuário</div>
              <div className="text-sm text-gray-500 capitalize">{userRole}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}