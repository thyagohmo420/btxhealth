import { Exam } from '@/types/patient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronUp, FileText, Image } from 'lucide-react';
import { useState } from 'react';

interface ExamHistoryProps {
  exams: Exam[];
}

export function ExamHistory({ exams }: ExamHistoryProps) {
  const [expandedExams, setExpandedExams] = useState<string[]>([]);

  const toggleExam = (id: string) => {
    setExpandedExams(prev =>
      prev.includes(id)
        ? prev.filter(examId => examId !== id)
        : [...prev, id]
    );
  };

  if (exams.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhum exame registrado
      </p>
    );
  }

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'performed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Exam['status']) => {
    switch (status) {
      case 'requested':
        return 'Solicitado';
      case 'scheduled':
        return 'Agendado';
      case 'performed':
        return 'Realizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {exams.map(exam => {
        const isExpanded = expandedExams.includes(exam.id || '');

        return (
          <div
            key={exam.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleExam(exam.id || '')}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {exam.type === 'laboratory' ? (
                    <FileText className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Image className="h-6 w-6 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {exam.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Solicitado em: {format(new Date(exam.requestDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {getStatusText(exam.status)}
                  </span>
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
                    <h4 className="text-sm font-medium text-gray-900">Tipo</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {exam.type === 'laboratory' ? 'Laboratorial' : 'Imagem'}
                    </p>
                  </div>

                  {exam.performedDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Data de Realização</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {format(new Date(exam.performedDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}

                  {exam.instructions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Instruções</h4>
                      <p className="mt-1 text-sm text-gray-600">{exam.instructions}</p>
                    </div>
                  )}

                  {exam.results && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Resultados</h4>
                      <p className="mt-1 text-sm text-gray-600">{exam.results}</p>
                    </div>
                  )}

                  {exam.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Observações</h4>
                      <p className="mt-1 text-sm text-gray-600">{exam.notes}</p>
                    </div>
                  )}

                  {exam.attachments && exam.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Anexos</h4>
                      <div className="mt-2 space-y-2">
                        {exam.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Anexo {index + 1}
                          </a>
                        ))}
                      </div>
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