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
  Activity,
  Heart,
  Thermometer,
  Droplet,
  AlertTriangle,
  Users,
  Brain,
  Clock,
  LineChart,
  Wifi,
  Bed,
  Home
} from 'lucide-react'

// Dados simulados
const initialPatients = [
  {
    id: 1,
    name: 'João Silva',
    age: 65,
    location: 'Leito 101',
    type: 'internado',
    vitals: {
      heartRate: 78,
      bloodPressure: '120/80',
      temperature: 36.5,
      oxygenation: 98
    },
    status: 'stable'
  },
  {
    id: 2,
    name: 'Maria Santos',
    age: 72,
    location: 'Domicílio',
    type: 'domiciliar',
    vitals: {
      heartRate: 82,
      bloodPressure: '135/85',
      temperature: 37.2,
      oxygenation: 95
    },
    status: 'attention'
  }
]

export default function Monitoring() {
  const [patients, setPatients] = useState(initialPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  // Indicadores
  const indicators = {
    totalMonitored: patients.length,
    requireAttention: patients.filter(p => p.status === 'attention').length,
    inHospital: patients.filter(p => p.type === 'internado').length,
    atHome: patients.filter(p => p.type === 'domiciliar').length
  }

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient)
    setIsPatientDetailsOpen(true)
  }

  const getPatientStatus = (status: string) => {
    switch (status) {
      case 'stable':
        return {
          color: 'text-green-600 bg-green-100',
          text: 'Estável'
        }
      case 'attention':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          text: 'Atenção'
        }
      case 'critical':
        return {
          color: 'text-red-600 bg-red-100',
          text: 'Crítico'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          text: status
        }
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoramento de Pacientes</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Monitorados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalMonitored}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requerem Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.requireAttention}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Internados</CardTitle>
            <Bed className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.inHospital}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Domiciliares</CardTitle>
            <Home className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.atHome}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar paciente..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewPatientOpen(true)}>
            <Wifi className="w-4 h-4 mr-2" />
            Novo Monitoramento
          </Button>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Monitorados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>FC</TableHead>
                <TableHead>PA</TableHead>
                <TableHead>SpO2</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const status = getPatientStatus(patient.status)
                return (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.location}</TableCell>
                    <TableCell>{patient.vitals.heartRate} bpm</TableCell>
                    <TableCell>{patient.vitals.bloodPressure}</TableCell>
                    <TableCell>{patient.vitals.oxygenation}%</TableCell>
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
                          onClick={() => handleViewPatient(patient)}
                        >
                          <Activity className="w-4 h-4" />
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

      {/* Modal de Novo Monitoramento */}
      <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Monitoramento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient">Paciente</Label>
              <Input
                id="patient"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location">Localização</Label>
              <select
                id="location"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione o tipo</option>
                <option value="internado">Leito Hospitalar</option>
                <option value="domiciliar">Domicílio</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="devices">Dispositivos</Label>
              <div className="col-span-3 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Oxímetro
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Monitor Cardíaco
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Pressão Arterial
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsNewPatientOpen(false)}>Iniciar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Paciente */}
      <Dialog open={isPatientDetailsOpen} onOpenChange={setIsPatientDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Monitoramento - {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Sinais Vitais em Tempo Real */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Freq. Cardíaca
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedPatient?.vitals.heartRate} <span className="text-sm font-normal">bpm</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Pressão Arterial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedPatient?.vitals.bloodPressure}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-yellow-500" />
                    Temperatura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedPatient?.vitals.temperature}°C
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-purple-500" />
                    SpO2
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedPatient?.vitals.oxygenation}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico e Alertas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Evolução 24h</h4>
                <div className="bg-gray-50 p-4 rounded-lg h-48 flex items-center justify-center">
                  <LineChart className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Alertas e Previsões</h4>
                <div className="bg-gray-50 p-4 rounded-lg h-48 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Pressão arterial acima do normal</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm">IA prevê tendência de normalização em 2h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPatientDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 