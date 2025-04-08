'use client'

import React, { useState } from 'react'
import { 
  MessageSquare,
  Send,
  UserPlus,
  Users,
  Upload,
  Settings,
  Search,
  ChevronDown,
  Phone,
  Video,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

const contatos = [
  { id: 1, nome: 'Maria Silva', numero: '(11) 98765-4321', ultimaMensagem: 'Bom dia! Gostaria de agendar uma consulta', horario: '09:30', naoLidas: 2 },
  { id: 2, nome: 'João Pereira', numero: '(11) 91234-5678', ultimaMensagem: 'Qual o horário de funcionamento da clínica?', horario: '11:45', naoLidas: 0 },
  { id: 3, nome: 'Ana Santos', numero: '(11) 99876-5432', ultimaMensagem: 'Meu exame já está pronto?', horario: '13:20', naoLidas: 1 },
  { id: 4, nome: 'Carlos Oliveira', numero: '(11) 97654-3210', ultimaMensagem: 'Preciso remarcar minha consulta', horario: '15:05', naoLidas: 0 },
  { id: 5, nome: 'Patrícia Lima', numero: '(11) 98888-7777', ultimaMensagem: 'Obrigada pelo atendimento de hoje', horario: '16:30', naoLidas: 0 },
]

const conversas = [
  { id: 1, contato: contatos[0], mensagens: [
    { remetente: 'contato', texto: 'Bom dia! Gostaria de agendar uma consulta', horario: '09:30' },
    { remetente: 'ia', texto: 'Bom dia, Maria! Claro, posso ajudar com o agendamento. Qual especialidade você precisa?', horario: '09:31' },
    { remetente: 'contato', texto: 'Preciso de um clínico geral', horario: '09:32' },
    { remetente: 'ia', texto: 'Temos disponibilidade para clínico geral nos seguintes horários: amanhã às 10h, 14h ou 16h. Qual seria melhor para você?', horario: '09:33' },
  ]},
  { id: 2, contato: contatos[1], mensagens: [
    { remetente: 'contato', texto: 'Qual o horário de funcionamento da clínica?', horario: '11:45' },
    { remetente: 'ia', texto: 'Olá João! Nossa clínica funciona de segunda a sexta das 8h às 20h, e aos sábados das 8h às 12h. Posso ajudar com mais alguma informação?', horario: '11:46' },
  ]},
]

const modelos = [
  { id: 1, nome: 'Atendimento Básico', descricao: 'Responde perguntas gerais sobre a clínica, horários e serviços', ativo: true },
  { id: 2, nome: 'Agendamento Automático', descricao: 'Capaz de agendar consultas verificando disponibilidade na agenda', ativo: true },
  { id: 3, nome: 'Orientações Pré-consulta', descricao: 'Envia lembretes e instruções antes de consultas agendadas', ativo: false },
  { id: 4, nome: 'Confirmação de Presença', descricao: 'Confirma presença do paciente automaticamente', ativo: true },
]

export default function AIWhatsApp() {
  const [activeTab, setActiveTab] = useState('conversas')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChat, setSelectedChat] = useState(conversas[0])
  const [newMessage, setNewMessage] = useState('')
  const [autoResponse, setAutoResponse] = useState(true)
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return
    
    // Implementação simplificada para demonstração
    setNewMessage('')
    // Em uma implementação real, aqui enviaria a mensagem e atualizaria o estado
    alert('Mensagem enviada: ' + newMessage)
  }
  
  const filteredContacts = contatos.filter(contato => 
    contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contato.numero.includes(searchTerm)
  )
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">IA WhatsApp</h1>
        <p className="text-muted-foreground">Gerencie as comunicações automáticas via WhatsApp</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversas">Conversas</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de IA</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversas" className="flex-1 flex flex-col space-y-4">
          <div className="flex space-x-4 h-[calc(100vh-220px)]">
            {/* Lista de contatos */}
            <Card className="w-1/3">
              <CardHeader className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar contato..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-70px)]">
                <div className="space-y-1">
                  {filteredContacts.map((contato) => (
                    <div 
                      key={contato.id}
                      className={`p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer ${selectedChat.contato.id === contato.id ? 'bg-muted' : ''}`}
                      onClick={() => {
                        const chat = conversas.find(c => c.contato.id === contato.id)
                        if (chat) setSelectedChat(chat)
                      }}
                    >
                      <Avatar>
                        <AvatarFallback>{contato.nome.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{contato.nome}</p>
                          <span className="text-xs text-muted-foreground">{contato.horario}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contato.ultimaMensagem}</p>
                      </div>
                      {contato.naoLidas > 0 && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">{contato.naoLidas}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Área de conversa */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{selectedChat.contato.nome.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedChat.contato.nome}</h3>
                      <p className="text-xs text-muted-foreground">{selectedChat.contato.numero}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.mensagens.map((mensagem, index) => (
                  <div 
                    key={index} 
                    className={`flex ${mensagem.remetente === 'contato' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        mensagem.remetente === 'contato' 
                          ? 'bg-muted text-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p>{mensagem.texto}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">{mensagem.horario}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea 
                    placeholder="Digite uma mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-10 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modelos" className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {modelos.map((modelo) => (
              <Card key={modelo.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{modelo.nome}</CardTitle>
                      <CardDescription>{modelo.descricao}</CardDescription>
                    </div>
                    <Switch checked={modelo.ativo} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Treinar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <Button variant="outline" className="mb-2">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar novo modelo
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Crie modelos personalizados para diferentes necessidades
              </p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure as preferências do sistema de IA do WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="auto-response" className="text-base">Resposta Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita respostas automáticas para todas as mensagens recebidas
                  </p>
                </div>
                <Switch 
                  id="auto-response" 
                  checked={autoResponse} 
                  onCheckedChange={setAutoResponse} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="business-hours" className="text-base">Apenas no horário comercial</Label>
                  <p className="text-sm text-muted-foreground">
                    Limita respostas automáticas ao horário de funcionamento
                  </p>
                </div>
                <Switch id="business-hours" checked={true} />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="default-message" className="text-base mb-2 block">Mensagem Padrão Fora do Expediente</Label>
                <Textarea 
                  id="default-message" 
                  placeholder="Digite a mensagem padrão..."
                  defaultValue="Obrigado por entrar em contato! Nosso horário de atendimento é de segunda a sexta, das 8h às 20h. Retornaremos sua mensagem assim que possível."
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conexão do WhatsApp</CardTitle>
              <CardDescription>Configure a integração com a API do WhatsApp Business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="text-base mb-2 block">Chave de API</Label>
                <Input id="api-key" type="password" value="••••••••••••••••••••••" />
              </div>
              
              <div>
                <Label htmlFor="webhook" className="text-base mb-2 block">URL do Webhook</Label>
                <Input id="webhook" value="https://btxhealth.com.br/api/whatsapp/webhook" />
              </div>
              
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Conexão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 