import { v4 as uuidv4 } from 'uuid';

// Definição das interfaces
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
  sectors?: string[];
  lastLogin?: string;
}

export type UserRole = 
  | 'medico'
  | 'recepcao'
  | 'enfermagem'
  | 'farmacia'
  | 'financeiro'
  | 'rh'
  | 'laboratorio'
  | 'admin';

// Função para gerar uma senha segura (apenas para demonstração)
const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Criar usuários para médicos
export const medicosUsers: User[] = [
  {
    id: uuidv4(),
    email: 'dr.carlos@btxhealth.com',
    password: 'Med123@BTX',
    name: 'Dr. Carlos Silva',
    role: 'medico',
    active: true,
    sectors: ['Clínica Geral', 'Emergência']
  },
  {
    id: uuidv4(),
    email: 'dra.ana@btxhealth.com',
    password: 'Med456@BTX',
    name: 'Dra. Ana Oliveira',
    role: 'medico',
    active: true,
    sectors: ['Pediatria']
  },
  {
    id: uuidv4(),
    email: 'dr.marcos@btxhealth.com',
    password: 'Med789@BTX',
    name: 'Dr. Marcos Santos',
    role: 'medico',
    active: true,
    sectors: ['Ortopedia']
  },
  {
    id: uuidv4(),
    email: 'dra.julia@btxhealth.com',
    password: 'Med101@BTX',
    name: 'Dra. Julia Costa',
    role: 'medico',
    active: true,
    sectors: ['Cardiologia']
  },
  {
    id: uuidv4(),
    email: 'dr.roberto@btxhealth.com',
    password: 'Med202@BTX',
    name: 'Dr. Roberto Almeida',
    role: 'medico',
    active: true,
    sectors: ['Neurologia']
  },
  {
    id: uuidv4(),
    email: 'dra.camila@btxhealth.com',
    password: 'Med303@BTX',
    name: 'Dra. Camila Ferreira',
    role: 'medico',
    active: true,
    sectors: ['Psiquiatria']
  }
];

// Criar usuários para recepção
export const recepcaoUsers: User[] = [
  {
    id: uuidv4(),
    email: 'joana.recep@btxhealth.com',
    password: 'Rec123@BTX',
    name: 'Joana Marques',
    role: 'recepcao',
    active: true
  },
  {
    id: uuidv4(),
    email: 'pedro.recep@btxhealth.com',
    password: 'Rec456@BTX',
    name: 'Pedro Henrique',
    role: 'recepcao',
    active: true
  },
  {
    id: uuidv4(),
    email: 'lucia.recep@btxhealth.com',
    password: 'Rec789@BTX',
    name: 'Lúcia Mendes',
    role: 'recepcao',
    active: true
  },
  {
    id: uuidv4(),
    email: 'fernando.recep@btxhealth.com',
    password: 'Rec101@BTX',
    name: 'Fernando Gomes',
    role: 'recepcao',
    active: true
  },
  {
    id: uuidv4(),
    email: 'claudia.recep@btxhealth.com',
    password: 'Rec202@BTX',
    name: 'Cláudia Lima',
    role: 'recepcao',
    active: true
  },
  {
    id: uuidv4(),
    email: 'gabriel.recep@btxhealth.com',
    password: 'Rec303@BTX',
    name: 'Gabriel Moreira',
    role: 'recepcao',
    active: true
  }
];

// Criar usuários para enfermagem
export const enfermagemUsers: User[] = [
  {
    id: uuidv4(),
    email: 'renata.enf@btxhealth.com',
    password: 'Enf123@BTX',
    name: 'Renata Soares',
    role: 'enfermagem',
    active: true,
    sectors: ['Clínica Médica']
  },
  {
    id: uuidv4(),
    email: 'bruno.enf@btxhealth.com',
    password: 'Enf456@BTX',
    name: 'Bruno Dantas',
    role: 'enfermagem',
    active: true,
    sectors: ['Emergência']
  },
  {
    id: uuidv4(),
    email: 'carla.enf@btxhealth.com',
    password: 'Enf789@BTX',
    name: 'Carla Vieira',
    role: 'enfermagem',
    active: true,
    sectors: ['Pediatria']
  },
  {
    id: uuidv4(),
    email: 'daniel.enf@btxhealth.com',
    password: 'Enf101@BTX',
    name: 'Daniel Torres',
    role: 'enfermagem',
    active: true,
    sectors: ['UTI']
  },
  {
    id: uuidv4(),
    email: 'patricia.enf@btxhealth.com',
    password: 'Enf202@BTX',
    name: 'Patrícia Monteiro',
    role: 'enfermagem',
    active: true,
    sectors: ['Centro Cirúrgico']
  },
  {
    id: uuidv4(),
    email: 'lucas.enf@btxhealth.com',
    password: 'Enf303@BTX',
    name: 'Lucas Pereira',
    role: 'enfermagem',
    active: true,
    sectors: ['Triagem']
  }
];

