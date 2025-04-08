"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users,
  Settings as SettingsIcon,
  Database,
  Shield,
  Link,
  Layout,
  Brain,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  UserPlus,
  Key,
  Palette
} from 'lucide-react'
import PrivateRoute from '@/components/PrivateRoute'

// Tipos de usuário disponíveis
const userRoles = [
  { id: 'recepcao', name: 'Recepção', permissions: ['pacientes', 'agendamentos'] },
  { id: 'medico', name: 'Médico', permissions: ['pacientes', 'prontuarios', 'prescricoes'] },
  { id: 'enfermeiro', name: 'Enfermeiro', permissions: ['pacientes', 'prontuarios', 'medicamentos'] },
  { id: 'farmaceutico', name: 'Farmacêutico', permissions: ['medicamentos', 'estoque'] },
  { id: 'gestor_financeiro', name: 'Gestor Financeiro', permissions: ['financeiro', 'relatorios'] },
  { id: 'rh', name: 'RH', permissions: ['funcionarios', 'folha_pagamento'] },
  { id: 'admin', name: 'Administrador', permissions: ['todas'] }
]

// Dados simulados
const initialUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@hospital.com',
    role: 'medico',
    sectors: ['Emergência', 'UTI'],
    status: 'active',
    lastAccess: '2024-03-15T10:00:00'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@hospital.com',
    role: 'enfermeiro',
    sectors: ['Pediatria'],
    status: 'active',
    lastAccess: '2024-03-14T15:30:00'
  }
]

const initialIntegrations = [
  {
    id: 1,
    name: 'CNES',
    status: 'active',
    lastSync: '2024-03-15T08:00:00',
    nextSync: '2024-03-16T08:00:00'
  },
  {
    id: 2,
    name: 'e-SUS',
    status: 'active',
    lastSync: '2024-03-15T06:00:00',
    nextSync: '2024-03-16T06:00:00'
  },
  {
    id: 3,
    name: 'Telemedicina',
    status: 'pending',
    lastSync: null,
    nextSync: null
  }
]

const initialSecurityAlerts = [
  {
    id: 1,
    type: 'access',
    description: 'Tentativas de acesso suspeitas detectadas',
    severity: 'high',
    date: '2024-03-15T09:30:00'
  },
  {
    id: 2,
    type: 'permission',
    description: 'Alterações de permissões em massa detectadas',
    severity: 'medium',
    date: '2024-03-14T16:45:00'
  }
]

