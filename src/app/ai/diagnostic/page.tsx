'use client'

import React, { useState } from 'react'
import { 
  Upload,
  Image as ImageIcon,
  FileText,
  BarChart,
  Microscope,
  Layers,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

const examesRecentes = [
  { 
    id: 1, 
    paciente: 'Maria Silva', 
    tipo: 'Raio-X', 
    parte: 'Tórax', 
    data: '12/04/2023', 
    status: 'Concluído',
    resultado: 'Sem alterações significativas. Parênquima pulmonar sem opacidades focais.'
  },
  { 
    id: 2, 
    paciente: 'João Pereira', 
    tipo: 'Tomografia', 
    parte: 'Crânio', 
    data: '15/04/2023', 
    status: 'Concluído',
    resultado: 'Ausência de lesões intracranianas agudas. Ventrículos de dimensões normais.'
  },
  { 
    id: 3, 
    paciente: 'Ana Santos', 
    tipo: 'Ressonância', 
    parte: 'Coluna Lombar', 
    data: '18/04/2023', 
    status: 'Em análise',
    resultado: ''
  },
  { 
    id: 4, 
    paciente: 'Carlos Oliveira', 
    tipo: 'Ultrassom', 
    parte: 'Abdome', 
    data: '20/04/2023', 
    status: 'Aguardando',
    resultado: ''
  },
]

const modelosIA = [
  { 
    id: 1, 
    nome: 'DiagnoseTórax v2', 
    especialidade: 'Radiologia Torácica', 
    precisao: 92, 
    dataAtualizacao: '05/03/2023',
    descricao: 'Modelo especializado na detecção de pneumonia, efusão pleural e tuberculose em radiografias de tórax.'
  },
  { 
    id: 2, 
    nome: 'NeuroScan', 
    especialidade: 'Neurologia', 
    precisao: 89, 
    dataAtualizacao: '12/02/2023',
    descricao: 'Detecção de acidente vascular cerebral (AVC), tumores cerebrais e alterações neurodegenerativas em TC e RM.'
  },
  { 
    id: 3, 
    nome: 'OrtopediaAI', 
    especialidade: 'Ortopedia', 
    precisao: 85, 
    dataAtualizacao: '20/01/2023',
    descricao: 'Identificação de fraturas, artrose e lesões em tecidos moles em radiografias e ressonâncias.'
  },
  { 
    id: 4, 
    nome: 'CardioView', 
    especialidade: 'Cardiologia', 
    precisao: 90, 
    dataAtualizacao: '28/03/2023',
    descricao: 'Análise de ecocardiogramas e angiotomografias para detecção de doenças cardiovasculares.'
  },
]

export default function AIdiagnostic() {
  const [activeTab, setActiveTab] = useState('exames')
  const [exameAtual, setExameAtual] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterTipo, setFilterTipo] = useState('')
  
  const handleUpload = () => {
    // Simulação de upload de arquivo
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(true)
          setTimeout(() => {
            setIsProcessing(false)
            alert('Análise concluída!')
          }, 3000)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }
  
  const filteredExames = examesRecentes.filter(exame => 
    filterTipo ? exame.tipo === filterTipo : true
  )
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">IA Diagnóstica</h1>
        <p className="text-muted-foreground">Plataforma de análise e diagnóstico por imagem com inteligência artificial</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exames">Exames Recentes</TabsTrigger>
          <TabsTrigger value="nova-analise">Nova Análise</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de IA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exames" className="flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Label htmlFor="filter-tipo">Filtrar por:</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo de Exame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="Raio-X">Raio-X</SelectItem>
                  <SelectItem value="Tomografia">Tomografia</SelectItem>
                  <SelectItem value="Ressonância">Ressonância</SelectItem>
                  <SelectItem value="Ultrassom">Ultrassom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {filteredExames.map(exame => (
              <Card key={exame.id} className="cursor-pointer hover:border-primary" 
                   onClick={() => setExameAtual(exame)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{exame.paciente}</CardTitle>
                      <CardDescription>{exame.tipo} - {exame.parte}</CardDescription>
                    </div>
                    <Badge variant={
                      exame.status === 'Concluído' ? 'default' : 
                      exame.status === 'Em análise' ? 'secondary' : 'outline'
                    }>
                      {exame.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 items-center">
                    <div className="bg-muted h-20 w-20 flex items-center justify-center rounded-md">
                      {exame.tipo === 'Raio-X' && <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                      {exame.tipo === 'Tomografia' && <Layers className="h-10 w-10 text-muted-foreground" />}
                      {exame.tipo === 'Ressonância' && <Microscope className="h-10 w-10 text-muted-foreground" />}
                      {exame.tipo === 'Ultrassom' && <BarChart className="h-10 w-10 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Data: {exame.data}</p>
                      {exame.resultado ? (
                        <p className="text-sm line-clamp-2">{exame.resultado}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Resultado pendente</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Ver detalhes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {exameAtual && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Detalhes do Exame</CardTitle>
                    <CardDescription>{exameAtual.tipo} - {exameAtual.parte} ({exameAtual.data})</CardDescription>
                  </div>
                  <Badge variant={
                    exameAtual.status === 'Concluído' ? 'default' : 
                    exameAtual.status === 'Em análise' ? 'secondary' : 'outline'
                  }>
                    {exameAtual.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Paciente</h3>
                  <p>{exameAtual.paciente}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Resultado da IA</h3>
                  {exameAtual.resultado ? (
                    <p>{exameAtual.resultado}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Resultado pendente</p>
                  )}
                </div>
                
                <div className="bg-muted h-64 flex items-center justify-center rounded-md">
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Visualização da imagem</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="nova-analise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Análise de Imagem</CardTitle>
              <CardDescription>Envie imagens médicas para análise pela IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Silva</SelectItem>
                    <SelectItem value="joao">João Pereira</SelectItem>
                    <SelectItem value="ana">Ana Santos</SelectItem>
                    <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo-exame">Tipo de Exame</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de exame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raio-x">Raio-X</SelectItem>
                    <SelectItem value="tomografia">Tomografia</SelectItem>
                    <SelectItem value="ressonancia">Ressonância Magnética</SelectItem>
                    <SelectItem value="ultrassom">Ultrassom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parte-corpo">Parte do Corpo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a parte do corpo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="torax">Tórax</SelectItem>
                    <SelectItem value="cranio">Crânio</SelectItem>
                    <SelectItem value="abdome">Abdome</SelectItem>
                    <SelectItem value="coluna">Coluna</SelectItem>
                    <SelectItem value="membros">Membros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelo-ia">Modelo de IA</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo de IA" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelosIA.map(modelo => (
                      <SelectItem key={modelo.id} value={modelo.id.toString()}>
                        {modelo.nome} - Precisão: {modelo.precisao}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Clínicas</Label>
                <Textarea 
                  placeholder="Informe sintomas ou observações relevantes que possam ajudar na análise"
                  className="min-h-24"
                />
              </div>
              
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">Arraste o arquivo ou clique para fazer upload</h3>
                <p className="text-sm text-muted-foreground mb-4">Suporta DICOM, JPEG, PNG (máx. 50MB)</p>
                <Button>Selecionar Arquivo</Button>
                
                {uploadProgress > 0 && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enviando arquivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                {isProcessing && (
                  <div className="flex items-center mt-4 text-amber-500">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span>Processando exame com IA...</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleUpload}>Iniciar Análise</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="modelos" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {modelosIA.map(modelo => (
              <Card key={modelo.id}>
                <CardHeader>
                  <CardTitle>{modelo.nome}</CardTitle>
                  <CardDescription>{modelo.especialidade}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precisão</span>
                      <span>{modelo.precisao}%</span>
                    </div>
                    <Progress value={modelo.precisao} className="h-2" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{modelo.descricao}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Última Atualização</h4>
                    <p className="text-sm text-muted-foreground">{modelo.dataAtualizacao}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Métricas
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <Button variant="outline" className="mb-2">
                <Upload className="h-4 w-4 mr-2" />
                Importar Novo Modelo
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Importe modelos personalizados para diferentes especialidades médicas
              </p>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>Informações importantes sobre os modelos de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Atualização Recomendada</h4>
                  <p className="text-sm text-muted-foreground">
                    O modelo DiagnoseTórax possui uma atualização disponível que melhora a detecção de pneumonia em 5%.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Novo Modelo Disponível</h4>
                  <p className="text-sm text-muted-foreground">
                    O modelo DermatoAI para análise de lesões cutâneas está disponível para instalação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 