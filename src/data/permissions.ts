import { UserRole } from './users';

// Definição das interfaces
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: Module;
}

export type Module =
  | 'reception'
  | 'triage'
  | 'medicalOffice'
  | 'pharmacy'
  | 'financial'
  | 'hr'
  | 'admin'
  | 'patients'
  | 'reports'
  | 'laboratory'
  | 'exams';

// Mapeamento de páginas por módulo
export const modulePages: Record<Module, string[]> = {
  reception: ['/reception'],
  triage: ['/triage'],
  medicalOffice: ['/medical-office'],
  pharmacy: ['/pharmacy', '/medications'],
  financial: ['/financial', '/billing', '/payments'],
  hr: ['/hr', '/employees', '/payroll'],
  admin: ['/admin', '/settings', '/users', '/sectors'],
  patients: ['/patients'], 
  reports: ['/reports', '/statistics', '/analytics'],
  laboratory: ['/laboratory'],
  exams: ['/exams']
};

// Páginas acessíveis por todos usuários autenticados
export const commonPages = ['/dashboard', '/profile', '/help'];

// Lista de todas as permissões
export const permissions: Permission[] = [
  // Recepção
  { id: 'reception.view', name: 'Visualizar Recepção', description: 'Acesso à área de recepção', module: 'reception' },
  { id: 'reception.register', name: 'Cadastrar Pacientes', description: 'Registrar novos pacientes', module: 'reception' },
  { id: 'reception.edit', name: 'Editar Pacientes', description: 'Editar informações de pacientes', module: 'reception' },
  
  // Triagem
  { id: 'triage.view', name: 'Visualizar Triagem', description: 'Acesso à área de triagem', module: 'triage' },
  { id: 'triage.perform', name: 'Realizar Triagem', description: 'Realizar triagem de pacientes', module: 'triage' },
  { id: 'triage.classify', name: 'Classificar Pacientes', description: 'Classificar pacientes por prioridade', module: 'triage' },
  
  // Consultório Médico
  { id: 'medicalOffice.view', name: 'Visualizar Consultório', description: 'Acesso ao consultório médico', module: 'medicalOffice' },
  { id: 'medicalOffice.consult', name: 'Realizar Consultas', description: 'Realizar consultas médicas', module: 'medicalOffice' },
  { id: 'medicalOffice.prescribe', name: 'Prescrever Medicamentos', description: 'Prescrever medicamentos', module: 'medicalOffice' },
  { id: 'medicalOffice.requestExams', name: 'Solicitar Exames', description: 'Solicitar exames para pacientes', module: 'medicalOffice' },
  
  // Farmácia
  { id: 'pharmacy.view', name: 'Visualizar Farmácia', description: 'Acesso à área de farmácia', module: 'pharmacy' },
  { id: 'pharmacy.dispense', name: 'Dispensar Medicamentos', description: 'Dispensar medicamentos', module: 'pharmacy' },
  { id: 'pharmacy.manage', name: 'Gerenciar Estoque', description: 'Gerenciar estoque de medicamentos', module: 'pharmacy' },
  
  // Financeiro
  { id: 'financial.view', name: 'Visualizar Financeiro', description: 'Acesso à área financeira', module: 'financial' },
  { id: 'financial.billing', name: 'Gerenciar Faturamento', description: 'Gerenciar faturamento', module: 'financial' },
  { id: 'financial.payments', name: 'Gerenciar Pagamentos', description: 'Gerenciar pagamentos', module: 'financial' },
  { id: 'financial.reports', name: 'Relatórios Financeiros', description: 'Gerar relatórios financeiros', module: 'financial' },
  
  // RH
  { id: 'hr.view', name: 'Visualizar RH', description: 'Acesso à área de RH', module: 'hr' },
  { id: 'hr.manage', name: 'Gerenciar Funcionários', description: 'Gerenciar funcionários', module: 'hr' },
  { id: 'hr.payroll', name: 'Processar Folha', description: 'Processar folha de pagamento', module: 'hr' },
  
  // Admin
  { id: 'admin.view', name: 'Visualizar Admin', description: 'Acesso à área administrativa', module: 'admin' },
  { id: 'admin.users', name: 'Gerenciar Usuários', description: 'Gerenciar usuários do sistema', module: 'admin' },
  { id: 'admin.settings', name: 'Configurações', description: 'Acesso às configurações do sistema', module: 'admin' },
  
  // Pacientes
  { id: 'patients.view', name: 'Visualizar Pacientes', description: 'Visualizar lista de pacientes', module: 'patients' },
  { id: 'patients.edit', name: 'Editar Pacientes', description: 'Editar informações de pacientes', module: 'patients' },
  { id: 'patients.history', name: 'Histórico Médico', description: 'Acessar histórico médico dos pacientes', module: 'patients' },
  
  // Relatórios
  { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Visualizar relatórios', module: 'reports' },
  { id: 'reports.generate', name: 'Gerar Relatórios', description: 'Gerar novos relatórios', module: 'reports' },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Exportar relatórios', module: 'reports' },
  
  // Laboratório
  { id: 'laboratory.view', name: 'Visualizar Laboratório', description: 'Acesso ao laboratório', module: 'laboratory' },
  { id: 'laboratory.edit', name: 'Editar Laboratório', description: 'Editar informações do laboratório', module: 'laboratory' },
  { id: 'laboratory.add', name: 'Adicionar Laboratório', description: 'Adicionar novo laboratório', module: 'laboratory' },
  { id: 'exams.view', name: 'Visualizar Exames', description: 'Visualizar exames', module: 'exams' },
  { id: 'exams.edit', name: 'Editar Exames', description: 'Editar informações dos exames', module: 'exams' },
  { id: 'exams.add', name: 'Adicionar Exames', description: 'Adicionar novo exame', module: 'exams' }
];

// Definição das permissões por papel
export const rolePermissions = {
  // Médicos têm acesso ao consultório médico, visualização de pacientes e seus históricos
  medico: [
    'medicalOffice.view',
    'medicalOffice.consult',
    'medicalOffice.prescribe',
    'medicalOffice.requestExams',
    'patients.view',
    'patients.history',
    'reports.view'
  ],
  
  // Recepção tem acesso à recepção, cadastro de pacientes e visualização básica
  recepcao: [
    'reception.view',
    'reception.register',
    'reception.edit',
    'patients.view'
  ],
  
  // Enfermagem tem acesso à triagem e visualização básica de pacientes
  enfermagem: [
    'triage.view',
    'triage.perform',
    'triage.classify',
    'patients.view',
    'patients.edit',
    'patients.history'
  ],
  
  // Farmácia tem acesso à farmácia e dispensação de medicamentos
  farmacia: [
    'pharmacy.view',
    'pharmacy.dispense',
    'pharmacy.manage'
  ],
  
  // Financeiro tem acesso à área financeira e relatórios
  financeiro: [
    'financial.view',
    'financial.billing',
    'financial.payments',
    'financial.reports',
    'reports.view',
    'reports.generate',
    'reports.export'
  ],
  
  // RH
  rh: [
    'hr.view',
    'hr.edit',
    'hr.add',
    'professionals.view',
    'professionals.edit',
    'professionals.add',
    'professionals.invite',
    'config.access'
  ],
  
  // Laboratório
  laboratorio: [
    'laboratory.view',
    'laboratory.edit',
    'laboratory.add',
    'exams.view',
    'exams.edit',
    'exams.add'
  ],
  
  // Administradores têm acesso a tudo
  admin: [
    'reception.view',
    'reception.register',
    'reception.edit',
    'triage.view',
    'triage.perform',
    'triage.classify',
    'medicalOffice.view',
    'medicalOffice.consult',
    'medicalOffice.prescribe',
    'medicalOffice.requestExams',
    'pharmacy.view',
    'pharmacy.dispense',
    'pharmacy.manage',
    'financial.view',
    'financial.billing',
    'financial.payments',
    'financial.reports',
    'hr.view',
    'hr.edit',
    'hr.add',
    'professionals.view',
    'professionals.edit',
    'professionals.add',
    'professionals.invite',
    'config.access',
    'admin.view',
    'admin.users',
    'admin.settings',
    'patients.view',
    'patients.edit',
    'patients.history',
    'reports.view',
    'reports.generate',
    'reports.export'
  ]
};

// Função para verificar se um usuário tem uma permissão específica
export const hasPermission = (userRole: UserRole, permissionId: string): boolean => {
  if (!userRole || !permissionId) return false;
  return rolePermissions[userRole].includes(permissionId);
};

// Função para obter todas as permissões de um usuário
export const getUserPermissions = (userRole: UserRole): Permission[] => {
  if (!userRole) return [];
  const permissionIds = rolePermissions[userRole];
  return permissions.filter(p => permissionIds.includes(p.id));
};

// Função para verificar se um usuário pode acessar uma página específica
export const canAccessPage = (userRole: UserRole, pagePath: string): boolean => {
  if (!userRole || !pagePath) return false;
  
  // Todos podem acessar páginas comuns
  if (commonPages.includes(pagePath)) return true;
  
  // Admin pode acessar qualquer página
  if (userRole === 'admin') return true;
  
  // Verificar permissões do usuário
  const userPermissions = getUserPermissions(userRole);
  const userModules = userPermissions.map(p => p.module);
  
  // Verificar se o usuário tem acesso ao módulo da página
  for (const module of Object.keys(modulePages) as Module[]) {
    if (userModules.includes(module) && modulePages[module].includes(pagePath)) {
      return true;
    }
  }
  
  return false;
};

export default {
  permissions,
  rolePermissions,
  hasPermission,
  getUserPermissions,
  canAccessPage,
  modulePages,
  commonPages
}; 