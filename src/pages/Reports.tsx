import { useState, useEffect } from 'react';
import { FileDown, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { reports } from '../lib/reports';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState('');

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      let data;
      let filename;

      if (reportType === 'patient') {
        if (!patientId) {
          toast.error('Selecione um paciente');
          return;
        }
        data = await reports.generatePatientReport(patientId, startDate, endDate);
        filename = `relatorio_paciente_${format(new Date(), 'yyyy-MM-dd')}`;
      } else {
        if (!startDate || !endDate) {
          toast.error('Selecione o período do relatório');
          return;
        }
        data = await reports.generateAttendanceReport(startDate, endDate, recordType);
        filename = `relatorio_atendimentos_${format(new Date(), 'yyyy-MM-dd')}`;
      }

      if (!data || !data.data || data.data.length === 0) {
        toast.error('Nenhum dado encontrado para o período selecionado');
        return;
      }

      const blob = await reports.downloadReport(data.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Relatórios</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="attendance">Relatório de Atendimentos</option>
              <option value="patient">Relatório por Paciente</option>
            </select>
          </div>

          {reportType === 'patient' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {reportType === 'attendance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Atendimento
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="consultation">Consulta</option>
                <option value="exam">Exame</option>
                <option value="procedure">Procedimento</option>
                <option value="vaccination">Vacinação</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPatientId('');
                setRecordType('');
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FileDown className="w-5 h-5" />
              )}
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Dicas para Relatórios</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Relatório de Atendimentos: Visualize todos os atendimentos em um período específico</li>
          <li>Relatório por Paciente: Acompanhe o histórico completo de um paciente</li>
          <li>Use os filtros para refinar sua busca</li>
          <li>Os relatórios são gerados em formato CSV, compatível com Excel</li>
        </ul>
      </div>
    </div>
  );
} 