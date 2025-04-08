'use client'

import { useState } from 'react'
import {
  Settings2,
  Users,
  Beaker,
  Printer,
  Barcode,
  Database,
  Bell,
  Shield,
  GitBranch,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'

interface SettingSection {
  title: string
  icon: React.ReactNode
  settings: {
    id: string
    label: string
    type: 'text' | 'select' | 'switch' | 'time'
    options?: { value: string; label: string }[]
    value: string | boolean
  }[]
}

export default function LaboratorySettings() {
  const [settings, setSettings] = useState<SettingSection[]>([
    {
      title: 'Geral',
      icon: <Settings2 className="h-5 w-5" />,
      settings: [
        {
          id: 'labName',
          label: 'Nome do Laboratório',
          type: 'text',
          value: 'Laboratório Central'
        },
        {
          id: 'workingHours',
          label: 'Horário de Funcionamento',
          type: 'time',
          value: '08:00'
        }
      ]
    },
    {
      title: 'Usuários e Permissões',
      icon: <Users className="h-5 w-5" />,
      settings: [
        {
          id: 'defaultRole',
          label: 'Papel Padrão',
          type: 'select',
          options: [
            { value: 'technician', label: 'Técnico' },
            { value: 'analyst', label: 'Analista' },
            { value: 'admin', label: 'Administrador' }
          ],
          value: 'technician'
        },
        {
          id: 'autoApprove',
          label: 'Aprovação Automática de Usuários',
          type: 'switch',
          value: false
        }
      ]
    },
    {
      title: 'Equipamentos',
      icon: <Beaker className="h-5 w-5" />,
      settings: [
        {
          id: 'equipmentIntegration',
          label: 'Integração com Equipamentos',
          type: 'switch',
          value: true
        },
        {
          id: 'maintenanceAlerts',
          label: 'Alertas de Manutenção',
          type: 'switch',
          value: true
        }
      ]
    },
    {
      title: 'Impressão',
      icon: <Printer className="h-5 w-5" />,
      settings: [
        {
          id: 'defaultPrinter',
          label: 'Impressora Padrão',
          type: 'select',
          options: [
            { value: 'printer1', label: 'Impressora 1' },
            { value: 'printer2', label: 'Impressora 2' },
            { value: 'printer3', label: 'Impressora 3' }
          ],
          value: 'printer1'
        },
        {
          id: 'labelFormat',
          label: 'Formato de Etiquetas',
          type: 'select',
          options: [
            { value: 'small', label: 'Pequeno' },
            { value: 'medium', label: 'Médio' },
            { value: 'large', label: 'Grande' }
          ],
          value: 'medium'
        }
      ]
    },
    {
      title: 'Códigos de Barras',
      icon: <Barcode className="h-5 w-5" />,
      settings: [
        {
          id: 'barcodeType',
          label: 'Tipo de Código de Barras',
          type: 'select',
          options: [
            { value: 'code128', label: 'Code 128' },
            { value: 'qr', label: 'QR Code' },
            { value: 'datamatrix', label: 'Data Matrix' }
          ],
          value: 'code128'
        }
      ]
    },
    {
      title: 'Banco de Dados',
      icon: <Database className="h-5 w-5" />,
      settings: [
        {
          id: 'backupSchedule',
          label: 'Agendamento de Backup',
          type: 'select',
          options: [
            { value: 'daily', label: 'Diário' },
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensal' }
          ],
          value: 'daily'
        },
        {
          id: 'retentionPeriod',
          label: 'Período de Retenção (dias)',
          type: 'text',
          value: '30'
        }
      ]
    },
    {
      title: 'Notificações',
      icon: <Bell className="h-5 w-5" />,
      settings: [
        {
          id: 'emailNotifications',
          label: 'Notificações por Email',
          type: 'switch',
          value: true
        },
        {
          id: 'smsNotifications',
          label: 'Notificações por SMS',
          type: 'switch',
          value: false
        }
      ]
    },
    {
      title: 'Segurança',
      icon: <Shield className="h-5 w-5" />,
      settings: [
        {
          id: 'twoFactor',
          label: 'Autenticação em Dois Fatores',
          type: 'switch',
          value: true
        },
        {
          id: 'sessionTimeout',
          label: 'Tempo Limite da Sessão (minutos)',
          type: 'text',
          value: '30'
        }
      ]
    },
    {
      title: 'Fluxo de Trabalho',
      icon: <GitBranch className="h-5 w-5" />,
      settings: [
        {
          id: 'autoAssignment',
          label: 'Atribuição Automática',
          type: 'switch',
          value: true
        },
        {
          id: 'workflowRules',
          label: 'Regras de Fluxo',
          type: 'select',
          options: [
            { value: 'fifo', label: 'FIFO' },
            { value: 'priority', label: 'Prioridade' },
            { value: 'custom', label: 'Personalizado' }
          ],
          value: 'priority'
        }
      ]
    }
  ])

  const handleSettingChange = (sectionIndex: number, settingIndex: number, value: string | boolean) => {
    const newSettings = [...settings]
    newSettings[sectionIndex].settings[settingIndex].value = value
    setSettings(newSettings)
  }

  const handleSave = async () => {
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    }
  }

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Laboratório</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((section, sectionIndex) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={setting.id} className="flex flex-col gap-2">
                  <Label htmlFor={setting.id}>{setting.label}</Label>
                  {setting.type === 'text' && (
                    <Input
                      id={setting.id}
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(sectionIndex, settingIndex, e.target.value)}
                    />
                  )}
                  {setting.type === 'select' && (
                    <Select
                      value={setting.value as string}
                      onValueChange={(value) => handleSettingChange(sectionIndex, settingIndex, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {setting.type === 'switch' && (
                    <Switch
                      id={setting.id}
                      checked={setting.value as boolean}
                      onCheckedChange={(checked) => handleSettingChange(sectionIndex, settingIndex, checked)}
                    />
                  )}
                  {setting.type === 'time' && (
                    <Input
                      id={setting.id}
                      type="time"
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(sectionIndex, settingIndex, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 