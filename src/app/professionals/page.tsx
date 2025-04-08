'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Star,
  MessageCircle,
  Clock,
  Bot,
  Pencil,
  Trash2,
  Brain
} from 'lucide-react'

// Dados simulados
const initialProfessionals = [
  {
    id: 1,
    name: 'Dr. Carlos Silva',
    cnes: '1234567890',
    specialty: 'Clínico Geral',
    crm: '12345-SP',
    sector: 'Pronto Socorro',
    status: 'active',
    rating: 4.8,
    schedule: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00'
    },
    bankHours: 40
  },
  {
    id: 2,
    name: 'Dra. Ana Santos',
    cnes: '0987654321',
    specialty: 'Pediatria',
    crm: '54321-SP',
    sector: 'Ambulatório',
    status: 'on_duty',
    rating: 4.9,
    schedule: {
      monday: '07:00-17:00',
      tuesday: '07:00-17:00',
      wednesday: '07:00-17:00',
      thursday: '07:00-17:00',
      friday: '07:00-17:00'
    },
    bankHours: 20
  }
]

const initialShifts = [
  {
    id: 1,
    professional: 'Dr. Carlos Silva',
    date: '2024-03-15',
    shift: 'Diurno',
    sector: 'Pronto Socorro',
    status: 'confirmed'
  }
]

const initialEvaluations = [
  {
    id: 1,
    professional: 'Dr. Carlos Silva',
    evaluator: 'Enfermeira Maria',
    rating: 4.8,
    comment: 'Excelente atendimento e trabalho em equipe',
    date: '2024-03-14'
  }
]

