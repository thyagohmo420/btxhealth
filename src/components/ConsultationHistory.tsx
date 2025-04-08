import { MedicalRecord } from '@/types/patient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ConsultationHistoryProps {
  records: MedicalRecord[];
}

export function ConsultationHistory({ records }: ConsultationHistoryProps) {
  const [expandedRecords, setExpandedRecords] = useState<string[]>([]);

  const toggleRecord = (id: string) => {
    setExpandedRecords(prev =>
      prev.includes(id)
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  if (records.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhuma consulta registrada
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {records.map(record => {
        const isExpanded = expandedRecords.includes(record.id);

        return (
          <div
            key={record.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleRecord(record.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Dr(a). {record.doctor}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {record.diagnosis}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Sintomas</h4>
                    <p className="mt-1 text-sm text-gray-600">{record.symptoms}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Diagnóstico</h4>
                    <p className="mt-1 text-sm text-gray-600">{record.diagnosis}</p>
                  </div>

                  {record.prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Prescrições</h4>
                      <div className="mt-2 space-y-2">
                        {record.prescriptions.map((prescription, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                          >
                            <p className="font-medium">{prescription.medication}</p>
                            <p>Dosagem: {prescription.dosage}</p>
                            <p>Frequência: {prescription.frequency}</p>
                            <p>Duração: {prescription.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.exams.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Exames Solicitados</h4>
                      <div className="mt-2 space-y-2">
                        {record.exams.map((exam, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                          >
                            <p className="font-medium">{exam.name}</p>
                            <p>Tipo: {exam.type === 'laboratory' ? 'Laboratorial' : 'Imagem'}</p>
                            {exam.instructions && (
                              <p>Instruções: {exam.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.requiresHospitalization && record.hospitalizationDetails && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Detalhes da Internação</h4>
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {record.hospitalizationDetails.admissionDate && (
                          <p>
                            Data de Admissão:{' '}
                            {format(new Date(record.hospitalizationDetails.admissionDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                        {record.hospitalizationDetails.dischargeDate && (
                          <p>
                            Data de Alta:{' '}
                            {format(new Date(record.hospitalizationDetails.dischargeDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                        {record.hospitalizationDetails.reason && (
                          <p>Motivo: {record.hospitalizationDetails.reason}</p>
                        )}
                        {record.hospitalizationDetails.ward && (
                          <p>Ala: {record.hospitalizationDetails.ward}</p>
                        )}
                        {record.hospitalizationDetails.bedNumber && (
                          <p>Leito: {record.hospitalizationDetails.bedNumber}</p>
                        )}
                        {record.hospitalizationDetails.notes && (
                          <p>Observações: {record.hospitalizationDetails.notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {record.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Observações</h4>
                      <p className="mt-1 text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 