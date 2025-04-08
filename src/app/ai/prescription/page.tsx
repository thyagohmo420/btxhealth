'use client'

import React, { useState } from 'react'
import { 
  FilePenLine, 
  FileText, 
  Search, 
  Plus,
  Edit,
  Trash,
  User,
  Pill,
  Calendar,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const prescricoes = [
  { 
    id: 1, 
    paciente: 'Maria Silva', 
    idade: 45, 
    medicamentos: ['Losartana 50mg', 'AAS 100mg'], 
    posologia: ['1 comprimido de 12/12h', '1 comprimido após almoço'], 
    medico: 'Dr. Carlos Mendes',
    data: '15/04/2023',
    status: 'Ativa'
  },
  { 
    id: 2, 
    paciente: 'João Pereira', 
    idade: 62, 
    medicamentos: ['Metformina 850mg', 'Sinvastatina 20mg', 'Enalapril 10mg'], 
    posologia: ['1 comprimido após café e jantar', '1 comprimido à noite', '1 comprimido pela manhã'], 
    medico: 'Dra. Ana Soares',
    data: '10/04/2023',
    status: 'Ativa'
  },
  { 
    id: 3, 
    paciente: 'Ana Santos', 
    idade: 28, 
    medicamentos: ['Amoxicilina 500mg', 'Ibuprofeno 600mg'], 
    posologia: ['1 cápsula de 8/8h por 7 dias', '1 comprimido de 8/8h se dor'], 
    medico: 'Dr. Ricardo Alves',
    data: '12/04/2023',
    status: 'Finalizada'
  },
]

const medicamentosComuns = [
  { nome: 'Losartana', concentracao: '50mg', categoria: 'Anti-hipertensivo' },
  { nome: 'Metformina', concentracao: '850mg', categoria: 'Antidiabético' },
  { nome: 'Sinvastatina', concentracao: '20mg', categoria: 'Redutor de colesterol' },
  { nome: 'Omeprazol', concentracao: '20mg', categoria: 'Protetor gástrico' },
  { nome: 'Dipirona', concentracao: '500mg', categoria: 'Analgésico' },
  { nome: 'Amoxicilina', concentracao: '500mg', categoria: 'Antibiótico' },
]

export default function AIPrescription() {
  const [activeTab, setActiveTab] = useState('prescricoes')
  const [searchTerm, setSearchTerm] = useState('')
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState([''])
  const [posologiaSelecionada, setPosologiaSelecionada] = useState([''])
  
  const handleAddMedicamento = () => {
    setMedicamentosSelecionados([...medicamentosSelecionados, ''])
    setPosologiaSelecionada([...posologiaSelecionada, ''])
  }
  
  const handleRemoveMedicamento = (index: number) => {
    const novosMedicamentos = [...medicamentosSelecionados]
    const novasPosologias = [...posologiaSelecionada]
    novosMedicamentos.splice(index, 1)
    novasPosologias.splice(index, 1)
    setMedicamentosSelecionados(novosMedicamentos)
    setPosologiaSelecionada(novasPosologias)
  }
  
  const filteredPrescricoes = prescricoes.filter(prescricao => 
    prescricao.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prescricao.medico.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">IA Prescrição</h1>
        <p className="text-muted-foreground">Sistema de prescrição médica assistida por inteligência artificial</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="nova-prescricao">Nova Prescrição</TabsTrigger>
          <TabsTrigger value="biblioteca">Biblioteca Medicamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescricoes" className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar prescrições..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setActiveTab('nova-prescricao')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Prescrições Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Medicamentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescricoes.map(prescricao => (
                    <TableRow key={prescricao.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescricao.paciente}</p>
                          <p className="text-sm text-muted-foreground">{prescricao.idade} anos</p>
                        </div>
                      </TableCell>
                      <TableCell>{prescricao.medico}</TableCell>
                      <TableCell>{prescricao.data}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prescricao.medicamentos.map((med, index) => (
                            <div key={index}>
                              <Badge variant="outline" className="mr-1">
                                {med}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prescricao.status === 'Ativa' ? 'default' : 'secondary'}>
                          {prescricao.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="mr-1">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nova-prescricao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Prescrição Médica</CardTitle>
              <CardDescription>Crie uma nova prescrição com recomendações da IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paciente</label>
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maria">Maria Silva (45 anos)</SelectItem>
                        <SelectItem value="joao">João Pereira (62 anos)</SelectItem>
                        <SelectItem value="ana">Ana Santos (28 anos)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <div className="flex space-x-2">
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    <Button variant="outline" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnóstico / CID</label>
                <Input placeholder="Digite o diagnóstico ou CID" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Medicamentos e Posologia</label>
                  <Button variant="outline" size="sm" onClick={handleAddMedicamento}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                {medicamentosSelecionados.map((med, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o medicamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicamentosComuns.map((m, i) => (
                          <SelectItem key={i} value={`${m.nome} ${m.concentracao}`}>
                            {m.nome} {m.concentracao} ({m.categoria})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      placeholder="Posologia (ex: 1 comp. 12/12h)" 
                      value={posologiaSelecionada[index]} 
                      onChange={(e) => {
                        const novasPosologias = [...posologiaSelecionada]
                        novasPosologias[index] = e.target.value
                        setPosologiaSelecionada(novasPosologias)
                      }}
                    />
                    
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveMedicamento(index)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea 
                  placeholder="Informações adicionais para o paciente"
                  className="min-h-20"
                />
              </div>
              
              <Card className="bg-muted/50">
                <CardHeader className="py-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">Recomendações da IA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Interação medicamentosa:</span> Losartana e AAS podem aumentar o risco de sangramento. Considere monitoramento.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Dose apropriada:</span> A dose de Losartana está adequada para o perfil do paciente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <FilePenLine className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Emitir Prescrição
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="biblioteca" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar medicamentos..." className="flex-1" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Medicamento
            </Button>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Biblioteca de Medicamentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicamento</TableHead>
                    <TableHead>Concentração</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Posologia Comum</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicamentosComuns.map((med, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{med.nome}</TableCell>
                      <TableCell>{med.concentracao}</TableCell>
                      <TableCell>{med.categoria}</TableCell>
                      <TableCell>
                        {med.nome === 'Losartana' && '1 comprimido de 12/12h'}
                        {med.nome === 'Metformina' && '1 comprimido após refeições principais'}
                        {med.nome === 'Sinvastatina' && '1 comprimido à noite'}
                        {med.nome === 'Omeprazol' && '1 cápsula em jejum pela manhã'}
                        {med.nome === 'Dipirona' && '1 comprimido de 6/6h se dor ou febre'}
                        {med.nome === 'Amoxicilina' && '1 cápsula de 8/8h por 7 dias'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-1">
                          <Pill className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="mr-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 