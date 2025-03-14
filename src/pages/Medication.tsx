import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../components/ui/tabs';
import {
  Pill,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import NewPrescriptionModal from '../components/medication/NewPrescriptionModal';

interface Medication {
  id: string;
  patient_name: string;
  medicine: string;
  status: 'pending' | 'administered' | 'cancelled' | 'delayed';
  scheduled_for: string;
  nurse_name?: string;
  priority: 'low' | 'medium' | 'high';
  dosage: string;
  route: string;
  frequency: string;
}

export default function Medication() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications_view')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setMedications(data || []);
    } catch (err) {
      console.error('Erro ao carregar medicações:', err);
      toast.error('Erro ao carregar medicações');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrescription = async (data: any) => {
    try {
      const { error } = await supabase
        .from('medications')
        .insert([{
          patient_id: data.patient_id,
          professional_id: data.professional_id,
          medicine: data.medicine,
          dosage: data.dosage,
          route: data.route,
          frequency: data.frequency,
          priority: data.priority,
          scheduled_for: data.scheduled_for,
          notes: data.notes
        }]);

      if (error) throw error;

      await fetchMedications();
      setShowNewPrescription(false);
      toast.success('Prescrição criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar prescrição:', err);
      toast.error('Erro ao criar prescrição');
    }
  };

  const updateMedicationStatus = async (medicationId: string, newStatus: string) => {
    try {
      // Buscar o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Verificar se o usuário é enfermeiro através do setor
      const { data: isNurse, error: checkError } = await supabase
        .rpc('is_nurse', { user_id: user.id });

      if (checkError) {
        console.error('Erro ao verificar permissões:', checkError);
        toast.error('Erro ao verificar permissões');
        return;
      }

      if (!isNurse) {
        toast.error('Apenas enfermeiros podem atualizar medicações');
        return;
      }

      // Buscar o registro do profissional
      const { data: nurseData, error: nurseError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .limit(1)
        .single();

      if (nurseError) {
        console.error('Erro ao buscar profissional:', nurseError);
        toast.error('Erro ao identificar profissional');
        return;
      }

      // Atualizar o status da medicação
      const { error: updateError } = await supabase
        .from('medications')
        .update({
          status: newStatus,
          ...(newStatus === 'administered' ? {
            administered_at: new Date().toISOString(),
            nurse_id: nurseData.id
          } : {})
        })
        .eq('id', medicationId);

      if (updateError) {
        console.error('Erro ao atualizar medicação:', updateError);
        toast.error('Erro ao atualizar status da medicação');
        return;
      }

      // Atualizar a lista de medicações
      fetchMedications();
      toast.success(`Medicação ${newStatus === 'administered' ? 'administrada' : 'cancelada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar medicação:', error);
      toast.error('Erro ao atualizar status da medicação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'administered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
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

  const filteredMedications = medications.filter(med => 
    med.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.medicine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countByStatus = (status: string) => 
    medications.filter(med => med.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Medicação e Enfermagem</h2>
        <button
          onClick={() => setShowNewPrescription(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Prescrição
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Pendentes</h3>
          </div>
          <p className="text-3xl font-bold">{countByStatus('pending')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold">Administrados</h3>
          </div>
          <p className="text-3xl font-bold">{countByStatus('administered')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="w-5 h-5" />
            <h3 className="font-semibold">Atrasados</h3>
          </div>
          <p className="text-3xl font-bold">{countByStatus('delayed')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold">Cancelados</h3>
          </div>
          <p className="text-3xl font-bold">{countByStatus('cancelled')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar medicações..."
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

        <Tabs defaultValue="pending" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="administered">Administrados</TabsTrigger>
              <TabsTrigger value="delayed">Atrasados</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>
          </div>

          {['pending', 'administered', 'delayed', 'cancelled'].map(status => (
            <TabsContent key={status} value={status} className="p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando medicações...</p>
                  </div>
                ) : (
                  filteredMedications
                    .filter(med => med.status === status)
                    .map(med => (
                      <div
                        key={med.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{med.patient_name}</h4>
                            <p className="text-sm text-gray-600">
                              {med.medicine} - {med.dosage} ({med.route})
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(med.priority)}`}>
                              {med.priority === 'high' ? 'Alta' : med.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(med.status)}`}>
                              {med.status === 'pending' ? 'Pendente' : 
                               med.status === 'administered' ? 'Administrado' : 
                               med.status === 'delayed' ? 'Atrasado' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Agendado: {new Date(med.scheduled_for).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Frequência: {med.frequency}</span>
                            </div>
                            {med.nurse_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{med.nurse_name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {med.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => updateMedicationStatus(med.id, 'administered')}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Administrar
                                </button>
                                <button 
                                  onClick={() => updateMedicationStatus(med.id, 'cancelled')}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <NewPrescriptionModal
        isOpen={showNewPrescription}
        onClose={() => setShowNewPrescription(false)}
        onSubmit={handleNewPrescription}
      />
    </div>
  );
} 