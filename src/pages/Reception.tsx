import React, { useState } from 'react';
import { Search, UserPlus, Clock, Filter, User, FileText, Phone, Printer, AlertCircle } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { usePatients } from '../contexts/PatientsContext';

interface PatientRegistration {
  name: string;
  cpf: string;
  susCard?: string;
  phone?: string;
  ticketNumber: string;
}

export default function Reception() {
  const { addPatient, currentTicketNumber, patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    susCard: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [lastTicketNumber, setLastTicketNumber] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_triage':
        return 'bg-blue-100 text-blue-800';
      case 'in_service':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in_triage':
        return 'Em Triagem';
      case 'in_service':
        return 'Em Atendimento';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  // Filtrar pacientes que não estão finalizados
  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = (
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.ticketNumber.includes(searchTerm) ||
      patient.cpf.includes(searchTerm)
    );
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter && patient.status !== 'completed';
  }).sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()) || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (formato: 000.000.000-00)';
    }

    if (formData.phone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido (formato: (00) 00000-0000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Gerar número da senha no formato AAMMDD-NNNN
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const number = currentTicketNumber.toString().padStart(4, '0');
    const ticketNumber = `${year}${month}${day}-${number}`;

    addPatient({
      ...formData,
      ticketNumber,
      status: 'waiting'
    });

    // Salvar a última senha gerada e manter por mais tempo
    setLastTicketNumber(ticketNumber);

    // Limpar formulário
    setFormData({
      name: '',
      cpf: '',
      susCard: '',
      phone: ''
    });

    setRegistrationSuccess(true);
    
    // Aumentar o tempo da mensagem e do botão de impressão para 30 segundos
    setTimeout(() => {
      setRegistrationSuccess(false);
      setLastTicketNumber('');
    }, 30000);
  };

  const handlePrintTicket = (ticketNumber: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const patient = patients.find(p => p.ticketNumber === ticketNumber);
    if (!patient) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha de Atendimento</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .ticket-number {
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .info {
              margin-bottom: 15px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hospital de Juquitiba</h1>
            <p>Ficha de Atendimento</p>
          </div>
          <div class="ticket-number">
            Senha: ${patient.ticketNumber}
          </div>
          <div class="info">
            <p><strong>Paciente:</strong> ${patient.name}</p>
            <p><strong>CPF:</strong> ${patient.cpf}</p>
            ${patient.susCard ? `<p><strong>Cartão SUS:</strong> ${patient.susCard}</p>` : ''}
            ${patient.phone ? `<p><strong>Telefone:</strong> ${patient.phone}</p>` : ''}
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Hora de Chegada:</strong> ${patient.arrivalTime}</p>
          </div>
          <div class="footer">
            <p>Por favor, aguarde ser chamado pelo seu número de senha.</p>
            <p>Impresso em: ${formattedDate} às ${formattedTime}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Recepção - Cadastro de Pacientes</h2>
        {lastTicketNumber && (
          <button
            type="button"
            onClick={() => handlePrintTicket(lastTicketNumber)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir Ficha
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome completo"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cpf ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                required
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cartão SUS
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.susCard}
                onChange={(e) => setFormData({ ...formData, susCard: e.target.value })}
                placeholder="Número do cartão SUS"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Cadastrar Paciente
            </button>
          </div>
        </form>

        {registrationSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Paciente cadastrado com sucesso! Senha: {lastTicketNumber}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Lista de Pacientes</h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou senha..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="waiting">Aguardando</option>
                <option value="in_triage">Em Triagem</option>
                <option value="in_service">Em Atendimento</option>
              </select>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Senha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.ticketNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.cpf}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.arrivalTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {getStatusText(patient.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}