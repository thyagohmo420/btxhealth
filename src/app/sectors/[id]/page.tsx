'use client'

import { useState, useEffect } from 'react'
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
  Building,
  Users,
  Bed,
  Map,
  Activity,
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
  Brain,
  ArrowRight,
  Upload,
  Camera,
  BarChart2,
  Filter,
  Download
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type { PatientStatus, PriorityType, Severity } from '@/types/patient'
import type { Sector, SectorPatient } from '@/types/sector'

// Dados simulados do setor
const sectorData: Sector = {
  id: 1,
  name: 'Pronto Socorro',
  type: 'assistencial',
  building: 'Prédio Principal',
  floor: '1',
  capacity: 20,
  currentOccupation: 15,
  floorPlan: null,
  status: 'active'
}

// Dados simulados de pacientes
const patientsData: SectorPatient[] = [
  {
    id: '1',
    full_name: 'João Silva',
    birth_date: '1978-05-15',
    gender: 'Masculino',
    cpf: '123.456.789-00',
    rg: 'MG-12.345.678',
    marital_status: 'Solteiro',
    phone: '(31) 98765-4321',
    email: 'joao.silva@example.com',
    address: 'Rua Exemplo, 123',
    city: 'Belo Horizonte',
    state: 'MG',
    zip_code: '30123-456',
    user_id: 'user-1',
    allergies: ['Dipirona'],
    blood_type: 'O+',
    emergency_contact: 'Maria Silva',
    created_at: '2024-03-15T09:00:00',
    updated_at: '2024-03-15T09:30:00',
    status: 'waiting' as PatientStatus,
    priority: 'high' as PriorityType,
    severity: 'medium' as Severity,
    record: '123456',
    risk: 'Alto',
    admissionDate: '2024-03-15T10:00:00',
    diagnosis: 'Trauma',
    movements: [
      {
        from: 'Triagem',
        to: 'Pronto Socorro',
        date: '2024-03-15T09:30:00',
        reason: 'Necessidade de atendimento emergencial'
      }
    ]
  }
]

// Dados simulados de profissionais
const professionalsData = [
  {
    id: 1,
    name: 'Dr. Carlos Silva',
    specialty: 'Clínico Geral',
    shift: 'manhã',
    status: 'active'
  },
  {
    id: 2,
    name: 'Enf. Maria Santos',
    specialty: 'Enfermagem',
    shift: 'tarde',
    status: 'active'
  }
]

// Dados simulados de inventário
const inventoryData = [
  {
    id: 1,
    name: 'Monitor Multiparâmetros',
    patrimony: 'EQ001',
    status: 'active',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-04-15',
    usage: 80,
    photo: null
  }
]

