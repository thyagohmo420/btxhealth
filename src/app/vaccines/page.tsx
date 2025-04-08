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
  Syringe,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  QrCode,
  Download,
  Clock,
  Users,
  Bot,
  Pencil,
  Trash2
} from 'lucide-react'

// Dados simulados
const initialVaccines = [
  {
    id: 1,
    name: 'COVID-19',
    manufacturer: 'Pfizer',
    batch: 'PF123456',
    expirationDate: '2024-12-31',
    quantity: 100,
    minQuantity: 20,
    status: 'active'
  },
  {
    id: 2,
    name: 'H1N1',
    manufacturer: 'Butantan',
    batch: 'BT789012',
    expirationDate: '2024-09-30',
    quantity: 50,
    minQuantity: 30,
    status: 'low_stock'
  }
]

const initialPatients = [
  {
    id: 1,
    name: 'João Silva',
    age: 35,
    cpf: '123.456.789-00',
    vaccines: [
      {
        name: 'COVID-19',
        date: '2024-03-01',
        batch: 'PF123456',
        nextDose: '2024-09-01'
      }
    ]
  }
]

const initialSchedules = [
  {
    id: 1,
    patientName: 'Maria Santos',
    vaccine: 'H1N1',
    date: '2024-03-20T10:00:00',
    status: 'scheduled'
  }
]

export default function Vaccines() {
  const [vaccines, setVaccines] = useState(initialVaccines)
  const [patients, setPatients] = useState(initialPatients)
  const [schedules, setSchedules] = useState(initialSchedules)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewVaccineOpen, setIsNewVaccineOpen] = useState(false)
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  // Indicadores
  const indicators = {
    totalVaccines: vaccines.length,
    lowStock: vaccines.filter(v => v.quantity <= v.minQuantity).length,
    scheduledToday: schedules.filter(s => 
      new Date(s.date).toDateString() === new Date().toDateString()
    ).length,
    totalVaccinated: patients.reduce((acc, p) => acc + p.vaccines.length, 0)
  }

  const handleNewVaccine = () => {
    setSelectedVaccine({
      id: Math.max(...vaccines.map(v => v.id)) + 1,
      name: '',
      manufacturer: '',
      batch: '',
      expirationDate: '',
      quantity: 0,
      minQuantity: 0,
      status: 'active'
    })
    setIsNewVaccineOpen(true)
  }

  const handleNewPatient = () => {
    setSelectedPatient({
      id: Math.max(...patients.map(p => p.id)) + 1,
      name: '',
      age: '',
      cpf: '',
      vaccines: []
    })
    setIsNewPatientOpen(true)
  }

  const handleNewSchedule = () => {
    setIsNewScheduleOpen(true)
  }

  const handleQRCodeScan = () => {
    setIsQRCodeOpen(true)
  }

  const handleGenerateCard = (patient: any) => {
    // Implementar geração de cartão de vacina em PDF
    console.log('Gerando cartão de vacina para:', patient.name)
  }

  const handleSaveVaccine = () => {
    setVaccines(prev => [...prev, selectedVaccine])
    setIsNewVaccineOpen(false)
  }

  const handleSavePatient = () => {
    setPatients(prev => [...prev, selectedPatient])
    setIsNewPatientOpen(false)
  }

  const handleSaveSchedule = () => {
    // Implementar salvamento de agendamento
    setIsNewScheduleOpen(false)
  }

  const getVaccineStatus = (vaccine: any) => {
    if (vaccine.quantity <= vaccine.minQuantity) {
      return {
        color: 'text-red-600 bg-red-100',
        text: 'Estoque Baixo'
      }
    }
    return {
      color: 'text-green-600 bg-green-100',
      text: 'Normal'
    }
  }

  const filteredVaccines = vaccines.filter(vaccine =>
    vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaccine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Vacinas</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vacinas</CardTitle>
            <Syringe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalVaccines}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {indicators.lowStock}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.scheduledToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vacinados</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.totalVaccinated}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar vacina..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewVaccine}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Vacina
          </Button>
          <Button onClick={handleNewPatient} variant="secondary">
            <Users className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
          <Button onClick={handleNewSchedule} variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
          <Button onClick={handleQRCodeScan} variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Ler QR Code
          </Button>
        </div>
      </div>

      {/* Tabela de Vacinas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estoque de Vacinas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaccines.map((vaccine) => {
                const status = getVaccineStatus(vaccine)
                return (
                  <TableRow key={vaccine.id}>
                    <TableCell>{vaccine.name}</TableCell>
                    <TableCell>{vaccine.manufacturer}</TableCell>
                    <TableCell>{vaccine.batch}</TableCell>
                    <TableCell>{new Date(vaccine.expirationDate).toLocaleDateString()}</TableCell>
                    <TableCell>{vaccine.quantity}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.text}
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Nova Vacina */}
      <Dialog open={isNewVaccineOpen} onOpenChange={setIsNewVaccineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Vacina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={selectedVaccine?.name}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                className="col-span-3"
                value={selectedVaccine?.manufacturer}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, manufacturer: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batch">Lote</Label>
              <Input
                id="batch"
                className="col-span-3"
                value={selectedVaccine?.batch}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, batch: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate">Validade</Label>
              <Input
                id="expirationDate"
                type="date"
                className="col-span-3"
                value={selectedVaccine?.expirationDate}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, expirationDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                value={selectedVaccine?.quantity}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minQuantity">Quantidade Mínima</Label>
              <Input
                id="minQuantity"
                type="number"
                className="col-span-3"
                value={selectedVaccine?.minQuantity}
                onChange={(e) => setSelectedVaccine({...selectedVaccine, minQuantity: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewVaccineOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveVaccine}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Paciente */}
      <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientName">Nome</Label>
              <Input
                id="patientName"
                className="col-span-3"
                value={selectedPatient?.name}
                onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                className="col-span-3"
                value={selectedPatient?.age}
                onChange={(e) => setSelectedPatient({...selectedPatient, age: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                className="col-span-3"
                value={selectedPatient?.cpf}
                onChange={(e) => setSelectedPatient({...selectedPatient, cpf: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePatient}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento */}
      <Dialog open={isNewScheduleOpen} onOpenChange={setIsNewScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedulePatient">Paciente</Label>
              <select
                id="schedulePatient"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione o paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduleVaccine">Vacina</Label>
              <select
                id="scheduleVaccine"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione a vacina</option>
                {vaccines.map(vaccine => (
                  <option key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduleDate">Data</Label>
              <Input
                id="scheduleDate"
                type="datetime-local"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewScheduleOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSchedule}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Leitura QR Code */}
      <Dialog open={isQRCodeOpen} onOpenChange={setIsQRCodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leitura de QR Code</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-center text-sm text-gray-500">
              Posicione o QR Code do lote da vacina para leitura
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRCodeOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 