import { useState, useEffect } from 'react';
import { UserPlus, Search, Pencil, Trash, User } from 'lucide-react';
import { Professional } from '@/types/professional';

const STORAGE_KEY = '@HospitalJuquitiba:professionals';

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState<Omit<Professional, 'id'>>({
    full_name: '',
    email: '',
    phone: '',
    role: 'doctor',
    specialization: '',
    registration_number: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
  }, [professionals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProfessional) {
      handleUpdateProfessional(editingProfessional.id, formData);
      setEditingProfessional(null);
    } else {
      const newProfessional: Professional = {
        ...formData,
        id: crypto.randomUUID()
      };
      handleAddProfessional(newProfessional);
    }

    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'doctor',
      specialization: '',
      registration_number: '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      full_name: professional.full_name,
      email: professional.email,
      phone: professional.phone,
      role: professional.role,
      specialization: professional.specialization,
      registration_number: professional.registration_number || '',
      status: professional.status,
      created_at: professional.created_at,
      updated_at: professional.updated_at
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      setProfessionals(prevProfessionals =>
        prevProfessionals.filter(p => p.id !== id)
      );
    }
  };

  const handleUpdateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(prevProfessionals =>
      prevProfessionals.map(p =>
        p.id === id
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      )
    );
  };

  const handleAddProfessional = (data: Professional) => {
    setProfessionals(prevProfessionals => [
      ...prevProfessionals,
      data
    ]);
  };

  const filteredProfessionals = professionals.filter(professional =>
    professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (professional.registration_number && professional.registration_number.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Cadastro de Profissionais</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função *
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as Professional['role'] })}
              >
                <option value="doctor">Médico</option>
                <option value="nurse">Enfermeiro</option>
                <option value="receptionist">Recepcionista</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CRM *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.registration_number}
                  onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                />
              </div>
            )}

            {formData.role === 'nurse' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  COREN *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.registration_number}
                  onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialização
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {editingProfessional ? 'Atualizar Profissional' : 'Cadastrar Profissional'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Lista de Profissionais</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar profissional..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProfessionals.map((professional) => (
                  <tr key={professional.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{professional.full_name}</div>
                          <div className="text-sm text-gray-500">
                            {professional.role === 'doctor' && 'Médico'}
                            {professional.role === 'nurse' && 'Enfermeiro'}
                            {professional.role === 'receptionist' && 'Recepcionista'}
                            {professional.role === 'other' && 'Outro'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {professional.registration_number && `Registro: ${professional.registration_number}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{professional.email}</div>
                      <div className="text-sm text-gray-500">{professional.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        professional.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(professional)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(professional.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 