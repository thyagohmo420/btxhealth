import React, { useState } from 'react';
import { Globe, Shield, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface APIStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  lastSync: string;
  description: string;
}

export default function GovernmentAPIs() {
  const [loading, setLoading] = useState(false);
  const [apis] = useState<APIStatus[]>([
    {
      name: 'CNES',
      status: 'online',
      lastSync: '2024-02-28 10:30',
      description: 'Cadastro Nacional de Estabelecimentos de Saúde'
    },
    {
      name: 'CNS',
      status: 'online',
      lastSync: '2024-02-28 10:30',
      description: 'Cartão Nacional de Saúde'
    },
    {
      name: 'SIGTAP',
      status: 'online',
      lastSync: '2024-02-28 10:30',
      description: 'Sistema de Gerenciamento da Tabela de Procedimentos'
    },
    {
      name: 'SIPNI',
      status: 'online',
      lastSync: '2024-02-28 10:30',
      description: 'Sistema de Informações do Programa Nacional de Imunizações'
    },
    {
      name: 'e-SUS AB',
      status: 'online',
      lastSync: '2024-02-28 10:30',
      description: 'Sistema e-SUS Atenção Básica'
    }
  ]);

  const handleSync = async (apiName: string) => {
    try {
      setLoading(true);
      // Simulação de sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Sincronização com ${apiName} realizada com sucesso`);
    } catch (error) {
      toast.error(`Erro ao sincronizar com ${apiName}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'offline':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">APIs Governamentais</h2>
          <p className="text-gray-600 mt-1">
            Integração com sistemas do Ministério da Saúde
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {apis.map((api) => (
          <div key={api.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{api.name}</h3>
                  <p className="text-gray-600 mt-1">{api.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(api.status)}`}>
                      {api.status === 'online' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Última sincronização: {api.lastSync}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSync(api.name)}
                disabled={loading || api.status === 'offline'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Conexão segura estabelecida com o Ministério da Saúde</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Informações Importantes</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>As sincronizações são realizadas automaticamente a cada 6 horas</li>
          <li>Em caso de falha na sincronização, o sistema tentará novamente em 30 minutos</li>
          <li>Mantenha os certificados digitais atualizados para garantir a conexão</li>
          <li>Em caso de problemas, entre em contato com o suporte técnico</li>
        </ul>
      </div>
    </div>
  );
} 