export default function SectorDetails({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const activeTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview'

  const [sector, setSector] = useState<Sector>(sectorData)
  const [patients, setPatients] = useState<SectorPatient[]>(patientsData)
  const [professionals, setProfessionals] = useState(professionalsData)
  const [inventory, setInventory] = useState(inventoryData)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [isPatientHistoryOpen, setIsPatientHistoryOpen] = useState(false)
  const [isInventoryDetailsOpen, setIsInventoryDetailsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<SectorPatient | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Indicadores
  const indicators = {
    occupationRate: Math.round((sector.currentOccupation / sector.capacity) * 100),
    averageStay: '2.5 dias',
    turnoverRate: '4.2',
    activeAlerts: 2
  }

  useEffect(() => {
    // Aqui seria a chamada para API para carregar os dados do setor
    console.log('Carregando dados do setor', params.id)
  }, [params.id])

  const handleViewPatientHistory = (patient: SectorPatient) => {
    setSelectedPatient(patient)
    setIsPatientHistoryOpen(true)
  }

  const handleViewInventoryDetails = (item: any) => {
    setSelectedItem(item)
    setIsInventoryDetailsOpen(true)
  }

  const handleExportData = (format: string) => {
    const data = {
      sector,
      patients,
      professionals,
      inventory
    }

    if (format === 'excel') {
      // Implementar exportação para Excel
      console.log('Exportando para Excel:', data)
    } else {
      // Implementar exportação para PDF
      console.log('Exportando para PDF:', data)
    }
  }

  const handleGenerateReport = () => {
    // Implementar geração de relatório
    console.log('Gerando relatório...')
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = (patient.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (patient.record?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || 
      (patient.admissionDate && new Date(patient.admissionDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
    
    const matchesRisk = !riskFilter || patient.risk === riskFilter

    return matchesSearch && matchesDate && matchesRisk
  })

  const handleMovePatient = (patient: SectorPatient, newSector: string) => {
    console.log('Movendo paciente', patient.id, 'para setor', newSector)
    
    setPatients(prev => prev.map(p => {
      if (p.id === patient.id) {
        return {
          ...p,
          movements: [
            ...(p.movements || []),
            {
              from: p.movements?.[p.movements.length - 1]?.to || '',
              to: newSector,
              date: new Date().toISOString(),
              reason: 'Transferência de setor'
            }
          ]
        }
      }
      return p
    }))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{sector.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportData('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportData('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Bed className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.occupationRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Permanência</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.averageStay}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rotatividade</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.turnoverRate}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {indicators.activeAlerts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa do Setor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mapa do Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
            {sector.floorPlan ? (
              <img 
                src={sector.floorPlan} 
                alt="Planta do setor" 
                className="w-full h-full object-contain"
              />
            ) : (
              <Map className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pacientes</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar paciente..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Input
              type="date"
              className="w-40"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="">Todos os Riscos</option>
              <option value="Alto">Alto</option>
              <option value="Médio">Médio</option>
              <option value="Baixo">Baixo</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Prontuário</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.full_name}</TableCell>
                  <TableCell>{patient.record}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs text-blue-600 bg-blue-100">
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.risk === 'Alto' ? 'text-red-600 bg-red-100' :
                      patient.risk === 'Médio' ? 'text-yellow-600 bg-yellow-100' :
                      'text-green-600 bg-green-100'
                    }`}>
                      {patient.risk}
                    </span>
                  </TableCell>
                  <TableCell>
                    {patient.admissionDate ? new Date(patient.admissionDate).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPatientHistory(patient)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMovePatient(patient, 'Pronto Socorro')}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lista de Profissionais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>{professional.name}</TableCell>
                  <TableCell>{professional.specialty}</TableCell>
                  <TableCell>{professional.shift}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs text-green-600 bg-green-100">
                      {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inventário */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Manutenção</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Taxa de Uso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.patrimony}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs text-green-600 bg-green-100">
                      {item.status === 'active' ? 'Ativo' : 'Em Manutenção'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(item.lastMaintenance).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(item.nextMaintenance).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.usage}%` }}
                        />
                      </div>
                      <span className="text-sm">{item.usage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewInventoryDetails(item)}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Histórico do Paciente */}
      <Dialog open={isPatientHistoryOpen} onOpenChange={setIsPatientHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico do Paciente - {selectedPatient?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <h4 className="font-medium mb-2">Movimentações</h4>
              <div className="space-y-2">
                {selectedPatient?.movements?.map((movement: { from: string; to: string; date: string; reason: string }, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <span>De: {movement.from}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>Para: {movement.to}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Data: {movement.date ? new Date(movement.date).toLocaleString() : ''}</span>
                    </div>
                    <div className="text-sm mt-1">{movement.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPatientHistoryOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Item */}
      <Dialog open={isInventoryDetailsOpen} onOpenChange={setIsInventoryDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Item - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Foto do Item</Label>
                <div className="mt-2 bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                  {selectedItem?.photo ? (
                    <img 
                      src={selectedItem.photo} 
                      alt={selectedItem.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Número do Patrimônio</Label>
                  <div className="mt-1 text-lg">{selectedItem?.patrimony}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <span className="px-2 py-1 rounded-full text-xs text-green-600 bg-green-100">
                      {selectedItem?.status === 'active' ? 'Ativo' : 'Em Manutenção'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Taxa de Utilização</Label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedItem?.usage}%` }}
                        />
                      </div>
                      <span className="text-sm">{selectedItem?.usage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label>Previsão de Manutenção</Label>
              <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">
                    IA sugere manutenção preventiva em {new Date(selectedItem?.nextMaintenance).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInventoryDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 