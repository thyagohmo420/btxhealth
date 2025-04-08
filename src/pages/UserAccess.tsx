import React, { useState } from 'react';
import { User, UserRole } from '@/data/users';
import users from '@/data/users';
import { getUserPermissions } from '@/data/permissions';
import { Copy, Eye, EyeOff, Filter, Search, UserPlus } from 'lucide-react';
import { Layout } from '@/components/Layout';

export default function UserAccess() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCopyCredentials = (user: User) => {
    const credentials = `Email: ${user.email}\nSenha: ${user.password}`;
    navigator.clipboard.writeText(credentials);
    alert('Credenciais copiadas para a área de transferência!');
  };

  const filteredUsers = users.all.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const groupedUsers: Record<UserRole, User[]> = {
    medico: users.medicos,
    recepcao: users.recepcao,
    enfermagem: users.enfermagem,
    farmacia: users.farmacia,
    financeiro: users.financeiro,
    rh: users.rh,
    admin: users.admin
  };

  const roleLabels: Record<UserRole, string> = {
    medico: 'Médico',
    recepcao: 'Recepção',
    enfermagem: 'Enfermagem',
    farmacia: 'Farmácia',
    financeiro: 'Financeiro',
    rh: 'Recursos Humanos',
    admin: 'Administrador'
  };

  const roleColors: Record<UserRole, string> = {
    medico: 'bg-blue-100 text-blue-800',
    recepcao: 'bg-green-100 text-green-800',
    enfermagem: 'bg-yellow-100 text-yellow-800',
    farmacia: 'bg-purple-100 text-purple-800',
    financeiro: 'bg-pink-100 text-pink-800',
    rh: 'bg-orange-100 text-orange-800',
    admin: 'bg-red-100 text-red-800'
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Acessos de Usuários</h1>
          <div className="flex items-center">
            <button
              className="btn btn-outline btn-sm mr-2"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPasswords ? 'Ocultar Senhas' : 'Mostrar Senhas'}
            </button>
            <button className="btn btn-primary btn-sm">
              <UserPlus className="w-4 h-4 mr-1" />
              Novo Usuário
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-1/4">
            <select
              className="select select-bordered w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            >
              <option value="all">Todos os perfis</option>
              <option value="medico">Médicos</option>
              <option value="recepcao">Recepção</option>
              <option value="enfermagem">Enfermagem</option>
              <option value="farmacia">Farmácia</option>
              <option value="financeiro">Financeiro</option>
              <option value="rh">RH</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
          <div className="form-control flex-1">
            <div className="input-group">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square">
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Senha</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-bold">{user.name}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="flex items-center">
                      <span className={showPasswords ? '' : 'filter blur-sm'}>
                        {user.password}
                      </span>
                      <button
                        className="btn btn-ghost btn-xs ml-2"
                        onClick={() => handleCopyCredentials(user)}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setSelectedUser(user)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Detalhes do Usuário: {selectedUser.name}</h2>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Informações Básicas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p>{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Função</p>
                    <p>{roleLabels[selectedUser.role]}</p>
                  </div>
                </div>

                <div className="divider"></div>

                <h3 className="font-semibold">Permissões</h3>
                <div className="mt-2">
                  {getUserPermissions(selectedUser.role).map(permission => (
                    <div key={permission.id} className="mb-2">
                      <span className="text-sm font-medium">{permission.name}</span>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  ))}
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resumo de Acessos por Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedUsers).map(([role, users]) => (
              <div key={role} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[role as UserRole]}`}>
                      {roleLabels[role as UserRole]}
                    </span>
                  </h3>
                  <p className="text-lg font-bold">{users.length} usuários</p>
                  <div className="text-sm text-gray-500">
                    <p>Acesso às páginas:</p>
                    <ul className="list-disc list-inside mt-1">
                      {getUserPermissions(role as UserRole)
                        .filter((p, i, arr) => arr.findIndex(p2 => p2.module === p.module) === i)
                        .map(permission => (
                          <li key={permission.module}>{permission.module}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 