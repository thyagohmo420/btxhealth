import React, { useState, useEffect } from 'react';
import { Search, UserPlus, User, FileText, Phone, Printer, Calendar } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient } from '@/types/patient';
import type { PrioridadeTipo } from '@/types/queue';
import { supabase } from '@/lib/supabaseConfig';

interface PatientFormData {
  full_name: string;
  cpf: string;
  phone: string;
  sus_card?: string;
  birth_date: string;
}

export default function Reception() {
  const { patients, createPatient, refreshPatients } = usePatients();
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: '',
    cpf: '',
    phone: '',
    sus_card: '',
    birth_date: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'cpf' | 'birth_date'>('name');

  // Forçar atualização dos pacientes ao carregar a página
  useEffect(() => {
    console.log("Carregando página de recepção");
    refreshPatients();
  }, [refreshPatients]);

  // Exibir log dos pacientes carregados
  useEffect(() => {
    console.log(`Total de pacientes carregados: ${patients.length}`);
  }, [patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Iniciando cadastro de paciente na recepção:", formData);
      
      // Criar paciente diretamente usando o hook de pacientes para garantir integração
      const newPatient = await createPatient({
        full_name: formData.full_name,
        cpf: formData.cpf,
        phone: formData.phone,
        birth_date: formData.birth_date,
        sus_card: formData.sus_card,
        priority: 'normal' as any,
        status: 'waiting',
        severity: 'low',
        gender: '',
        rg: '',
        marital_status: '',
        email: '',
        user_id: ''
      });
      
      console.log("Paciente cadastrado com sucesso:", newPatient);
      
      // Gerar e cadastrar senha de atendimento
      const ticketNumber = generateTicketNumber();
      console.log("Gerando senha de atendimento:", ticketNumber);

      const { error: queueError } = await supabase
        .from('queue')
        .insert([{
          number: ticketNumber,
          patient_id: newPatient.id,
          sector: 'triagem',
          status: 'waiting',
          priority: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (queueError) {
        console.error("Erro ao gerar senha:", queueError);
        throw queueError;
      }

      console.log("Senha gerada com sucesso");
      
      // Limpar formulário
      setFormData({
        full_name: '',
        cpf: '',
        phone: '',
        sus_card: '',
        birth_date: ''
      });

      // Forçar atualização da lista
      refreshPatients();
      
      // Fechar modal
      const modal = document.getElementById('newPatientModal') as HTMLDialogElement;
      if (modal) modal.close();

    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
    }
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${year}${month}${day}-${random}`;
  };

  const filteredPatients = patients.filter((patient: Patient) => {
    if (searchTerm === '') return true;
    
    switch (searchType) {
      case 'name':
        return patient.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      case 'cpf':
        return patient.cpf.includes(searchTerm);
      case 'birth_date':
        return patient.birth_date?.includes(searchTerm);
      default:
        return true;
    }
  });

  const openNewPatientModal = () => {
    const modal = document.getElementById('newPatientModal') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const closeNewPatientModal = () => {
    const modal = document.getElementById('newPatientModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
      setFormData({
        full_name: '',
        cpf: '',
        phone: '',
        sus_card: '',
        birth_date: ''
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recepção</h1>
        <button
          onClick={openNewPatientModal}
          className="btn btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Paciente
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-1/4">
          <select 
            className="select select-bordered w-full"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'name' | 'cpf' | 'birth_date')}
          >
            <option value="name">Buscar por nome</option>
            <option value="cpf">Buscar por CPF</option>
            <option value="birth_date">Buscar por data de nascimento</option>
          </select>
        </div>
        <div className="form-control flex-1">
          <div className="input-group">
            <input
              type={searchType === 'birth_date' ? 'date' : 'text'}
              placeholder={
                searchType === 'name' 
                  ? "Digite o nome..." 
                  : searchType === 'cpf' 
                    ? "Digite o CPF..." 
                    : "Selecione a data de nascimento..."
              }
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Data de Nascimento</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient: Patient) => (
              <tr key={patient.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-bold">{patient.full_name}</div>
                      <div className="text-sm opacity-50">
                        {patient.sus_card || '-'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{patient.cpf}</td>
                <td>{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{patient.phone}</td>
                <td>{patient.status}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="newPatientModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Novo Paciente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome Completo</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">CPF</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Data de Nascimento</span>
              </label>
              <div className="input-group">
                <span className="input-group-addon">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Telefone</span>
              </label>
              <input
                type="tel"
                className="input input-bordered"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Cartão SUS</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.sus_card || ''}
                onChange={(e) => setFormData({ ...formData, sus_card: e.target.value })}
              />
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Cadastrar
              </button>
              <button
                type="button"
                className="btn"
                onClick={closeNewPatientModal}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}