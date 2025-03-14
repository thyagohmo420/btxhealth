import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
}

interface MedicalRecord {
  id: string;
  created_at: string;
  record_date: string;
  patient: {
    full_name: string;
    cpf: string;
  };
  professional: {
    full_name: string;
    specialty: string;
  };
  type: string;
  notes: string;
  prescription: string | null;
  exam_request: string | null;
  attachments: string[];
  status: string;
}

export default function ElectronicRecord() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformar os dados para o formato correto
      const formattedData = data?.map(record => ({
        ...record,
        patient: {
          full_name: record.patient_name,
          cpf: record.patient_cpf
        },
        professional: {
          full_name: record.professional_name,
          specialty: record.professional_specialty
        }
      })) || [];

      setRecords(formattedData);
    } catch (err) {
      console.error('Erro ao carregar registros:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prontuário Eletrônico</h1>
        <Link
          to="/prontuario/novo"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Novo Registro
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.patient.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.patient.cpf}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.professional.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.professional.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.type === 'consultation' ? 'Consulta' :
                       record.type === 'return' ? 'Retorno' :
                       record.type === 'exam' ? 'Exame' : 'Procedimento'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md overflow-hidden overflow-ellipsis">
                      {record.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status === 'active' ? 'Ativo' :
                       record.status === 'inactive' ? 'Inativo' : 'Excluído'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.attachments?.length ? (
                      <div className="flex space-x-2">
                        {record.attachments.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            Anexo {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Nenhum anexo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 