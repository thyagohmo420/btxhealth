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
  BarChart2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Dados simulados
const initialSectors = [
  {
    id: 1,
    name: 'Pronto Socorro',
    type: 'assistencial',
    building: 'Prédio Principal',
    floor: '1',
    capacity: 20,
    currentOccupation: 15,
    floorPlan: null,
    status: 'active'
  },
  {
    id: 2,
    name: 'Enfermaria',
    type: 'assistencial',
    building: 'Prédio Principal',
    floor: '2',
    capacity: 30,
    currentOccupation: 25,
    floorPlan: null,
    status: 'active'
  }
]

const initialPatients = [
  {
    id: 1,
    name: 'João Silva',
    age: 45,
    record: '123456',
    sector: 'Pronto Socorro',
    status: 'Em Atendimento',
    risk: 'Alto',
    admissionDate: '2024-03-15T10:00:00',
    diagnosis: 'Trauma'
  }
]

const initialProfessionals = [
  {
    id: 1,
    name: 'Dr. Carlos Silva',
    sector: 'Pronto Socorro',
    shift: 'manhã',
    specialty: 'Clínico Geral',
    status: 'active'
  }
]

const initialInventory = [
  {
    id: 1,
    name: 'Monitor Multiparâmetros',
    sector: 'Pronto Socorro',
    patrimony: 'EQ001',
    status: 'active',
    lastMaintenance: '2024-02-15',
    photo: null
  }
]

export default function Sectors() {
  const router = useRouter()
  const [sectors, setSectors] = useState(initialSectors)
  const [patients, setPatients] = useState(initialPatients)
  const [professionals, setProfessionals] = useState(initialProfessionals)
  const [inventory, setInventory] = useState(initialInventory)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewSectorOpen, setIsNewSectorOpen] = useState(false)
  const [isPatientMoveOpen, setIsPatientMoveOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Indicadores
  const indicators = {
    totalSectors: sectors.length,
    totalPatients: patients.length,
    occupationRate: Math.round(
      (sectors.reduce((acc, s) => acc + s.currentOccupation, 0) / 
      sectors.reduce((acc, s) => acc + s.capacity, 0)) * 100
    ),
    activeAlerts: 3
  }

  const handleNewSector = () => {
    setSelectedSector({
      id: Math.max(...sectors.map(s => s.id)) + 1,
      name: '',
      type: '',
      building: '',
      floor: '',
      capacity: 0,
      currentOccupation: 0,
      floorPlan: null,
      status: 'active'
    })
    setIsNewSectorOpen(true)
  }

  const handleMovePatient = (patient: any) => {
    setSelectedPatient(patient)
    setIsPatientMoveOpen(true)
  }

  const handleInventoryItem = (item: any) => {
    setSelectedItem(item)
    setIsInventoryOpen(true)
  }

  const handleSaveSector = () => {
    if (selectedSector.id) {
      setSectors(prev => [...prev, selectedSector])
    }
    setIsNewSectorOpen(false)
  }

  const handleSavePatientMove = () => {
    // Implementar movimentação do paciente
    setIsPatientMoveOpen(false)
  }

  const handleSaveInventory = () => {
    // Implementar salvamento do item no inventário
    setIsInventoryOpen(false)
  }

  const getSectorStatus = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 bg-green-100',
          text: 'Ativo'
        }
      case 'maintenance':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          text: 'Em Manutenção'
        }
      case 'inactive':
        return {
          color: 'text-red-600 bg-red-100',
          text: 'Inativo'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          text: status
        }
    }
  }

  const handleEditSector = (sector: any) => {
    setSelectedSector(sector)
    setIsNewSectorOpen(true)
  }

  const handleViewSectorMap = (sector: any) => {
    router.push(`/sectors/${sector.id}`)
  }

  const handleViewInventory = (sector: any) => {
    router.push(`/sectors/${sector.id}?tab=inventory`)
  }

  const handleViewGeneralMap = () => {
    // Implementar visualização do mapa geral
    console.log('Visualizando mapa geral...')
  }

  const handleViewAIAnalysis = () => {
    router.push('/sectors/analysis')
  }

  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Setores</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Setores</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalSectors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.totalPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Bed className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.occupationRate}%
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

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar setor..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewSector}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Setor
          </Button>
          <Button variant="outline" onClick={handleViewGeneralMap}>
            <Map className="w-4 h-4 mr-2" />
            Mapa Geral
          </Button>
          <Button variant="outline" onClick={handleViewAIAnalysis}>
            <Brain className="w-4 h-4 mr-2" />
            Análise IA
          </Button>
        </div>
      </div>

      {/* Lista de Setores */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSectors.map((sector) => {
                const status = getSectorStatus(sector.status)
                return (
                  <TableRow key={sector.id}>
                    <TableCell>{sector.name}</TableCell>
                    <TableCell>{sector.type}</TableCell>
                    <TableCell>{`${sector.building} - ${sector.floor}º Andar`}</TableCell>
                    <TableCell>{sector.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(sector.currentOccupation/sector.capacity)*100}%` }}
                          />
                        </div>
                        <span className="text-sm">{sector.currentOccupation}/{sector.capacity}</span>
                      </div>
                    </TableCell>
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
                          onClick={() => handleEditSector(sector)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSectorMap(sector)}
                          title="Visualizar"
                        >
                          <Map className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewInventory(sector)}
                          title="Inventário"
                        >
                          <FileText className="w-4 h-4" />
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

      {/* Modal de Novo/Editar Setor */}
      <Dialog open={isNewSectorOpen} onOpenChange={setIsNewSectorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSector?.id ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={selectedSector?.name}
                onChange={(e) => setSelectedSector({...selectedSector, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedSector?.type}
                onChange={(e) => setSelectedSector({...selectedSector, type: e.target.value})}
              >
                <option value="">Selecione o tipo</option>
                <option value="assistencial">Assistencial</option>
                <option value="administrativo">Administrativo</option>
                <option value="suporte">Suporte</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building">Prédio</Label>
              <Input
                id="building"
                className="col-span-3"
                value={selectedSector?.building}
                onChange={(e) => setSelectedSector({...selectedSector, building: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor">Andar</Label>
              <Input
                id="floor"
                type="number"
                className="col-span-3"
                value={selectedSector?.floor}
                onChange={(e) => setSelectedSector({...selectedSector, floor: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                className="col-span-3"
                value={selectedSector?.capacity}
                onChange={(e) => setSelectedSector({...selectedSector, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Planta Baixa</Label>
              <div className="col-span-3">
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload da Planta
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSectorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSector}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Movimentação de Paciente */}
      <Dialog open={isPatientMoveOpen} onOpenChange={setIsPatientMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Paciente</Label>
              <div className="col-span-3">{selectedPatient?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Setor Atual</Label>
              <div className="col-span-3">{selectedPatient?.sector}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newSector">Novo Setor</Label>
              <select
                id="newSector"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selecione o setor</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason">Motivo</Label>
              <textarea
                id="reason"
                className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPatientMoveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePatientMove}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Inventário */}
      <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventário do Setor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName">Nome do Item</Label>
              <Input
                id="itemName"
                className="col-span-3"
                value={selectedItem?.name}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patrimony">Nº Patrimônio</Label>
              <Input
                id="patrimony"
                className="col-span-3"
                value={selectedItem?.patrimony}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="active">Ativo</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="inactive">Indisponível</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Foto</Label>
              <div className="col-span-3">
                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload de Foto
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInventoryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveInventory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 