export default function Professionals() {
  const [professionals, setProfessionals] = useState(initialProfessionals)
  const [shifts, setShifts] = useState(initialShifts)
  const [evaluations, setEvaluations] = useState(initialEvaluations)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewProfessionalOpen, setIsNewProfessionalOpen] = useState(false)
  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false)
  const [isNewEvaluationOpen, setIsNewEvaluationOpen] = useState(false)
  const [isAIAllocationOpen, setIsAIAllocationOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)

  // Indicadores
  const indicators = {
    totalProfessionals: professionals.length,
    onDuty: professionals.filter(p => p.status === 'on_duty').length,
    averageRating: Math.round(
      professionals.reduce((acc, p) => acc + p.rating, 0) / professionals.length * 10
    ) / 10,
    totalBankHours: professionals.reduce((acc, p) => acc + p.bankHours, 0)
  }

  const handleNewProfessional = () => {
    setSelectedProfessional({
      id: Math.max(...professionals.map(p => p.id)) + 1,
      name: '',
      cnes: '',
      specialty: '',
      crm: '',
      sector: '',
      status: 'active',
      rating: 0,
      schedule: {},
      bankHours: 0
    })
    setIsNewProfessionalOpen(true)
  }

  const handleNewShift = () => {
    setIsNewShiftOpen(true)
  }

  const handleNewEvaluation = (professional: any) => {
    setSelectedProfessional(professional)
    setIsNewEvaluationOpen(true)
  }

  const handleAIAllocation = () => {
    setIsAIAllocationOpen(true)
  }

  const handleSaveProfessional = () => {
    setProfessionals(prev => [...prev, selectedProfessional])
    setIsNewProfessionalOpen(false)
  }

  const handleSaveShift = () => {
    // Implementar salvamento de plantão
    setIsNewShiftOpen(false)
  }

  const handleSaveEvaluation = () => {
    // Implementar salvamento de avaliação
    setIsNewEvaluationOpen(false)
  }

  const handleSaveAIAllocation = () => {
    // Implementar sugestão de alocação por IA
    setIsAIAllocationOpen(false)
  }

  const getProfessionalStatus = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 bg-green-100',
          text: 'Ativo'
        }
      case 'on_duty':
        return {
          color: 'text-blue-600 bg-blue-100',
          text: 'Em Plantão'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          text: status
        }
    }
  }

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Profissionais</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalProfessionals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Plantão</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.onDuty}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.averageRating}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Banco de Horas</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.totalBankHours}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar profissional..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewProfessional}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Profissional
          </Button>
          <Button onClick={handleNewShift} variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Novo Plantão
          </Button>
          <Button onClick={handleAIAllocation} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Sugestão IA
          </Button>
        </div>
      </div>

      {/* Tabela de Profissionais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNES</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessionals.map((professional) => {
                const status = getProfessionalStatus(professional.status)
                return (
                  <TableRow key={professional.id}>
                    <TableCell>{professional.name}</TableCell>
                    <TableCell>{professional.cnes}</TableCell>
                    <TableCell>{professional.specialty}</TableCell>
                    <TableCell>{professional.sector}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {professional.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleNewEvaluation(professional)}
                          title="Avaliar"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {}}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {}}
                          title="Excluir"
                          className="hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela de Plantões */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Escala de Plantões</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.professional}</TableCell>
                  <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
                  <TableCell>{shift.shift}</TableCell>
                  <TableCell>{shift.sector}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs text-green-600 bg-green-100">
                      {shift.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {}}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {}}
                        title="Excluir"
                        className="hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela de Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Horários Regulares</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Segunda</TableHead>
                <TableHead>Terça</TableHead>
                <TableHead>Quarta</TableHead>
                <TableHead>Quinta</TableHead>
                <TableHead>Sexta</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>{professional.name}</TableCell>
                  <TableCell>{professional.schedule.monday}</TableCell>
                  <TableCell>{professional.schedule.tuesday}</TableCell>
                  <TableCell>{professional.schedule.wednesday}</TableCell>
                  <TableCell>{professional.schedule.thursday}</TableCell>
                  <TableCell>{professional.schedule.friday}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {}}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Novo Profissional */}
      <Dialog open={isNewProfessionalOpen} onOpenChange={setIsNewProfessionalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Profissional</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={selectedProfessional?.name}
                onChange={(e) => setSelectedProfessional({...selectedProfessional, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnes">CNES</Label>
              <Input
                id="cnes"
                className="col-span-3"
                value={selectedProfessional?.cnes}
                onChange={(e) => setSelectedProfessional({...selectedProfessional, cnes: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                className="col-span-3"
                value={selectedProfessional?.specialty}
                onChange={(e) => setSelectedProfessional({...selectedProfessional, specialty: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                className="col-span-3"
                value={selectedProfessional?.crm}
                onChange={(e) => setSelectedProfessional({...selectedProfessional, crm: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector">Setor</Label>
              <Input
                id="sector"
                className="col-span-3"
                value={selectedProfessional?.sector}
                onChange={(e) => setSelectedProfessional({...selectedProfessional, sector: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProfessionalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProfessional}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Plantão */}
      <Dialog open={isNewShiftOpen} onOpenChange={setIsNewShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Plantão</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shiftProfessional">Profissional</Label>
              <select
                id="shiftProfessional"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione o profissional</option>
                {professionals.map(professional => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shiftDate">Data</Label>
              <Input
                id="shiftDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shiftType">Turno</Label>
              <select
                id="shiftType"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione o turno</option>
                <option value="day">Diurno</option>
                <option value="night">Noturno</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shiftSector">Setor</Label>
              <Input
                id="shiftSector"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewShiftOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveShift}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Avaliação */}
      <Dialog open={isNewEvaluationOpen} onOpenChange={setIsNewEvaluationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Profissional</Label>
              <div className="col-span-3">{selectedProfessional?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating">Avaliação</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment">Comentário</Label>
              <textarea
                id="comment"
                className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEvaluationOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEvaluation}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Sugestão IA */}
      <Dialog open={isAIAllocationOpen} onOpenChange={setIsAIAllocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugestão de Alocação por IA</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="text-sm text-gray-500">
                A IA está analisando a demanda histórica e perfil dos profissionais para sugerir a melhor alocação
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sugestões de Alocação:</h4>
              <ul className="space-y-2">
                <li className="text-sm">Dr. Carlos Silva → Pronto Socorro (Alta demanda prevista)</li>
                <li className="text-sm">Dra. Ana Santos → Ambulatório (Perfil adequado)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIAllocationOpen(false)}>Fechar</Button>
            <Button onClick={handleSaveAIAllocation}>Aplicar Sugestões</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 