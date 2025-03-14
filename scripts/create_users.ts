import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'sua-url-do-supabase';
const SUPABASE_SERVICE_KEY = 'sua-service-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DEFAULT_PASSWORD = 'BTxHealth@2024';

interface UserToCreate {
  email: string;
  role: 'receptionist' | 'nurse' | 'doctor' | 'admin';
  name: string;
}

const users: UserToCreate[] = [
  // Recepcionistas
  { email: 'recepcao1@btxhealth.com', role: 'receptionist', name: 'Recepção 1' },
  { email: 'recepcao2@btxhealth.com', role: 'receptionist', name: 'Recepção 2' },
  { email: 'recepcao3@btxhealth.com', role: 'receptionist', name: 'Recepção 3' },
  { email: 'recepcao4@btxhealth.com', role: 'receptionist', name: 'Recepção 4' },

  // Enfermeiros
  { email: 'enfermagem1@btxhealth.com', role: 'nurse', name: 'Enfermagem 1' },
  { email: 'enfermagem2@btxhealth.com', role: 'nurse', name: 'Enfermagem 2' },
  { email: 'enfermagem3@btxhealth.com', role: 'nurse', name: 'Enfermagem 3' },
  { email: 'enfermagem4@btxhealth.com', role: 'nurse', name: 'Enfermagem 4' },

  // Médicos
  { email: 'medico1@btxhealth.com', role: 'doctor', name: 'Dr. Médico 1' },
  { email: 'medico2@btxhealth.com', role: 'doctor', name: 'Dr. Médico 2' },
  { email: 'medico3@btxhealth.com', role: 'doctor', name: 'Dr. Médico 3' },
  { email: 'medico4@btxhealth.com', role: 'doctor', name: 'Dr. Médico 4' },
  { email: 'medico5@btxhealth.com', role: 'doctor', name: 'Dr. Médico 5' },
  { email: 'medico6@btxhealth.com', role: 'doctor', name: 'Dr. Médico 6' },
  { email: 'medico7@btxhealth.com', role: 'doctor', name: 'Dr. Médico 7' },
  { email: 'medico8@btxhealth.com', role: 'doctor', name: 'Dr. Médico 8' },
  { email: 'medico9@btxhealth.com', role: 'doctor', name: 'Dr. Médico 9' },
  { email: 'medico10@btxhealth.com', role: 'doctor', name: 'Dr. Médico 10' },

  // Diretores (Admin)
  { email: 'diretor1@btxhealth.com', role: 'admin', name: 'Diretor 1' },
  { email: 'diretor2@btxhealth.com', role: 'admin', name: 'Diretor 2' },
  { email: 'diretor3@btxhealth.com', role: 'admin', name: 'Diretor 3' },
  { email: 'diretor4@btxhealth.com', role: 'admin', name: 'Diretor 4' },
  { email: 'diretor5@btxhealth.com', role: 'admin', name: 'Diretor 5' },
  { email: 'diretor6@btxhealth.com', role: 'admin', name: 'Diretor 6' },
];

async function createUser(user: UserToCreate) {
  try {
    // Criar usuário no auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true
    });

    if (authError) {
      console.error(`Erro ao criar usuário ${user.email}:`, authError);
      return;
    }

    // Inserir na tabela users com o papel correto
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: user.email,
        role: user.role
      });

    if (userError) {
      console.error(`Erro ao inserir usuário ${user.email} na tabela users:`, userError);
      return;
    }

    console.log(`Usuário criado com sucesso: ${user.email}`);
  } catch (error) {
    console.error(`Erro ao processar usuário ${user.email}:`, error);
  }
}

async function createAllUsers() {
  for (const user of users) {
    await createUser(user);
  }
}

createAllUsers()
  .then(() => console.log('Processo finalizado'))
  .catch(console.error); 