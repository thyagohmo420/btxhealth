import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import NewRegulationModal from '../components/regulation/NewRegulationModal';

interface RegulationRequest {
  id: string;
  patient_name: string;
  patient_cpf: string;
  patient_birth_date: string;
  specialty: string;
  priority: 'emergency' | 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  professional_name: string;
  request_date: string;
  notes: string;
  attachments: string[];
  approved_by_name?: string;
  approval_date?: string;
}

export default function Regulation() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [requests, setRequests] = useState<RegulationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    urgent: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ambulatory_regulation_view')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      
      // Calcular estatísticas
      const total = data?.length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const approved = data?.filter(r => r.status === 'approved').length || 0;
      const urgent = data?.filter(r => ['emergency', 'urgent'].includes(r.priority)).length || 0;

      setStats({ total, pending, approved, urgent });
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = async (data: any) => {
    try {
      const { error } = await supabase
        .from('ambulatory_regulation')
        .insert([data]);

      if (error) throw error;

      await fetchRequests();
      setShowNewRequest(false);
      toast.success('Solicitação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast.error('Erro ao criar solicitação');
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('ambulatory_regulation')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      await fetchRequests();
      toast.success('Solicitação aprovada com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('ambulatory_regulation')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      await fetchRequests();
      toast.success('Solicitação rejeitada com sucesso!');
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'Emergência';
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = 
      selectedPriority === 'all' || 
      req.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Regulação Ambulatorial</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Nova Solicitação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Total de Solicitações</h3>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Pendentes</h3>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold">Aprovadas</h3>
          </div>
          <p className="text-3xl font-bold">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Urgentes</h3>
          </div>
          <p className="text-3xl font-bold">{stats.urgent}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar solicitações..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="emergency">Emergência</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando solicitações...</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{request.patient_name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>CPF: {request.patient_cpf}</p>
                        <p>Data de Nascimento: {new Date(request.patient_birth_date).toLocaleDateString()}</p>
                        <p>Especialidade: {request.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Solicitante</p>
                      <p className="font-medium">{request.professional_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data da Solicitação</p>
                      <p className="font-medium">
                        {new Date(request.request_date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Justificativa:</p>
                    <p className="text-sm mt-1">{request.notes}</p>
                  </div>

                  {request.attachments && request.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Anexos:</p>
                      <div className="flex gap-2 mt-1">
                        {request.attachments.map((file, index) => (
                          <button
                            key={index}
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.storage
                                  .from('attachments')
                                  .download(file);
                                
                                if (error) throw error;

                                // Criar URL do blob e fazer download
                                const url = window.URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.split('/').pop() || 'download';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                console.error('Erro ao baixar arquivo:', error);
                                toast.error('Erro ao baixar arquivo');
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            {file.split('/').pop()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprovar
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && request.approved_by_name && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Aprovado por: {request.approved_by_name}</p>
                      <p>Data: {new Date(request.approval_date!).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NewRegulationModal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onSubmit={handleNewRequest}
      />
    </div>
  );
}