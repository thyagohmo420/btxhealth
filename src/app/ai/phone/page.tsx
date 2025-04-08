'use client'

import React, { useState } from 'react'
import { 
  Phone, 
  Calendar, 
  Bell, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  Settings,
  UploadCloud,
  Plus,
  Search
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

// Dados simulados
const chamadas = [
  { 
    id: 1, 
    paciente: 'Maria Silva', 
    telefone: '(11) 98765-4321', 
    tipo: 'Confirmação',
    agendamento: '10/05/2023 - 14:30',
    status: 'Confirmado',
    data: '05/05/2023'
  },
  { 
    id: 2, 
    paciente: 'João Santos', 
    telefone: '(11) 91234-5678', 
    tipo: 'Lembrete',
    agendamento: '12/05/2023 - 09:00',
    status: 'Aguardando',
    data: '05/05/2023'
  },
  { 
    id: 3, 
    paciente: 'Carlos Oliveira', 
    telefone: '(11) 94567-8901', 
    tipo: 'Resultado',
    agendamento: 'N/A',
    status: 'Concluído',
    data: '04/05/2023'
  },
  { 
    id: 4, 
    paciente: 'Ana Pereira', 
    telefone: '(11) 92345-6789', 
    tipo: 'Confirmação',
    agendamento: '15/05/2023 - 16:00',
    status: 'Não atendeu',
    data: '04/05/2023'
  },
  { 
    id: 5, 
    paciente: 'Paulo Costa', 
    telefone: '(11) 97890-1234', 
    tipo: 'Lembrete',
    agendamento: '11/05/2023 - 10:30',
    status: 'Cancelado',
    data: '03/05/2023'
  },
]

const modelos = [
  { id: 1, nome: 'Confirmação de Consulta', ativo: true },
  { id: 2, nome: 'Lembrete 24h', ativo: true },
  { id: 3, nome: 'Aviso de Resultado', ativo: true },
  { id: 4, nome: 'Reagendamento', ativo: false },
]

export default function AIPhone() {
  const [activeTab, setActiveTab] = useState('chamadas')
  const [filtro, setFiltro] = useState('')
  const [servicoAtivo, setServicoAtivo] = useState(true)
  
  const chamadasFiltradas = chamadas.filter(chamada => 
    chamada.paciente.toLowerCase().includes(filtro.toLowerCase()) ||
    chamada.telefone.includes(filtro) ||
    chamada.tipo.toLowerCase().includes(filtro.toLowerCase())
  )
  
  const handleSimular = () => {
    toast.success('Chamada de teste iniciada. Verifique o áudio.')
  }
  
  const handleNovaRegra = () => {
    toast.success('Nova regra de automação adicionada.')
  }
  
  const handleUpload = () => {
    toast.success('Áudio personalizado enviado com sucesso.')
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">IA Telefonista</h1>
          <p className="text-gray-500">Gerenciamento de chamadas automatizadas</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="servico-ativo">Serviço ativo</Label>
            <Switch 
              id="servico-ativo" 
              checked={servicoAtivo} 
              onCheckedChange={setServicoAtivo} 
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('configuracoes')}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="chamadas" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chamadas">Chamadas</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de Voz</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chamadas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Chamadas Recentes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar chamadas..."
                      className="pl-8 w-64"
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Filtrar por data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chamadasFiltradas.map((chamada) => (
                    <TableRow key={chamada.id}>
                      <TableCell className="font-medium">{chamada.paciente}</TableCell>
                      <TableCell>{chamada.telefone}</TableCell>
                      <TableCell>{chamada.tipo}</TableCell>
                      <TableCell>{chamada.agendamento}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          chamada.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                          chamada.status === 'Aguardando' ? 'bg-blue-100 text-blue-800' :
                          chamada.status === 'Concluído' ? 'bg-purple-100 text-purple-800' :
                          chamada.status === 'Não atendeu' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {chamada.status}
                        </span>
                      </TableCell>
                      <TableCell>{chamada.data}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Refazer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Total: {chamadasFiltradas.length} chamadas
              </div>
              <Button>
                <Phone className="h-4 w-4 mr-2" />
                Nova Chamada
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Chamadas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">27</div>
                <p className="text-sm text-gray-500">+12% em relação a ontem</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">86%</div>
                <p className="text-sm text-gray-500">+3% em relação à média</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Consultas Confirmadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42</div>
                <p className="text-sm text-gray-500">Para os próximos 7 dias</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modelos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Voz</CardTitle>
              <CardDescription>
                Configuração de modelos de voz e mensagens para chamadas automatizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelos.map(modelo => (
                  <div key={modelo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{modelo.nome}</h3>
                      <p className="text-sm text-gray-500">Voz: Brasileira Feminina</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSimular}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Simular
                      </Button>
                      <Switch checked={modelo.ativo} />
                    </div>
                  </div>
                ))}
                
                <Button onClick={handleUpload} variant="outline" className="w-full">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Enviar áudio personalizado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Chamadas</CardTitle>
              <CardDescription>
                Configure as regras de automação de chamadas e integrações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callStrategy">Estratégia de chamadas</Label>
                <Select defaultValue="24h">
                  <SelectTrigger id="callStrategy">
                    <SelectValue placeholder="Selecione uma estratégia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas antes</SelectItem>
                    <SelectItem value="48h">48 horas antes</SelectItem>
                    <SelectItem value="72h">72 horas antes</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice">Voz padrão</Label>
                <Select defaultValue="female">
                  <SelectTrigger id="voice">
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Feminina (Brasileira)</SelectItem>
                    <SelectItem value="male">Masculina (Brasileiro)</SelectItem>
                    <SelectItem value="neutral">Neutra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="integration">Integração VoIP</Label>
                <Select defaultValue="twilio">
                  <SelectTrigger id="integration">
                    <SelectValue placeholder="Selecione uma integração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="vonage">Vonage</SelectItem>
                    <SelectItem value="custom">API Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retry">Política de tentativas</Label>
                <Select defaultValue="3">
                  <SelectTrigger id="retry">
                    <SelectValue placeholder="Selecione uma política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sem novas tentativas</SelectItem>
                    <SelectItem value="2">2 tentativas (intervalo de 15 min)</SelectItem>
                    <SelectItem value="3">3 tentativas (intervalo de 30 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleNovaRegra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra de Automação
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Integração com Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sincronização automática</h3>
                  <p className="text-sm text-gray-500">Sincronizar chamadas com a agenda</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Atualização após chamada</h3>
                  <p className="text-sm text-gray-500">Atualizar status na agenda após cada chamada</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificar recepção</h3>
                  <p className="text-sm text-gray-500">Enviar notificação aos recepcionistas sobre status das chamadas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 