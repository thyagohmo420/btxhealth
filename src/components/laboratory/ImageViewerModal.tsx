'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Share2, Printer, X } from 'lucide-react'
import Image from 'next/image'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  image: {
    patientName: string
    examType: string
    date: string
    doctor: string
    imageUrl: string
  } | null
}

export function ImageViewerModal({ isOpen, onClose, image }: ImageViewerModalProps) {
  if (!image) return null

  const handleDownload = async () => {
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${image.examType} - ${image.patientName}`,
          text: `Exame de ${image.examType} do paciente ${image.patientName}`,
          url: image.imageUrl
        })
      } else {
        // Fallback para copiar link
        await navigator.clipboard.writeText(image.imageUrl)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handlePrint = () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{image.examType}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Paciente: {image.patientName} | Data: {new Date(image.date).toLocaleDateString()} | Médico: {image.doctor}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={image.imageUrl}
            alt={`${image.examType} - ${image.patientName}`}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 