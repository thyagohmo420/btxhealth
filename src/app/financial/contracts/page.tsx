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
  FileText,
  Download, 
  Plus, 
  Search,
  AlertTriangle,
  FileIcon,
  Pencil,
  Trash2,
  Upload
} from 'lucide-react'

// Dados simulados
const initialContracts = [
  {
    id: 1,
    name: 'Contrato Unimed',
    type: 'Convênio',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    value: 250000.00,
    status: 'active',
    lastUpdate: '2024-03-01',
    file: null
  },
  {
    id: 2,
    name: 'Contrato Bradesco Saúde',
    type: 'Convênio',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    value: 180000.00,
    status: 'active',
    lastUpdate: '2024-02-15',
    file: null
  },
  {
    id: 3,
    name: 'Contrato Manutenção Equipamentos',
    type: 'Fornecedor',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    value: 12000.00,
    status: 'pending_renewal',
    lastUpdate: '2024-03-10',
    file: null
  }
]

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [contracts, setContracts] = useState(initialContracts)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingContract, setEditingContract] = useState({
    id: 0,
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    value: 0,
    status: '',
    lastUpdate: '',
    file: null as File | null
  })

  // Cálculo dos indicadores baseado nos contratos
  const indicators = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalValue: contracts.reduce((total, contract) => total + contract.value, 0),
    pendingRenewal: contracts.filter(c => c.status === 'pending_renewal').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending_renewal':
        return 'text-yellow-600 bg-yellow-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'pending_renewal':
        return 'Renovação Pendente'
      case 'expired':
        return 'Expirado'
      default:
        return status
    }
  }

  const handleView = (id: number) => {
    const data = contracts.find(item => item.id === id)
    if (data) {
      setEditingContract(data)
      setIsViewOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const data = contracts.find(item => item.id === id)
    if (data) {
      setEditingContract(data)
      setIsEditOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      setContracts(prevList => prevList.filter(item => item.id !== id))
    }
  }

  const handleNewContract = () => {
    setEditingContract({
      id: Math.max(...contracts.map(item => item.id)) + 1,
      name: '',
      type: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      value: 0,
      status: 'active',
      lastUpdate: new Date().toISOString().split('T')[0],
      file: null
    })
    setIsNewOpen(true)
  }

  const handleSaveEdit = () => {
    setContracts(prevList => 
      prevList.map(item => 
        item.id === editingContract.id ? {
          ...editingContract,
          lastUpdate: new Date().toISOString().split('T')[0],
          file: null
        } : item
      )
    )
    setIsEditOpen(false)
  }

  const handleSaveNew = () => {
    setContracts(prevList => [...prevList, {
      ...editingContract,
      lastUpdate: new Date().toISOString().split('T')[0],
      file: null
    }])
    setIsNewOpen(false)
  }

  const handleExport = () => {
    const exportData = contracts.map(item => ({
      Nome: item.name,
      Tipo: item.type,
      'Data Início': new Date(item.startDate).toLocaleDateString(),
      'Data Fim': new Date(item.endDate).toLocaleDateString(),
      Valor: `R$ ${item.value.toLocaleString()}`,
      Status: getStatusText(item.status),
      'Última Atualização': new Date(item.lastUpdate).toLocaleDateString()
    }))
    console.log('Exportando dados:', exportData)
    // Aqui você pode implementar a lógica para exportar para Excel/CSV
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar o tipo do arquivo
      if (file.type === 'application/pdf' || file.type === 'text/csv') {
        setEditingContract({...editingContract, file})
      } else {
        alert('Por favor, selecione um arquivo PDF ou CSV')
      }
    }
  }

  const handleDownloadFile = (contract: any) => {
    if (contract.file) {
      // Criar URL do arquivo e iniciar download
      const url = URL.createObjectURL(contract.file)
      const a = document.createElement('a')
      a.href = url
      a.download = `contrato-${contract.id}.${contract.file.type === 'application/pdf' ? 'pdf' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Contratos</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalContracts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.activeContracts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicators.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes Renovação</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {indicators.pendingRenewal}
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
              placeholder="Buscar por nome ou tipo..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewContract}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabela de contratos */}
      <Card>
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>R$ {contract.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                      {getStatusText(contract.status)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(contract.lastUpdate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(contract.id)}
                        title="Visualizar"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(contract.id)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
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

      {/* Modal de Visualização */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Nome</Label>
              <div className="col-span-3">{editingContract.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Tipo</Label>
              <div className="col-span-3">{editingContract.type}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Data Início</Label>
              <div className="col-span-3">
                {new Date(editingContract.startDate).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Data Fim</Label>
              <div className="col-span-3">
                {new Date(editingContract.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Valor</Label>
              <div className="col-span-3">
                R$ {editingContract.value.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Status</Label>
              <div className="col-span-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(editingContract.status)}`}>
                  {getStatusText(editingContract.status)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Última Atualização</Label>
              <div className="col-span-3">
                {new Date(editingContract.lastUpdate).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Arquivo</Label>
              <div className="col-span-3">
                {editingContract.file ? (
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadFile(editingContract)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                ) : (
                  <span className="text-gray-500">Nenhum arquivo anexado</span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={editingContract.name}
                onChange={(e) => setEditingContract({...editingContract, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <Input
                id="type"
                className="col-span-3"
                value={editingContract.type}
                onChange={(e) => setEditingContract({...editingContract, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={editingContract.startDate}
                onChange={(e) => setEditingContract({...editingContract, startDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
                value={editingContract.endDate}
                onChange={(e) => setEditingContract({...editingContract, endDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={editingContract.value}
                onChange={(e) => setEditingContract({...editingContract, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingContract.status}
                onChange={(e) => setEditingContract({...editingContract, status: e.target.value})}
              >
                <option value="active">Ativo</option>
                <option value="pending_renewal">Renovação Pendente</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file">Arquivo do Contrato</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.csv"
                  className="col-span-3"
                  onChange={handleFileChange}
                />
                {editingContract.file && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadFile(editingContract)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Contrato */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name">Nome</Label>
              <Input
                id="new-name"
                className="col-span-3"
                value={editingContract.name}
                onChange={(e) => setEditingContract({...editingContract, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type">Tipo</Label>
              <Input
                id="new-type"
                className="col-span-3"
                value={editingContract.type}
                onChange={(e) => setEditingContract({...editingContract, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-startDate">Data Início</Label>
              <Input
                id="new-startDate"
                type="date"
                className="col-span-3"
                value={editingContract.startDate}
                onChange={(e) => setEditingContract({...editingContract, startDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-endDate">Data Fim</Label>
              <Input
                id="new-endDate"
                type="date"
                className="col-span-3"
                value={editingContract.endDate}
                onChange={(e) => setEditingContract({...editingContract, endDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value">Valor</Label>
              <Input
                id="new-value"
                type="number"
                className="col-span-3"
                value={editingContract.value}
                onChange={(e) => setEditingContract({...editingContract, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-file">Arquivo do Contrato</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="new-file"
                  type="file"
                  accept=".pdf,.csv"
                  className="col-span-3"
                  onChange={handleFileChange}
                />
                {editingContract.file && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadFile(editingContract)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNew}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 