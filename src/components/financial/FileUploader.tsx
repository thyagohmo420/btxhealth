'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileX, FileCheck, Loader2, File } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  onFileClear: () => void
  accept?: string
  maxSize?: number
  currentFile?: string | null
}

export function FileUploader({
  onFileUpload,
  onFileClear,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSize = 5, // em MB
  currentFile = null
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(currentFile)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    const acceptedExtensions = accept.split(',').map(ext => 
      ext.trim().replace('.', '').toLowerCase()
    )

    if (!acceptedExtensions.includes(fileExtension)) {
      toast.error(`Formato de arquivo não permitido. Use: ${accept}`)
      return false
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast.error(`O arquivo excede o tamanho máximo de ${maxSize}MB`)
      return false
    }

    return true
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      
      if (validateFile(droppedFile)) {
        handleFileUpload(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      if (validateFile(selectedFile)) {
        handleFileUpload(selectedFile)
      }
    }
  }

  const handleFileUpload = (selectedFile: File) => {
    setIsUploading(true)
    setFile(selectedFile)
    setFileName(selectedFile.name)
    
    // Simulação de upload - em um ambiente real, aqui você faria upload para o servidor
    setTimeout(() => {
      setIsUploading(false)
      onFileUpload(selectedFile)
      toast.success('Arquivo enviado com sucesso!')
    }, 1500)
  }

  const handleClearFile = () => {
    setFile(null)
    setFileName(null)
    onFileClear()
    
    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {fileName ? (
        <div className="flex items-center p-4 border rounded-md bg-gray-50">
          <div className="flex-1 flex items-center">
            <File className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-sm font-medium truncate max-w-xs">{fileName}</span>
          </div>
          <div className="flex gap-2">
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            ) : (
              <FileCheck className="w-5 h-5 text-green-500" />
            )}
            <Button variant="ghost" size="sm" onClick={handleClearFile} className="h-8 w-8 p-0">
              <FileX className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed p-6 rounded-md text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            Arraste um arquivo ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500">
            Formatos permitidos: {accept} (máx. {maxSize}MB)
          </p>
        </div>
      )}
    </div>
  )
} 