import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { professionals } from '../lib/professionals';
import { supabase } from '../lib/supabase';
import {
  UserCog,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Building2,
  Star,
  Loader2
} from 'lucide-react';

const professionalSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  specialty: z.string().min(1, 'Selecione uma especialidade'),
  registration_number: z.string().min(3, 'Registro profissional é obrigatório'),
  sector_id: z.string().min(1, 'Selecione um setor'),
  active: z.boolean().default(true)
}).required();

type ProfessionalFormData = z.infer<typeof professionalSchema>;

interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  registration_number: string;
  sector_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfessionalManagement() {
  const [showNewProfessional, setShowNewProfessional] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [professionalsList, setProfessionalsList] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      active: true
    }
  });

  useEffect(() => {
    fetchProfessionals();
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
      toast.error('Erro ao carregar setores');
    }
  };

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const data = await professionals.getAll();
      setProfessionalsList(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfessionalFormData) => {
    try {
      setSubmitLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      await professionals.create({
        ...data,
        user_id: session.user.id
      });
      
      setShowNewProfessional(false);
      reset();
      fetchProfessionals();
    } catch (error: any) {
      console.error('Erro ao cadastrar profissional:', error);
      toast.error(error.message || 'Erro ao cadastrar profissional');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Gestão de Profissionais</h2>
        <button
          onClick={() => setShowNewProfessional(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Profissional
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Total de Profissionais</h3>
          </div>
          <p className="text-3xl font-bold">{professionalsList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <UserCog className="w-5 h-5" />
            <h3 className="font-semibold">Ativos</h3>
          </div>
          <p className="text-3xl font-bold">
            {professionalsList.filter(p => p.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <UserCog className="w-5 h-5" />
            <h3 className="font-semibold">Inativos</h3>
          </div>
          <p className="text-3xl font-bold">
            {professionalsList.filter(p => !p.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Building2 className="w-5 h-5" />
            <h3 className="font-semibold">Setores</h3>
          </div>
          <p className="text-3xl font-bold">{sectors.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar profissionais..."
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

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {professionalsList
                .filter(professional => 
                  professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  professional.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  professional.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((professional) => (
                  <div
                    key={professional.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{professional.full_name}</h4>
                        <p className="text-sm text-gray-600">
                          {professional.specialty} - {professional.registration_number}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(professional.active)}`}>
                        {professional.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Setor</p>
                        <p className="font-medium">{sectors.find(s => s.id === professional.sector_id)?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cadastrado em</p>
                        <p className="font-medium">
                          {professional.created_at ? new Date(professional.created_at).toLocaleDateString() : 'Data não disponível'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Última atualização</p>
                        <p className="font-medium">
                          {professional.updated_at ? new Date(professional.updated_at).toLocaleDateString() : 'Data não disponível'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showNewProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Profissional</h3>
              <button
                type="button"
                onClick={() => setShowNewProfessional(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    {...register('full_name')}
                    className={`w-full rounded-lg border ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidade
                  </label>
                  <select
                    {...register('specialty')}
                    className={`w-full rounded-lg border ${
                      errors.specialty ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Selecione uma especialidade</option>
                    <option value="clinica-geral">Clínica Geral</option>
                    <option value="pediatria">Pediatria</option>
                    <option value="cardiologia">Cardiologia</option>
                    <option value="ortopedia">Ortopedia</option>
                    <option value="ginecologia">Ginecologia e Obstetrícia</option>
                    <option value="psiquiatria">Psiquiatria</option>
                    <option value="neurologia">Neurologia</option>
                    <option value="dermatologia">Dermatologia</option>
                    <option value="oftalmologia">Oftalmologia</option>
                    <option value="otorrinolaringologia">Otorrinolaringologia</option>
                    <option value="urologia">Urologia</option>
                    <option value="endocrinologia">Endocrinologia</option>
                    <option value="pneumologia">Pneumologia</option>
                    <option value="gastroenterologia">Gastroenterologia</option>
                    <option value="reumatologia">Reumatologia</option>
                    <option value="infectologia">Infectologia</option>
                    <option value="hematologia">Hematologia</option>
                    <option value="oncologia">Oncologia</option>
                    <option value="nefrologia">Nefrologia</option>
                    <option value="geriatria">Geriatria</option>
                    <option value="fisioterapia">Fisioterapia</option>
                    <option value="nutricao">Nutrição</option>
                    <option value="psicologia">Psicologia</option>
                    <option value="enfermagem">Enfermagem</option>
                    <option value="farmacia">Farmácia</option>
                    <option value="odontologia">Odontologia</option>
                    <option value="fonoaudiologia">Fonoaudiologia</option>
                    <option value="terapia-ocupacional">Terapia Ocupacional</option>
                    <option value="radiologia">Radiologia</option>
                    <option value="anestesiologia">Anestesiologia</option>
                  </select>
                  {errors.specialty && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registro Profissional
                  </label>
                  <input
                    type="text"
                    {...register('registration_number')}
                    className={`w-full rounded-lg border ${
                      errors.registration_number ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.registration_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.registration_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor
                  </label>
                  <select
                    {...register('sector_id')}
                    className={`w-full rounded-lg border ${
                      errors.sector_id ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Selecione um setor</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                  {errors.sector_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.sector_id.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProfessional(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}