// Criar usuários para farmácia
export const farmaciaUsers: User[] = [
  {
    id: uuidv4(),
    email: 'amanda.farm@btxhealth.com',
    password: 'Farm123@BTX',
    name: 'Amanda Lopes',
    role: 'farmacia',
    active: true
  },
  {
    id: uuidv4(),
    email: 'gustavo.farm@btxhealth.com',
    password: 'Farm456@BTX',
    name: 'Gustavo Rocha',
    role: 'farmacia',
    active: true
  }
];

// Criar usuários para laboratório
export const laboratorioUsers: User[] = [
  {
    id: uuidv4(),
    email: 'maria.lab@btxhealth.com',
    password: 'Lab123@BTX',
    name: 'Maria Santos',
    role: 'laboratorio',
    active: true,
    sectors: ['Análises Clínicas']
  },
  {
    id: uuidv4(),
    email: 'jose.lab@btxhealth.com',
    password: 'Lab456@BTX',
    name: 'José Silva',
    role: 'laboratorio',
    active: true,
    sectors: ['Bioquímica']
  },
  {
    id: uuidv4(),
    email: 'ana.lab@btxhealth.com',
    password: 'Lab789@BTX',
    name: 'Ana Paula',
    role: 'laboratorio',
    active: true,
    sectors: ['Hematologia']
  }
];

// Criar usuários para financeiro
export const financeiroUsers: User[] = [
  {
    id: uuidv4(),
    email: 'mariana.fin@btxhealth.com',
    password: 'Fin123@BTX',
    name: 'Mariana Castro',
    role: 'financeiro',
    active: true
  },
  {
    id: uuidv4(),
    email: 'rafael.fin@btxhealth.com',
    password: 'Fin456@BTX',
    name: 'Rafael Andrade',
    role: 'financeiro',
    active: true
  },
  {
    id: uuidv4(),
    email: 'luiza.fin@btxhealth.com',
    password: 'Fin789@BTX',
    name: 'Luiza Moraes',
    role: 'financeiro',
    active: true
  },
  {
    id: uuidv4(),
    email: 'vitor.fin@btxhealth.com',
    password: 'Fin101@BTX',
    name: 'Vitor Garcia',
    role: 'financeiro',
    active: true
  }
];

// Criar usuários para RH
export const rhUsers: User[] = [
  {
    id: uuidv4(),
    email: 'beatriz.rh@btxhealth.com',
    password: 'RH123@BTX',
    name: 'Beatriz Dias',
    role: 'rh',
    active: true
  },
  {
    id: uuidv4(),
    email: 'henrique.rh@btxhealth.com',
    password: 'RH456@BTX',
    name: 'Henrique Nunes',
    role: 'rh',
    active: true
  },
  {
    id: uuidv4(),
    email: 'vanessa.rh@btxhealth.com',
    password: 'RH789@BTX',
    name: 'Vanessa Cardoso',
    role: 'rh',
    active: true
  },
  {
    id: uuidv4(),
    email: 'thiago.rh@btxhealth.com',
    password: 'RH101@BTX',
    name: 'Thiago Brito',
    role: 'rh',
    active: true
  }
];

// Criar usuários para admins
export const adminUsers: User[] = [
  {
    id: uuidv4(),
    email: 'paula.admin@btxhealth.com',
    password: 'Admin123@BTX',
    name: 'Paula Ribeiro',
    role: 'admin',
    active: true
  },
  {
    id: uuidv4(),
    email: 'andre.admin@btxhealth.com',
    password: 'Admin456@BTX',
    name: 'André Martins',
    role: 'admin',
    active: true
  },
  {
    id: uuidv4(),
    email: 'cristina.admin@btxhealth.com',
    password: 'Admin789@BTX',
    name: 'Cristina Duarte',
    role: 'admin',
    active: true
  },
  {
    id: uuidv4(),
    email: 'marcelo.admin@btxhealth.com',
    password: 'Admin101@BTX',
    name: 'Marcelo Freitas',
    role: 'admin',
    active: true
  }
];

// Combinar todos os usuários
export const allUsers: User[] = [
  ...medicosUsers,
  ...recepcaoUsers,
  ...enfermagemUsers,
  ...farmaciaUsers,
  ...financeiroUsers,
  ...rhUsers,
  ...adminUsers,
  ...laboratorioUsers
];

// Exportar usuários agrupados por função
export default {
  medicos: medicosUsers,
  recepcao: recepcaoUsers,
  enfermagem: enfermagemUsers,
  farmacia: farmaciaUsers,
  financeiro: financeiroUsers,
  rh: rhUsers,
  admin: adminUsers,
  laboratorio: laboratorioUsers,
  all: allUsers
}; 