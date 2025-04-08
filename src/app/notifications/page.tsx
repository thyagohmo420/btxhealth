"use client"

import { useState, useEffect } from 'react'
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
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Brain,
  AlertTriangle,
  Clock,
  Users,
  Activity,
  Filter,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react'
import PrivateRoute from '@/components/PrivateRoute'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  priority: string
  channel: string
  status: string
  recipient: string
  sentAt: string | null
  deliveredAt: string | null
}

// Dados simulados
const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Resultado de Exame Disponível',
    message: 'O resultado do exame de sangue está disponível',
    type: 'exam',
    priority: 'high',
    channel: 'whatsapp',
    status: 'sent',
    recipient: '+5511999999999',
    sentAt: '2024-03-15T10:00:00',
    deliveredAt: '2024-03-15T10:01:00'
  },
  {
    id: 2,
    title: 'Lembrete de Consulta',
    message: 'Sua consulta está agendada para amanhã às 14h',
    type: 'appointment',
    priority: 'medium',
    channel: 'sms',
    status: 'pending',
    recipient: '+5511988888888',
    sentAt: null,
    deliveredAt: null
  }
]

const initialMetrics = {
  totalSent: 1500,
  deliveryRate: 98,
  pendingNotifications: 45,
  failedDeliveries: 12
}

const initialTriggers = [
  {
    id: 1,
    event: 'exam_result',
    channels: ['whatsapp', 'sms'],
    active: true,
    template: 'Olá {name}, seu exame de {exam_type} está disponível.'
  },
  {
    id: 2,
    event: 'appointment_reminder',
    channels: ['whatsapp', 'sms', 'email'],
    active: true,
    template: 'Lembrete: sua consulta está marcada para {date} às {time}.'
  }
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [triggers, setTriggers] = useState(initialTriggers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isNewTriggerOpen, setIsNewTriggerOpen] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  // Função para filtrar notificações
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedType || notification.type === selectedType)
  )

  // Função para criar novo gatilho
  const handleNewTrigger = () => {
    setIsNewTriggerOpen(true)
  }

  // Função para editar template
  const handleEditTemplate = (trigger: any) => {
    setSelectedTemplate(trigger)
    setIsTemplateOpen(true)
  }

  // Função para reenviar notificação
  const handleResendNotification = async (notification: Notification) => {
    try {
      // Simulando reenvio
      console.log('Reenviando notificação:', notification)
      
      // Atualiza o estado
      const now = new Date().toISOString()
      setNotifications(prev => prev.map(n => {
        if (n.id === notification.id) {
          return {
            ...n,
            status: 'sent',
            sentAt: now,
            deliveredAt: null
          }
        }
        return n
      }))
    } catch (error) {
      console.error('Erro ao reenviar notificação:', error)
    }
  }

  return (
    <PrivateRoute allowedRoles={['medico', 'enfermeiro', 'administrador', 'recepcionista']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Notificações</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleNewTrigger}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Gatilho
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.deliveryRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.pendingNotifications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Falhas de Entrega</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.failedDeliveries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar notificação..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            <option value="exam">Exames</option>
            <option value="appointment">Consultas</option>
            <option value="medication">Medicamentos</option>
          </select>
        </div>

        {/* Lista de Gatilhos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gatilhos Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Canais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {triggers.map((trigger) => (
                  <TableRow key={trigger.id}>
                    <TableCell>{trigger.event}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {trigger.channels.map((channel) => (
                          <span key={channel} className={`px-2 py-1 rounded-full text-xs ${
                            channel === 'whatsapp' ? 'text-green-600 bg-green-100' :
                            channel === 'sms' ? 'text-blue-600 bg-blue-100' :
                            'text-purple-600 bg-purple-100'
                          }`}>
                            {channel}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trigger.active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {trigger.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{trigger.template}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTemplate(trigger)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notification.type === 'exam' ? 'text-purple-600 bg-purple-100' :
                        notification.type === 'appointment' ? 'text-blue-600 bg-blue-100' :
                        'text-green-600 bg-green-100'
                      }`}>
                        {notification.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notification.priority === 'high' ? 'text-red-600 bg-red-100' :
                        notification.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                        'text-green-600 bg-green-100'
                      }`}>
                        {notification.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notification.channel === 'whatsapp' ? 'text-green-600 bg-green-100' :
                        notification.channel === 'sms' ? 'text-blue-600 bg-blue-100' :
                        'text-purple-600 bg-purple-100'
                      }`}>
                        {notification.channel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notification.status === 'sent' ? 'text-green-600 bg-green-100' :
                        notification.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {notification.status}
                      </span>
                    </TableCell>
                    <TableCell>{notification.recipient}</TableCell>
                    <TableCell>
                      {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResendNotification(notification)}
                          disabled={notification.status === 'sent'}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Novo Gatilho */}
        <Dialog open={isNewTriggerOpen} onOpenChange={setIsNewTriggerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Gatilho</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event">Evento</Label>
                <select
                  id="event"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="exam_result">Resultado de Exame</option>
                  <option value="appointment_reminder">Lembrete de Consulta</option>
                  <option value="medication_ready">Medicamento Pronto</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Canais</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="whatsapp" />
                    <label htmlFor="whatsapp">WhatsApp</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sms" />
                    <label htmlFor="sms">SMS</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="email" />
                    <label htmlFor="email">E-mail</label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template">Template</Label>
                <textarea
                  id="template"
                  className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Use {variavel} para campos dinâmicos"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Prioridade</Label>
                <div className="col-span-3">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTriggerOpen(false)}>
                Cancelar
              </Button>
              <Button>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Template */}
        <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Sugestões da IA</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Com base na análise de engajamento, sugerimos:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Incluir o nome do paciente para personalização</li>
                        <li>Adicionar link direto para visualização do resultado</li>
                        <li>Manter a mensagem concisa (máx. 160 caracteres)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template">Template</Label>
                <textarea
                  id="template"
                  className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedTemplate?.template}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Variáveis Disponíveis</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{'{name}'}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{'{date}'}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{'{time}'}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{'{doctor}'}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{'{link}'}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
                Cancelar
              </Button>
              <Button>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateRoute>
  )
} 