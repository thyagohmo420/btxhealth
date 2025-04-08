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
  Pill,
  Search,
  AlertTriangle,
  Plus,
  QrCode,
  Download,
  Upload,
  FileText,
  Pencil,
  Trash2,
  ArrowDown,
  ArrowUp
} from 'lucide-react'

// Dados simulados
const initialMedicines = [
  {
    id: 1,
    name: 'Dipirona 500mg',
    type: 'Analgésico',
    quantity: 150,
    minQuantity: 50,
    expirationDate: '2025-12-31',
    sector: 'Pronto-Socorro',
    lastUpdate: '2024-03-15'
  },
  {
    id: 2,
    name: 'Amoxicilina 500mg',
    type: 'Antibiótico',
    quantity: 30,
    minQuantity: 40,
    expirationDate: '2025-06-30',
    sector: 'Ambulatório',
    lastUpdate: '2024-03-14'
  },
  {
    id: 3,
    name: 'Omeprazol 20mg',
    type: 'Protetor Gástrico',
    quantity: 200,
    minQuantity: 100,
    expirationDate: '2024-08-31',
    sector: 'Farmácia Central',
    lastUpdate: '2024-03-13'
  }
]

const initialPrescriptions = [
  {
    id: 1,
    patientName: 'João Silva',
    patientId: '123456',
    doctor: 'Dr. Maria Santos',
    medicines: ['Dipirona 500mg', 'Omeprazol 20mg'],
    date: '2024-03-15',
    status: 'pending',
    file: null
  }
]

export default function Pharmacy() {
  const [searchTerm, setSearchTerm] = useState('')
  const [medicines, setMedicines] = useState(initialMedicines)
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions)
  const [isNewMedicineOpen, setIsNewMedicineOpen] = useState(false)
  const [isNewDispenseOpen, setIsNewDispenseOpen] = useState(false)
  const [isViewPrescriptionOpen, setIsViewPrescriptionOpen] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [editingMedicine, setEditingMedicine] = useState({
    id: 0,
    name: '',
    type: '',
    quantity: 0,
    minQuantity: 0,
    expirationDate: '',
    sector: '',
    lastUpdate: ''
  })

  // Indicadores
  const indicators = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => m.quantity <= m.minQuantity).length,
    expiringIn30Days: medicines.filter(m => {
      const expDate = new Date(m.expirationDate)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expDate <= thirtyDaysFromNow
    }).length,
    pendingPrescriptions: prescriptions.filter(p => p.status === 'pending').length
  }

  const handleNewMedicine = () => {
    setEditingMedicine({
      id: Math.max(...medicines.map(m => m.id)) + 1,
      name: '',
      type: '',
      quantity: 0,
      minQuantity: 0,
      expirationDate: '',
      sector: '',
      lastUpdate: new Date().toISOString().split('T')[0]
    })
    setIsNewMedicineOpen(true)
  }

  const handleSaveMedicine = () => {
    setMedicines(prev => [...prev, editingMedicine])
    setIsNewMedicineOpen(false)
  }

  const handleDispenseMedicine = () => {
    setIsNewDispenseOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/csv') {
        setSelectedPrescription({
          ...selectedPrescription,
          file
        })
      } else {
        alert('Por favor, selecione um arquivo PDF ou CSV')
      }
    }
  }

  const handleDownloadFile = (prescription: any) => {
    if (prescription.file) {
      const url = URL.createObjectURL(prescription.file)
      const a = document.createElement('a')
      a.href = url
      a.download = `receita-${prescription.id}.${prescription.file.type === 'application/pdf' ? 'pdf' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleQRCodeScan = () => {
    // Implementar leitura de QR Code
    console.log('Iniciando leitura de QR Code')
  }

  const getStockStatus = (medicine: any) => {
    if (medicine.quantity <= medicine.minQuantity) {
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

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão da Farmácia</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Medicamentos</CardTitle>
            <Pill className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalMedicines}
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
            <CardTitle className="text-sm font-medium">Vencimento Próximo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.expiringIn30Days}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.pendingPrescriptions}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar medicamento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewMedicine}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Medicamento
          </Button>
          <Button onClick={handleDispenseMedicine} variant="secondary">
            <ArrowDown className="w-4 h-4 mr-2" />
            Dispensar
          </Button>
          <Button onClick={handleQRCodeScan} variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Ler QR Code
          </Button>
        </div>
      </div>

      {/* Tabela de Medicamentos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estoque de Medicamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const status = getStockStatus(medicine)
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>{medicine.type}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell>{medicine.minQuantity}</TableCell>
                    <TableCell>{new Date(medicine.expirationDate).toLocaleDateString()}</TableCell>
                    <TableCell>{medicine.sector}</TableCell>
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

      {/* Modal de Novo Medicamento */}
      <Dialog open={isNewMedicineOpen} onOpenChange={setIsNewMedicineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Medicamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={editingMedicine.name}
                onChange={(e) => setEditingMedicine({...editingMedicine, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <Input
                id="type"
                className="col-span-3"
                value={editingMedicine.type}
                onChange={(e) => setEditingMedicine({...editingMedicine, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                value={editingMedicine.quantity}
                onChange={(e) => setEditingMedicine({...editingMedicine, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minQuantity">Quantidade Mínima</Label>
              <Input
                id="minQuantity"
                type="number"
                className="col-span-3"
                value={editingMedicine.minQuantity}
                onChange={(e) => setEditingMedicine({...editingMedicine, minQuantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate">Data de Validade</Label>
              <Input
                id="expirationDate"
                type="date"
                className="col-span-3"
                value={editingMedicine.expirationDate}
                onChange={(e) => setEditingMedicine({...editingMedicine, expirationDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector">Setor</Label>
              <select
                id="sector"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingMedicine.sector}
                onChange={(e) => setEditingMedicine({...editingMedicine, sector: e.target.value})}
              >
                <option value="">Selecione um setor</option>
                <option value="Pronto-Socorro">Pronto-Socorro</option>
                <option value="Ambulatório">Ambulatório</option>
                <option value="Farmácia Central">Farmácia Central</option>
                <option value="UTI">UTI</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMedicineOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveMedicine}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Dispensação */}
      <Dialog open={isNewDispenseOpen} onOpenChange={setIsNewDispenseOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dispensar Medicamentos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <Input
                id="patientName"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientId">ID do Paciente</Label>
              <Input
                id="patientId"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prescription">Receita</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="prescription"
                  type="file"
                  accept=".pdf,.csv"
                  className="col-span-3"
                  onChange={handleFileChange}
                />
                {selectedPrescription?.file && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadFile(selectedPrescription)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicines">Medicamentos</Label>
              <select
                id="medicines"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                multiple
              >
                {medicines.map(medicine => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} - Disponível: {medicine.quantity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDispenseOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsNewDispenseOpen(false)}>Dispensar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 