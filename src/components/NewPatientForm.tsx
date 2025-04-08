'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Download, Printer, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface NewPatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    full_name: string
    birth_date: string
    cpf: string
    sus_card?: string
    phone: string
    address?: string
    priority: 'low' | 'medium' | 'high' | 'emergency'
    active: boolean
    gender: string
  }) => Promise<void>
  initialData?: any
}

export function NewPatientForm({ open, onOpenChange, onSubmit, initialData }: NewPatientFormProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'cpf' | 'name' | 'birth_date'>('cpf')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<{
    full_name: string;
    birth_date: string;
    cpf: string;
    sus_card: string;
    phone: string;
    address: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    active: boolean;
    gender: string;
  }>({
    full_name: '',
    birth_date: '',
    cpf: '',
    sus_card: '',
    phone: '',
    address: '',
    priority: 'low' as const,
    active: true,
    gender: 'male',
  })

  // Carregar dados iniciais quando disponíveis
  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        birth_date: initialData.birth_date || '',
        cpf: initialData.cpf || '',
        sus_card: initialData.sus_card || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        priority: initialData.priority || 'low',
        active: true,
        gender: initialData.gender || 'male',
      })
    }
  }, [initialData])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um termo para buscar')
      return
    }

    setLoading(true)
    try {
      let query = supabase.from('patients').select('*')

      if (searchType === 'cpf') {
        query = query.ilike('cpf', `%${searchTerm.replace(/\D/g, '')}%`)
      } else if (searchType === 'name') {
        query = query.ilike('full_name', `%${searchTerm}%`)
      } else if (searchType === 'birth_date') {
        query = query.eq('birth_date', searchTerm)
      }

      const { data, error } = await query.limit(5)

      if (error) throw error

      setSearchResults(data || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      toast.error('Erro ao buscar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPatient = (patient: any) => {
    setFormData({
      full_name: patient.full_name || '',
      birth_date: patient.birth_date || '',
      cpf: patient.cpf || '',
      sus_card: patient.sus_card || '',
      phone: patient.phone || '',
      address: patient.address || '',
      priority: patient.priority || 'low',
      active: true,
      gender: patient.gender || 'male',
    })
    setShowSearchResults(false)
    toast.success('Dados do paciente carregados com sucesso')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Formatar o telefone para remover caracteres especiais
    const formattedPhone = formData.phone.replace(/\D/g, '')
    
    // Validar telefone (deve ter 11 dígitos)
    if (formattedPhone.length !== 11) {
      toast.error('Telefone deve conter 11 dígitos')
      return
    }
    
    // Formatar CPF para conter apenas números
    const formattedCpf = formData.cpf.replace(/\D/g, '')
    
    // Validar CPF (deve ter 11 dígitos)
    if (formattedCpf.length !== 11) {
      toast.error('CPF deve conter 11 dígitos')
      return
    }
    
    // Formatar cartão SUS para conter apenas números ou deixar undefined
    let formattedSusCard = undefined;
    if (formData.sus_card && formData.sus_card.trim() !== '') {
      formattedSusCard = formData.sus_card.replace(/\D/g, '')
      // Validar cartão SUS se fornecido (deve ter 15 dígitos)
      if (formattedSusCard.length !== 15) {
        toast.error('Cartão SUS deve conter 15 dígitos ou ser deixado em branco')
        return
      }
    }
    
    await onSubmit({
      ...formData,
      cpf: formattedCpf,
      sus_card: formattedSusCard,
      phone: formattedPhone,
      active: true
    })
    
    setFormData({
      full_name: '',
      birth_date: '',
      cpf: '',
      sus_card: '',
      phone: '',
      address: '',
      priority: 'low' as const,
      active: true,
      gender: 'male',
    })
  }

  const generatePrintContent = () => {
    const header = `
      HOSPITAL DE JUQUITIBA
      FICHA DE ATENDIMENTO
      Nº ${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
      ===============================
    `

    const content = `
      DADOS DO PACIENTE
      ================
      Nome: ${formData.full_name}
      Data de Nascimento: ${formData.birth_date ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : ''}
      CPF: ${formData.cpf}
      ${formData.sus_card ? `Cartão SUS: ${formData.sus_card}` : ''}
      ${formData.phone ? `Telefone: ${formData.phone}` : ''}
      ${formData.address ? `Endereço: ${formData.address}` : ''}
      Prioridade: ${
        formData.priority === 'low' ? 'Baixa' :
        formData.priority === 'medium' ? 'Média' :
        formData.priority === 'high' ? 'Alta' :
        'Emergência'
      }
      Data de Cadastro: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

      TRIAGEM
      =======
      Pressão Arterial: _______________
      Frequência Cardíaca: ___________
      Temperatura: __________________
      Saturação O2: _________________
      Sintomas: ____________________
      _____________________________
      _____________________________
    `

    return { header, content }
  }

  const handlePrint = () => {
    const { header, content } = generatePrintContent()
    const printWindow = window.open('', '', 'height=600,width=800')
    if (printWindow) {
      printWindow.document.write('<html><head><title>Ficha de Atendimento</title>')
      printWindow.document.write('<style>')
      printWindow.document.write(`
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .main-container {
          border: 2px solid #000;
          padding: 20px;
        }
        .header { 
          text-align: center;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: bold;
          padding: 10px;
          border-bottom: 2px solid #000;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #000;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #000;
        }
        .field {
          margin: 10px 0;
          padding: 5px;
          border: 1px solid #000;
        }
        .field-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .field-value {
          min-height: 25px;
          padding: 5px;
        }
        .large-field {
          min-height: 100px;
        }
        .signature-area {
          margin-top: 50px;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin: 10px auto;
          padding-top: 5px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
      `)
      printWindow.document.write('</style></head><body>')
      printWindow.document.write('<div class="main-container">')
      printWindow.document.write(`
        <div class="header">
          <h1>HOSPITAL DE JUQUITIBA</h1>
          <h2>FICHA DE ATENDIMENTO</h2>
          <p>Nº ${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO PACIENTE</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Nome:</div>
              <div class="field-value">${formData.full_name}</div>
            </div>
            <div class="field">
              <div class="field-label">Data de Nascimento:</div>
              <div class="field-value">${formData.birth_date ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : ''}</div>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <div class="field-label">CPF:</div>
              <div class="field-value">${formData.cpf}</div>
            </div>
            <div class="field">
              <div class="field-label">Cartão SUS:</div>
              <div class="field-value">${formData.sus_card || ''}</div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Endereço:</div>
            <div class="field-value">${formData.address || ''}</div>
          </div>
          <div class="field">
            <div class="field-label">Telefone:</div>
            <div class="field-value">${formData.phone || ''}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TRIAGEM</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Pressão Arterial:</div>
              <div class="field-value"></div>
            </div>
            <div class="field">
              <div class="field-label">Frequência Cardíaca:</div>
              <div class="field-value"></div>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Temperatura:</div>
              <div class="field-value"></div>
            </div>
            <div class="field">
              <div class="field-label">Saturação O2:</div>
              <div class="field-value"></div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Sintomas:</div>
            <div class="field-value large-field"></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ATENDIMENTO MÉDICO</div>
          <div class="field">
            <div class="field-label">Consultório:</div>
            <div class="field-value"></div>
          </div>
          <div class="field">
            <div class="field-label">Diagnóstico:</div>
            <div class="field-value large-field"></div>
          </div>
          <div class="field">
            <div class="field-label">Medicamentos:</div>
            <div class="field-value large-field"></div>
          </div>
          <div class="field">
            <div class="field-label">Exames Solicitados:</div>
            <div class="field-value large-field"></div>
          </div>
        </div>

        <div class="signature-area">
          <div style="display: inline-block; margin: 0 50px;">
            <div class="signature-line"></div>
            <p>Assinatura do Paciente</p>
          </div>
          <div style="display: inline-block; margin: 0 50px;">
            <div class="signature-line"></div>
            <p>Carimbo e Assinatura do Médico</p>
          </div>
        </div>
      `)
      printWindow.document.write('</div></body></html>')
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    const { header, content } = generatePrintContent()
    const doc = new jsPDF()
    
    // Configurar fonte para suportar caracteres especiais
    doc.setFont('helvetica')
    
    // Adicionar bordas na página
    doc.rect(10, 10, 190, 277)
    
    // Adicionar cabeçalho
    doc.setFontSize(16)
    doc.text('HOSPITAL DE JUQUITIBA', 105, 20, { align: 'center' })
    doc.text('FICHA DE ATENDIMENTO', 105, 30, { align: 'center' })
    doc.text(`Nº ${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`, 105, 40, { align: 'center' })
    
    // Adicionar linhas divisórias e seções
    doc.line(10, 45, 200, 45)
    
    // Seção Dados do Paciente
    doc.setFontSize(14)
    doc.text('DADOS DO PACIENTE', 20, 55)
    doc.rect(15, 60, 180, 50)
    
    // Seção Triagem
    doc.text('TRIAGEM', 20, 120)
    doc.rect(15, 125, 180, 50)
    
    // Seção Atendimento Médico
    doc.text('ATENDIMENTO MÉDICO', 20, 185)
    doc.rect(15, 190, 180, 60)
    
    // Área de assinaturas
    doc.line(40, 260, 90, 260)
    doc.text('Assinatura do Paciente', 65, 270, { align: 'center' })
    
    doc.line(120, 260, 170, 260)
    doc.text('Carimbo e Assinatura do Médico', 145, 270, { align: 'center' })
    
    // Adicionar conteúdo nas seções
    doc.setFontSize(12)
    doc.text(`Nome: ${formData.full_name}`, 20, 70)
    doc.text(`CPF: ${formData.cpf}`, 20, 80)
    doc.text(`Data de Nascimento: ${formData.birth_date ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : ''}`, 20, 90)
    
    // Salvar o PDF
    doc.save(`ficha_${formData.full_name.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>
        
        {/* Seção de busca de pacientes */}
        <div className="mb-6 border-b pb-6">
          <h3 className="text-lg font-medium mb-3">Buscar paciente existente</h3>
          <Tabs defaultValue="cpf" onValueChange={(value) => setSearchType(value as 'cpf' | 'name' | 'birth_date')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cpf">CPF</TabsTrigger>
              <TabsTrigger value="name">Nome</TabsTrigger>
              <TabsTrigger value="birth_date">Data de Nascimento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cpf" className="mt-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite o CPF do paciente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Buscando...' : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="name" className="mt-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite o nome do paciente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Buscando...' : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="birth_date" className="mt-2">
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Buscando...' : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Resultados da busca */}
          {showSearchResults && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Resultados da busca:</h4>
              {searchResults.length > 0 ? (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <div 
                      key={patient.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b last:border-b-0"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-gray-500">
                          CPF: {patient.cpf} | Nascimento: {patient.birth_date}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Selecionar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum paciente encontrado</p>
              )}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="birth_date">Data de Nascimento *</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gênero *</Label>
              <select
                id="gender"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                required
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="prefer_not_to_say">Prefiro não informar</option>
              </select>
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => {
                  // Permitir apenas números e formatação
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setFormData(prev => ({ ...prev, cpf: value }))
                }}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <Label htmlFor="sus_card">Cartão SUS (Opcional - se informado, deve ter 15 dígitos)</Label>
              <Input
                id="sus_card"
                value={formData.sus_card}
                onChange={(e) => {
                  // Permitir apenas números
                  const value = e.target.value.replace(/\D/g, '').slice(0, 15)
                  setFormData(prev => ({ ...prev, sus_card: value }))
                }}
                placeholder="Digite apenas os 15 números ou deixe em branco"
              />
              <p className="text-xs text-gray-500 mt-1">Você pode deixar este campo em branco se o paciente não possuir cartão SUS.</p>
            </div>

            <div>
              <Label htmlFor="phone">Telefone * (11 dígitos, apenas números)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  // Permitir apenas números
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setFormData(prev => ({ ...prev, phone: value }))
                }}
                placeholder="00000000000"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Endereço (Opcional)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioridade *</Label>
              <select
                id="priority"
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'emergency' }))}
                required
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="emergency">Emergência</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 