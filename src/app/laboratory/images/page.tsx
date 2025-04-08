'use client'

import { useState } from 'react'
import {
  ImagePlus,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Share2,
  Printer,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageViewerModal } from '@/components/laboratory/ImageViewerModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface ExamImage {
  id: string
  patientName: string
  patientId: string
  examType: string
  date: string
  status: 'pending' | 'analyzed' | 'delivered'
  imageUrl: string
  doctor: string
  priority: 'normal' | 'urgent' | 'emergency'
}

export default function LaboratoryImages() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<ExamImage | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Dados mockados para exemplo
  const images: ExamImage[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: '123456',
      examType: 'Raio-X Tórax',
      date: '2024-03-15',
      status: 'pending',
      imageUrl: 'https://sdenqmymvspjhzipmvyn.supabase.co/storage/v1/object/public/exams/xray-1.jpg',
      doctor: 'Dr. Carlos Santos',
      priority: 'urgent'
    },
    {
      id: '2',
      patientName: 'João Oliveira',
      patientId: '789012',
      examType: 'Ressonância Magnética',
      date: '2024-03-15',
      status: 'analyzed',
      imageUrl: 'https://sdenqmymvspjhzipmvyn.supabase.co/storage/v1/object/public/exams/mri-1.jpg',
      doctor: 'Dra. Ana Beatriz',
      priority: 'normal'
    }
  ]

  const filteredImages = images.filter(image => {
    const matchesSearch = 
      image.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.patientId.includes(searchTerm) ||
      image.examType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || image.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'analyzed':
        return 'text-green-600 bg-green-100'
      case 'delivered':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100'
      case 'emergency':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const handleDownload = async (image: ExamImage) => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${image.examType}-${image.patientName}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
    }
  }

  const handleShare = async (image: ExamImage) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${image.examType} - ${image.patientName}`,
          text: `Exame de ${image.examType} do paciente ${image.patientName}`,
          url: image.imageUrl
        })
      } else {
        await navigator.clipboard.writeText(image.imageUrl)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handlePrint = (image: ExamImage) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${image.examType} - ${image.patientName}</title>
            <style>
              body { margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; }
              .info { margin-bottom: 20px; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <div class="info">
              <h2>${image.examType}</h2>
              <p>Paciente: ${image.patientName}</p>
              <p>Data: ${new Date(image.date).toLocaleDateString()}</p>
              <p>Médico: ${image.doctor}</p>
            </div>
            <img src="${image.imageUrl}" alt="${image.examType}" />
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Aqui você implementaria o upload real para seu backend
      console.log('Arquivo selecionado:', file)
      
      // Simulando upload
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('Arquivo enviado com sucesso!')
        setIsUploadOpen(false)
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error)
        alert('Erro ao enviar arquivo')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exames de Imagem</h1>
          <p className="text-gray-600 mt-1">Gerencie os exames de imagem do laboratório</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <ImagePlus className="h-4 w-4 mr-2" />
              Novo Exame
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Exame</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Paciente</Label>
                <Input id="patient" placeholder="Nome do paciente" />
              </div>
              <div>
                <Label htmlFor="examType">Tipo de Exame</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xray">Raio-X</SelectItem>
                    <SelectItem value="mri">Ressonância Magnética</SelectItem>
                    <SelectItem value="ct">Tomografia</SelectItem>
                    <SelectItem value="ultrasound">Ultrassom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor">Médico</Label>
                <Input id="doctor" placeholder="Nome do médico" />
              </div>
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {images.filter(img => img.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analisados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {images.filter(img => img.status === 'analyzed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {images.filter(img => img.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Exames</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar por paciente, ID ou tipo de exame..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="analyzed">Analisados</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{image.patientName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                        {image.status.charAt(0).toUpperCase() + image.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(image.priority)}`}>
                        {image.priority.charAt(0).toUpperCase() + image.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ID: {image.patientId} | Exame: {image.examType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Data: {new Date(image.date).toLocaleDateString()} | Médico: {image.doctor}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedImage(image)
                        setIsViewerOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(image)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare(image)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint(image)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        image={selectedImage}
      />
    </div>
  )
} 