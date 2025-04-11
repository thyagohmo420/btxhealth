import React from 'react';
import { Layout } from '@/components/Layout';
import { UserRole } from '@/data/users';
import users from '@/data/users';
import { Module, modulePages } from '@/data/permissions';

export default function UserAccessSummary() {
  // Mapear funções para títulos legíveis
  const roleTitles: Record<UserRole, string> = {
    medico: 'Médico',
    recepcao: 'Recepção',
    enfermagem: 'Enfermagem',
    farmacia: 'Farmácia',
    financeiro: 'Financeiro',
    rh: 'Recursos Humanos',
    admin: 'Administrador',
    laboratorio: 'Laboratório'
  };

  // Descrições das funções de cada tipo de acesso
  const roleDescriptions: Record<UserRole, string> = {
    medico: 'Acesso ao Consultório Médico, prontuários dos pacientes e prescrição de medicamentos',
    recepcao: 'Cadastro de pacientes, agendamento de consultas e gerenciamento da fila de atendimento',
    enfermagem: 'Triagem de pacientes, medição de sinais vitais e acompanhamento de pacientes',
    farmacia: 'Dispensação de medicamentos, controle de estoque e registro de medicamentos',
    financeiro: 'Gestão financeira, faturamento, pagamentos e relatórios financeiros',
    rh: 'Gestão de colaboradores, folha de pagamento e processos de RH',
    admin: 'Acesso administrativo completo ao sistema, incluindo configurações e gerenciamento de usuários',
    laboratorio: 'Realização de exames laboratoriais, registro de resultados e gestão de amostras'
  };

  // Módulos principais por tipo de acesso
  const roleModules: Record<UserRole, Module[]> = {
    medico: ['medicalOffice', 'patients'],
    recepcao: ['reception', 'patients'],
    enfermagem: ['triage', 'patients'],
    farmacia: ['pharmacy'],
    financeiro: ['financial', 'reports'],
    rh: ['hr', 'reports'],
    admin: ['admin', 'reception', 'triage', 'medicalOffice', 'pharmacy', 'financial', 'hr', 'patients', 'reports'],
    laboratorio: ['laboratory', 'patients']
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Resumo de Acessos de Usuários</h1>
        
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Informações de Acesso ao Sistema BTX Health</h2>
            <p className="mb-4">
              Abaixo estão os acessos criados para cada tipo de perfil, com suas respectivas credenciais.
              Cada usuário tem acesso apenas às funcionalidades específicas da sua função.
            </p>
            
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Tipo de Acesso</th>
                  <th>Quantidade</th>
                  <th>Funções</th>
                  <th>Páginas Acessíveis</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(users).filter(([key]) => key !== 'all').map(([role, userList]) => (
                  <tr key={role}>
                    <td className="font-medium">{roleTitles[role as UserRole]}</td>
                    <td>{userList.length}</td>
                    <td>{roleDescriptions[role as UserRole]}</td>
                    <td>
                      <ul className="list-disc list-inside">
                        {roleModules[role as UserRole].map(module => (
                          <li key={module}>{module}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Detalhes dos Usuários por Perfil</h2>
        
        {Object.entries(users).filter(([key]) => key !== 'all').map(([role, userList]) => (
          <div key={role} className="card bg-base-100 shadow-md mb-6">
            <div className="card-body">
              <h3 className="card-title">{roleTitles[role as UserRole]} ({userList.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="table table-compact w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Senha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
} 