export default function SettingsPage() {
  const [users, setUsers] = useState(initialUsers)
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [securityAlerts, setSecurityAlerts] = useState(initialSecurityAlerts)
  const [isNewUserOpen, setIsNewUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isNewIntegrationOpen, setIsNewIntegrationOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('light')
  const [searchTerm, setSearchTerm] = useState('')

  // Função para filtrar usuários
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para criar novo usuário
  const handleNewUser = () => {
    setSelectedUser(null)
    setIsNewUserOpen(true)
  }

  // Função para editar usuário
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  // Função para excluir usuário
  const handleDeleteUser = async (userId: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        // Aqui seria implementada a chamada para API
        setUsers(users.filter(user => user.id !== userId))
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  // Função para salvar usuário
  const handleSaveUser = async (formData: any) => {
    try {
      if (selectedUser) {
        // Editar usuário existente
        setUsers(users.map(user =>
          user.id === selectedUser.id ? { ...user, ...formData } : user
        ))
      } else {
        // Criar novo usuário
        const newUser = {
          id: users.length + 1,
          ...formData,
          status: 'active',
          lastAccess: null
        }
        setUsers([...users, newUser])
      }
      setIsNewUserOpen(false)
      setIsEditUserOpen(false)
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    }
  }

  // Função para adicionar nova integração
  const handleNewIntegration = () => {
    setIsNewIntegrationOpen(true)
  }

  // Função para atualizar tema
  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    // Aqui seria implementada a lógica para atualizar o tema globalmente
  }

  return (
    <PrivateRoute allowedRoles={['administrador']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        {/* Seção de Usuários e Permissões */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários e Permissões
            </CardTitle>
            <Button onClick={handleNewUser}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Setores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'medico' ? 'bg-blue-100 text-blue-600' :
                        user.role === 'enfermeiro' ? 'bg-green-100 text-green-600' :
                        user.role === 'farmaceutico' ? 'bg-yellow-100 text-yellow-600' :
                        user.role === 'gestor_financeiro' ? 'bg-red-100 text-red-600' :
                        user.role === 'rh' ? 'bg-pink-100 text-pink-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {userRoles.find(role => role.id === user.role)?.name || user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.sectors.map((sector) => (
                          <span key={sector} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.lastAccess ? new Date(user.lastAccess).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Novo/Editar Usuário */}
        <Dialog open={isNewUserOpen || isEditUserOpen} onOpenChange={() => {
          setIsNewUserOpen(false)
          setIsEditUserOpen(false)
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  className="col-span-3"
                  placeholder="Nome completo"
                  defaultValue={selectedUser?.name}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  placeholder="email@hospital.com"
                  defaultValue={selectedUser?.email}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  defaultValue={selectedUser?.role}
                >
                  {userRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Setores</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="emergency"
                      defaultChecked={selectedUser?.sectors.includes('Emergência')}
                    />
                    <label htmlFor="emergency">Emergência</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="icu"
                      defaultChecked={selectedUser?.sectors.includes('UTI')}
                    />
                    <label htmlFor="icu">UTI</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="pediatrics"
                      defaultChecked={selectedUser?.sectors.includes('Pediatria')}
                    />
                    <label htmlFor="pediatrics">Pediatria</label>
                  </div>
                </div>
              </div>
              {!selectedUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    placeholder="Digite a senha"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNewUserOpen(false)
                setIsEditUserOpen(false)
              }}>
                Cancelar
              </Button>
              <Button onClick={() => handleSaveUser({
                name: (document.getElementById('name') as HTMLInputElement).value,
                email: (document.getElementById('email') as HTMLInputElement).value,
                role: (document.getElementById('role') as HTMLSelectElement).value,
                sectors: [
                  ...(document.getElementById('emergency') as HTMLInputElement).checked ? ['Emergência'] : [],
                  ...(document.getElementById('icu') as HTMLInputElement).checked ? ['UTI'] : [],
                  ...(document.getElementById('pediatrics') as HTMLInputElement).checked ? ['Pediatria'] : []
                ]
              })}>
                {selectedUser ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Seção de Integrações */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Integrações
            </CardTitle>
            <Button onClick={handleNewIntegration}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Sincronização</TableHead>
                  <TableHead>Próxima Sincronização</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>{integration.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        integration.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {integration.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {integration.nextSync ? new Date(integration.nextSync).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <SettingsIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Database className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Seção de Segurança */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança e Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Análise de Segurança IA</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Recomendações baseadas na análise dos últimos 30 dias:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Ativar autenticação em dois fatores para usuários administrativos</li>
                        <li>Revisar permissões de acesso em setores críticos</li>
                        <li>Atualizar políticas de senha para maior segurança</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Alertas de Segurança</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <span className="capitalize">{alert.type}</span>
                      </TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {alert.severity}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(alert.date).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Shield className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Label>Tema</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={selectedTheme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                  >
                    Claro
                  </Button>
                  <Button
                    variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                  >
                    Escuro
                  </Button>
                  <Button
                    variant={selectedTheme === 'system' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('system')}
                  >
                    Sistema
                  </Button>
                </div>
              </div>

              <div>
                <Label>Cores Personalizadas</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <Label>Cor Primária</Label>
                    <Input type="color" className="h-10 w-full" />
                  </div>
                  <div>
                    <Label>Cor Secundária</Label>
                    <Input type="color" className="h-10 w-full" />
                  </div>
                  <div>
                    <Label>Cor de Destaque</Label>
                    <Input type="color" className="h-10 w-full" />
                  </div>
                  <div>
                    <Label>Cor de Fundo</Label>
                    <Input type="color" className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Nova Integração */}
        <Dialog open={isNewIntegrationOpen} onOpenChange={setIsNewIntegrationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Integração</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="integration-type">Tipo</Label>
                <select
                  id="integration-type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="cnes">CNES</option>
                  <option value="esus">e-SUS</option>
                  <option value="telemedicine">Telemedicina</option>
                  <option value="lab">Sistema Laboratorial</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-key">Chave API</Label>
                <Input
                  id="api-key"
                  type="password"
                  className="col-span-3"
                  placeholder="Chave de API"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sync-frequency">Frequência de Sincronização</Label>
                <select
                  id="sync-frequency"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="1h">A cada hora</option>
                  <option value="6h">A cada 6 horas</option>
                  <option value="12h">A cada 12 horas</option>
                  <option value="24h">Diariamente</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Dados a Sincronizar</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sync-patients" />
                    <label htmlFor="sync-patients">Dados de Pacientes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sync-procedures" />
                    <label htmlFor="sync-procedures">Procedimentos</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sync-medications" />
                    <label htmlFor="sync-medications">Medicamentos</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewIntegrationOpen(false)}>
                Cancelar
              </Button>
              <Button>Adicionar Integração</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateRoute>
  )
} 