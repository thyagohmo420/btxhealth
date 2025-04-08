'use client'

import React, { useState } from 'react'
import { 
  Users, 
  Search, 
  AlertCircle, 
  Heart, 
  Thermometer, 
  Stethoscope, 
  Clock, 
  ArrowRight, 
  Plus, 
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'

const pacientesEmEspera = [
  { 
    id: 1, 
    nome: 'Maria Silva', 
    idade: 45, 
    tempoEspera: '25min', 
    sintomas: 'Dor no peito, falta de ar', 
    prioridade: 'Emergência',
    sinaisVitais: { pa: '140/90', fc: 95, fr: 22, temp: 37.2, sat: 94 }
  },
  { 
    id: 2, 
    nome: 'João Pereira', 
    idade: 62, 
    tempoEspera: '40min', 
    sintomas: 'Tontura, náusea, sudorese', 
    prioridade: 'Urgente',
    sinaisVitais: { pa: '160/100', fc: 88, fr: 18, temp: 36.8, sat: 96 }
  },
  { 
    id: 3, 
    nome: 'Ana Santos', 
    idade: 28, 
    tempoEspera: '15min', 
    sintomas: 'Dor abdominal, vômito', 
    prioridade: 'Urgente',
    sinaisVitais: { pa: '110/70', fc: 102, fr: 20, temp: 38.2, sat: 98 }
  },
  { 
    id: 4, 
    nome: 'Carlos Oliveira', 
    idade: 35, 
    tempoEspera: '55min', 
    sintomas: 'Dor de cabeça, febre baixa', 
    prioridade: 'Pouco Urgente',
    sinaisVitais: { pa: '120/80', fc: 78, fr: 16, temp: 37.5, sat: 99 }
  },
  { 
    id: 5, 
    nome: 'Patrícia Lima', 
    idade: 50, 
    tempoEspera: '10min', 
    sintomas: 'Falta de ar, tosse', 
    prioridade: 'Muito Urgente',
    sinaisVitais: { pa: '135/85', fc: 105, fr: 24, temp: 37.0, sat: 92 }
  },
]

const protocolos = [
  { id: 1, nome: 'Protocolo de Manchester', ativo: true, tipo: 'Geral' },
  { id: 2, nome: 'Protocolo Pediátrico', ativo: true, tipo: 'Especializado' },
  { id: 3, nome: 'Protocolo Obstétrico', ativo: true, tipo: 'Especializado' },
  { id: 4, nome: 'Protocolo Cardíaco', ativo: false, tipo: 'Especializado' },
]

export default function AITriage() {
  const [activeTab, setActiveTab] = useState('fila')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPrioridade, setFilterPrioridade] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null)
  const [escalaDor, setEscalaDor] = useState(0)
  
  const filteredPacientes = pacientesEmEspera.filter(paciente => {
    const matchesSearch = paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         paciente.sintomas.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrioridade = filterPrioridade ? paciente.prioridade === filterPrioridade : true
    
    return matchesSearch && matchesPrioridade
  })
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">IA Triagem</h1>
        <p className="text-muted-foreground">Sistema de triagem inteligente para classificação de risco e priorização de atendimento</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fila">Fila de Espera</TabsTrigger>
          <TabsTrigger value="nova-triagem">Nova Triagem</TabsTrigger>
          <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fila" className="flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar pacientes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="Muito Urgente">Muito Urgente</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                  <SelectItem value="Pouco Urgente">Pouco Urgente</SelectItem>
                  <SelectItem value="Não Urgente">Não Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setActiveTab('nova-triagem')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Triagem
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle>Pacientes em Espera ({filteredPacientes.length})</CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Tempo</TableHead>
                        <TableHead>Sintomas</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPacientes.map(paciente => (
                        <TableRow key={paciente.id} onClick={() => setPacienteSelecionado(paciente)} className="cursor-pointer">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{paciente.nome.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{paciente.nome}</p>
                                <p className="text-sm text-muted-foreground">{paciente.idade} anos</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{paciente.tempoEspera}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{paciente.sintomas}</TableCell>
                          <TableCell>
                            <Badge variant={
                              paciente.prioridade === 'Emergência' ? 'destructive' :
                              paciente.prioridade === 'Muito Urgente' ? 'destructive' :
                              paciente.prioridade === 'Urgente' ? 'default' :
                              paciente.prioridade === 'Pouco Urgente' ? 'secondary' :
                              'outline'
                            }>
                              {paciente.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-2">
              {pacienteSelecionado ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pacienteSelecionado.nome}</CardTitle>
                        <CardDescription>{pacienteSelecionado.idade} anos</CardDescription>
                      </div>
                      <Badge variant={
                        pacienteSelecionado.prioridade === 'Emergência' ? 'destructive' :
                        pacienteSelecionado.prioridade === 'Muito Urgente' ? 'destructive' :
                        pacienteSelecionado.prioridade === 'Urgente' ? 'default' :
                        pacienteSelecionado.prioridade === 'Pouco Urgente' ? 'secondary' :
                        'outline'
                      }>
                        {pacienteSelecionado.prioridade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Sintomas Relatados</h3>
                      <p>{pacienteSelecionado.sintomas}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Sinais Vitais</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Pressão Arterial</span>
                            <span>{pacienteSelecionado.sinaisVitais.pa} mmHg</span>
                          </div>
                          <Progress value={
                            parseInt(pacienteSelecionado.sinaisVitais.pa.split('/')[0]) > 140 ? 90 :
                            parseInt(pacienteSelecionado.sinaisVitais.pa.split('/')[0]) > 120 ? 70 : 50
                          } className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Freq. Cardíaca</span>
                            <span>{pacienteSelecionado.sinaisVitais.fc} bpm</span>
                          </div>
                          <Progress value={
                            pacienteSelecionado.sinaisVitais.fc > 100 ? 80 :
                            pacienteSelecionado.sinaisVitais.fc > 90 ? 60 : 50
                          } className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Temperatura</span>
                            <span>{pacienteSelecionado.sinaisVitais.temp} °C</span>
                          </div>
                          <Progress value={
                            pacienteSelecionado.sinaisVitais.temp > 38 ? 80 :
                            pacienteSelecionado.sinaisVitais.temp > 37.5 ? 60 : 50
                          } className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Saturação O₂</span>
                            <span>{pacienteSelecionado.sinaisVitais.sat}%</span>
                          </div>
                          <Progress value={
                            pacienteSelecionado.sinaisVitais.sat < 95 ? 100 - pacienteSelecionado.sinaisVitais.sat : 50
                          } className="h-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-start space-x-3">
                        <Stethoscope className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Recomendação da IA</h3>
                          <p className="text-sm mt-1">
                            Com base nos sintomas e sinais vitais, o paciente deve ser 
                            classificado como <strong>{pacienteSelecionado.prioridade}</strong>. 
                            Considere exames laboratoriais e ECG prioritários.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      Editar Triagem
                    </Button>
                    <Button>
                      Encaminhar
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-lg mb-1">Nenhum paciente selecionado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecione um paciente da fila para visualizar seus detalhes e classificação
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab('nova-triagem')}>
                      Nova Triagem
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="nova-triagem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Triagem</CardTitle>
              <CardDescription>Realize a avaliação inicial do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">+ Novo paciente</SelectItem>
                      {pacientesEmEspera.map(paciente => (
                        <SelectItem key={paciente.id} value={paciente.id.toString()}>
                          {paciente.nome} ({paciente.idade} anos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Protocolo</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {protocolos.filter(p => p.ativo).map(protocolo => (
                        <SelectItem key={protocolo.id} value={protocolo.id.toString()}>
                          {protocolo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Queixa Principal</Label>
                <Textarea 
                  placeholder="Descreva o motivo da consulta e principais sintomas" 
                  className="min-h-20"
                />
              </div>
              
              <div>
                <Label className="mb-3 block">Escala de Dor (0-10)</Label>
                <div className="space-y-4">
                  <Slider
                    value={[escalaDor]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={values => setEscalaDor(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sem dor</span>
                    <span className="text-sm font-medium">{escalaDor}</span>
                    <span className="text-sm text-muted-foreground">Pior dor possível</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Sinais Vitais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pressão Arterial (mmHg)</Label>
                    <Input placeholder="Ex: 120/80" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frequência Cardíaca (bpm)</Label>
                    <Input type="number" placeholder="Ex: 80" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Temperatura (°C)</Label>
                    <Input type="number" step="0.1" placeholder="Ex: 36.5" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Saturação O₂ (%)</Label>
                    <Input type="number" placeholder="Ex: 98" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frequência Respiratória (irpm)</Label>
                    <Input type="number" placeholder="Ex: 16" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Glicemia (mg/dL)</Label>
                    <Input type="number" placeholder="Ex: 100" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Observações Adicionais</Label>
                <Textarea placeholder="Informações complementares importantes" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <div className="space-x-2">
                <Button variant="secondary">
                  Salvar Rascunho
                </Button>
                <Button>
                  Classificar Paciente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="protocolos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Protocolos de Classificação</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Protocolo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {protocolos.map(protocolo => (
              <Card key={protocolo.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{protocolo.nome}</CardTitle>
                      <CardDescription>Tipo: {protocolo.tipo}</CardDescription>
                    </div>
                    <Badge variant={protocolo.ativo ? 'default' : 'outline'}>
                      {protocolo.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {protocolo.nome === 'Protocolo de Manchester' && 
                      'Sistema de classificação de risco com cinco níveis de prioridade baseado em sintomas e sinais apresentados pelo paciente.'}
                    {protocolo.nome === 'Protocolo Pediátrico' && 
                      'Classificação adaptada para crianças, considerando parâmetros fisiológicos específicos para cada faixa etária.'}
                    {protocolo.nome === 'Protocolo Obstétrico' && 
                      'Protocolo especializado para gestantes, com foco em complicações da gravidez e trabalho de parto.'}
                    {protocolo.nome === 'Protocolo Cardíaco' && 
                      'Protocolo para sintomas cardiovasculares, com ênfase em dor torácica e alterações hemodinâmicas.'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                      <span className="text-sm">Emergência (Vermelho)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-orange-500" />
                      <span className="text-sm">Muito Urgente (Laranja)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      <span className="text-sm">Urgente (Amarelo)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <span className="text-sm">Pouco Urgente (Verde)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500" />
                      <span className="text-sm">Não Urgente (Azul)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button size="sm">
                    Configurar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 