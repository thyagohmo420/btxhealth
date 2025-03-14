import React, { useState } from 'react';
import { 
  Thermometer, 
  Heart, 
  Activity, 
  Battery, 
  Wifi,
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Device {
  id: string;
  name: string;
  type: 'temperature' | 'heartrate' | 'pressure' | 'oximeter';
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastUpdate: string;
  value: string;
  unit: string;
  location: string;
  patient: string;
}

export default function IoTMonitoring() {
  const [loading, setLoading] = useState(false);
  const [devices] = useState<Device[]>([
    {
      id: '1',
      name: 'Sensor de Temperatura 01',
      type: 'temperature',
      status: 'online',
      battery: 85,
      lastUpdate: '2024-02-28 10:45',
      value: '36.5',
      unit: '°C',
      location: 'Enfermaria A',
      patient: 'João Silva'
    },
    {
      id: '2',
      name: 'Monitor Cardíaco 01',
      type: 'heartrate',
      status: 'online',
      battery: 90,
      lastUpdate: '2024-02-28 10:45',
      value: '78',
      unit: 'bpm',
      location: 'UTI',
      patient: 'Maria Santos'
    },
    {
      id: '3',
      name: 'Oxímetro 01',
      type: 'oximeter',
      status: 'warning',
      battery: 15,
      lastUpdate: '2024-02-28 10:45',
      value: '98',
      unit: '%',
      location: 'Enfermaria B',
      patient: 'Pedro Oliveira'
    }
  ]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-6 h-6" />;
      case 'heartrate':
        return <Heart className="w-6 h-6" />;
      case 'pressure':
        return <Activity className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'offline':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshDevices = async () => {
    try {
      setLoading(true);
      // Simulação de atualização
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dispositivos atualizados com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Monitoramento IoT</h2>
          <p className="text-gray-600 mt-1">
            Dispositivos Médicos Conectados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshDevices}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 text-green-600">
            <Wifi className="w-6 h-6" />
            <h3 className="font-semibold">Dispositivos Online</h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {devices.filter(d => d.status === 'online').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 text-yellow-600">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-semibold">Alertas</h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {devices.filter(d => d.status === 'warning').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 text-red-600">
            <Battery className="w-6 h-6" />
            <h3 className="font-semibold">Bateria Baixa</h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {devices.filter(d => d.battery < 20).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dispositivos</h3>
          
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(device.status)}`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-sm text-gray-600">
                        {device.location} • Paciente: {device.patient}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(device.status)}`}>
                          <Wifi className="w-3 h-3" />
                          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                        </span>
                        <span className={`text-sm ${getBatteryColor(device.battery)} flex items-center gap-1`}>
                          <Battery className="w-4 h-4" />
                          {device.battery}%
                        </span>
                        <span className="text-sm text-gray-500">
                          Última atualização: {device.lastUpdate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {device.value}
                      <span className="text-sm text-gray-500 ml-1">{device.unit}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Informações do Sistema</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Os dados são atualizados automaticamente a cada 5 minutos</li>
          <li>Alertas são enviados quando os valores estão fora dos limites</li>
          <li>Dispositivos com bateria abaixo de 20% precisam ser carregados</li>
          <li>Em caso de falha na conexão, verifique o sinal Wi-Fi do dispositivo</li>
        </ul>
      </div>
    </div>
  );
} 