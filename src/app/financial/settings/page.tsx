'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users,
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Lock,
  FileText,
  Bell,
  Database
} from 'lucide-react'

const settingsSections = [
  {
    id: 1,
    title: 'Usuários e Permissões',
    description: 'Gerenciar acessos e níveis de permissão do módulo financeiro',
    icon: Users,
    items: [
      'Grupos de Usuários',
      'Níveis de Acesso',
      'Auditoria de Ações'
    ]
  },
  {
    id: 2,
    title: 'Integração Bancária',
    description: 'Configurar contas e integrações bancárias',
    icon: CreditCard,
    items: [
      'Contas Bancárias',
      'APIs Bancárias',
      'Conciliação Automática'
    ]
  },
  {
    id: 3,
    title: 'Convênios e Tabelas',
    description: 'Gerenciar convênios e tabelas de preços',
    icon: Building2,
    items: [
      'Cadastro de Convênios',
      'Tabelas de Preços',
      'Regras de Faturamento'
    ]
  },
  {
    id: 4,
    title: 'Categorias Financeiras',
    description: 'Configurar categorias de receitas e despesas',
    icon: FileText,
    items: [
      'Plano de Contas',
      'Centros de Custo',
      'Classificação Contábil'
    ]
  },
  {
    id: 5,
    title: 'Notificações',
    description: 'Configurar alertas e notificações financeiras',
    icon: Bell,
    items: [
      'Alertas de Vencimento',
      'Notificações de Saldo',
      'Relatórios Automáticos'
    ]
  },
  {
    id: 6,
    title: 'Backup e Segurança',
    description: 'Configurações de backup e segurança dos dados',
    icon: Lock,
    items: [
      'Política de Backup',
      'Criptografia',
      'Logs de Sistema'
    ]
  }
]

export default function Settings() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configurações Financeiras</h1>
        
        <div className="flex gap-4">
          <Button>
            <SettingsIcon className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const IconComponent = section.icon
          return (
            <Card key={section.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconComponent className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Seção de Backup */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Database className="h-6 w-6 text-blue-500" />
            <div>
              <CardTitle>Backup do Sistema</CardTitle>
              <p className="text-sm text-gray-600">Último backup realizado em 20/03/2024 às 23:00</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              Fazer Backup Manual
            </Button>
            <Button variant="outline">
              Restaurar Backup
            </Button>
            <Button variant="outline">
              Configurar Backup Automático
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 