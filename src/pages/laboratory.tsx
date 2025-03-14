import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../components/ui/tabs';
import {
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Share2,
  Plus,
  TestTube,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import NewExamModal from '../components/laboratory/NewExamModal';
import ExamResult from '../components/laboratory/ExamResult';

interface Exam {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_cpf: string;
  professional_id: string;
  professional_name: string;
  professional_specialty: string;
  exam_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  scheduled_for: string;
  completed_at?: string;
  notes?: string;
  result_url?: string;
  result_summary?: string;
}

export default function Laboratory() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams_view')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setExams(data || []);
    } catch (err) {
      console.error('Erro ao carregar exames:', err);
      setError('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewExam = async (data: any) => {
    try {
      const { error } = await supabase
        .from('exams')
        .insert([{
          patient_id: data.patient_id,
          professional_id: data.professional_id,
          exam_type: data.examType,
          scheduled_for: data.scheduledFor,
          priority: data.priority,
          notes: data.notes
        }]);

      if (error) throw error;

      await fetchExams();
      return Promise.resolve();
    } catch (err) {
      console.error('Erro ao criar exame:', err);
      return Promise.reject(err);
    }
  };

  const updateExamStatus = async (examId: string, newStatus: string) => {
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
      };

      const { error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', examId);

      if (error) throw error;

      await fetchExams();
      toast.success('Status atualizado com sucesso');
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.professional_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Laboratório e Resultados</h2>
        <button
          onClick={() => setShowNewExamModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Exame
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Pendentes</h3>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(exam => exam.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <TestTube className="w-5 h-5" />
            <h3 className="font-semibold">Em Andamento</h3>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(exam => exam.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Concluídos</h3>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(exam => exam.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Cancelados</h3>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(exam => exam.status === 'cancelled').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar exames..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando exames...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
              </TabsList>
            </div>

            {['pending', 'in_progress', 'completed', 'cancelled'].map(status => (
              <TabsContent key={status} value={status} className="p-6">
                <div className="space-y-4">
                  {filteredExams
                    .filter(exam => exam.status === status)
                    .map(exam => (
                      <div
                        key={exam.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{exam.patient_name}</h4>
                            <p className="text-sm text-gray-600">
                              {exam.exam_type} - {exam.professional_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(exam.priority)}`}>
                              {exam.priority === 'high' ? 'Alta' : exam.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(exam.status)}`}>
                              {exam.status === 'pending' ? 'Pendente' : 
                               exam.status === 'in_progress' ? 'Em Andamento' : 
                               exam.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Agendado para: {new Date(exam.scheduled_for).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            {exam.status === 'pending' && (
                              <button
                                onClick={() => updateExamStatus(exam.id, 'in_progress')}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Iniciar
                              </button>
                            )}
                            {exam.status === 'in_progress' && (
                              <button
                                onClick={() => updateExamStatus(exam.id, 'completed')}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Concluir
                              </button>
                            )}
                            {(exam.status === 'pending' || exam.status === 'in_progress') && (
                              <button
                                onClick={() => updateExamStatus(exam.id, 'cancelled')}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                Cancelar
                              </button>
                            )}
                            {exam.result_url && (
                              <button 
                                onClick={() => setSelectedExam(exam)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="w-4 h-4" />
                                Ver Resultado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <NewExamModal
        isOpen={showNewExamModal}
        onClose={() => setShowNewExamModal(false)}
        onSubmit={handleNewExam}
      />

      {selectedExam && selectedExam.result_url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Resultado do Exame</h3>
              <button 
                onClick={() => setSelectedExam(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ExamResult 
              examId={selectedExam.id} 
              result={{
                url: selectedExam.result_url,
                type: selectedExam.exam_type,
                date: selectedExam.completed_at || selectedExam.scheduled_for,
                doctor: selectedExam.professional_name,
                summary: selectedExam.result_summary || 'Sem resumo disponível'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
