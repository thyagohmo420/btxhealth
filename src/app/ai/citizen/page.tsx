'use client'

import React, { useState } from 'react'
import { 
  Users, 
  Search, 
  FileText, 
  Mail, 
  MessageSquare, 
  BarChart, 
  Clock, 
  CheckCircle 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const solicitacoes = [
  { id: 1, cidadao: 'Maria Silva', tipo: 'Agendamento', status: 'Pendente', data: '15/04/2023', detalhes: 'Solicitação de consulta com cardiologista' },
  { id: 2, cidadao: 'João Pereira', tipo: 'Informação', status: 'Respondido', data: '16/04/2023', detalhes: 'Dúvida sobre horário de funcionamento da UBS' },
  { id: 3, cidadao: 'Ana Santos', tipo: 'Documento', status: 'Concluído', data: '17/04/2023', detalhes: 'Requisição de cópia de prontuário' },
  { id: 4, cidadao: 'Carlos Oliveira', tipo: 'Reclamação', status: 'Em análise', data: '18/04/2023', detalhes: 'Reclamação sobre tempo de espera' },
  { id: 5, cidadao: 'Patrícia Lima', tipo: 'Agendamento', status: 'Pendente', data: '19/04/2023', detalhes: 'Solicitação de exame de sangue' },
]

const campanhas = [
  { id: 1, nome: 'Vacinação Infantil', status: 'Ativa', alcance: 2500, engajamento: 68, mensagens: 1200 },
  { id: 2, nome: 'Prevenção de Diabetes', status: 'Ativa', alcance: 3800, engajamento: 45, mensagens: 950 },
  { id: 3, nome: 'Campanha Outubro Rosa', status: 'Programada', alcance: 0, engajamento: 0, mensagens: 0 },
  { id: 4, nome: 'Doação de Sangue', status: 'Ativa', alcance: 1800, engajamento: 72, mensagens: 650 },
]

export default function AICitizen() {
  const [activeTab, setActiveTab] = useState('solicitacoes')
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredSolicitacoes = solicitacoes.filter(solicitacao => 
    solicitacao.cidadao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    solicitacao.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitacao.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">IA Cidadão</h1>
        <p className="text-muted-foreground">Central de relacionamento com o cidadão assistida por inteligência artificial</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="solicitacoes" className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar solicitações..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button>
              Nova Solicitação
            </Button>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between items-center">
                <CardTitle>Solicitações Recentes</CardTitle>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidadão</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolicitacoes.map(solicitacao => (
                    <TableRow key={solicitacao.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{solicitacao.cidadao.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{solicitacao.cidadao}</span>
                        </div>
                      </TableCell>
                      <TableCell>{solicitacao.tipo}</TableCell>
                      <TableCell>{solicitacao.data}</TableCell>
                      <TableCell>
                        <Badge variant={
                          solicitacao.status === 'Pendente' ? 'outline' :
                          solicitacao.status === 'Em análise' ? 'secondary' :
                          solicitacao.status === 'Respondido' ? 'default' :
                          'outline'
                        }>
                          {solicitacao.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{solicitacao.detalhes}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campanhas" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">Campanhas de Comunicação</h2>
            <Button>
              Nova Campanha
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {campanhas.map(campanha => (
              <Card key={campanha.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{campanha.nome}</CardTitle>
                      <CardDescription>Campanha de saúde pública</CardDescription>
                    </div>
                    <Badge variant={campanha.status === 'Ativa' ? 'default' : 'outline'}>
                      {campanha.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campanha.status === 'Ativa' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">{campanha.alcance}</span>
                        <span className="text-sm text-muted-foreground">Alcance</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">{campanha.engajamento}%</span>
                        <span className="text-sm text-muted-foreground">Engajamento</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">{campanha.mensagens}</span>
                        <span className="text-sm text-muted-foreground">Mensagens</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Público
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Mensagens
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart className="h-4 w-4 mr-2" />
                      Métricas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="metricas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Atendimento</CardTitle>
              <CardDescription>Desempenho do sistema de relacionamento com o cidadão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                        <p className="text-2xl font-bold">8 min</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                        <p className="text-2xl font-bold">92%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Solicitações Hoje</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Solicitações</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="h-16 w-16 mx-auto mb-4" />
                <p>Gráfico de distribuição de solicitações por tipo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 