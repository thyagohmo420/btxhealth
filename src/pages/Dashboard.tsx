import React from 'react';
import { Users, Calendar, Activity, FileText, Syringe, Pill } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <div className="p-2 bg-blue-50 rounded-lg">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Última atualização: {new Date().toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Pacientes"
          value="1.234"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          description="Total de pacientes cadastrados"
        />
        <StatCard
          title="Consultas"
          value="48"
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          description="Consultas agendadas para hoje"
        />
        <StatCard
          title="Atendimentos"
          value="156"
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          description="Atendimentos realizados esta semana"
        />
        <StatCard
          title="Prontuários"
          value="892"
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          description="Prontuários atualizados este mês"
        />
        <StatCard
          title="Vacinas"
          value="75"
          icon={<Syringe className="w-6 h-6 text-blue-600" />}
          description="Vacinas aplicadas esta semana"
        />
        <StatCard
          title="Medicamentos"
          value="523"
          icon={<Pill className="w-6 h-6 text-blue-600" />}
          description="Medicamentos dispensados esta semana"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {[
              { time: '09:45', action: 'Nova consulta agendada', patient: 'Maria Silva' },
              { time: '09:30', action: 'Prontuário atualizado', patient: 'João Santos' },
              { time: '09:15', action: 'Vacina aplicada', patient: 'Pedro Oliveira' },
              { time: '09:00', action: 'Medicamento dispensado', patient: 'Ana Costa' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">Paciente: {activity.patient}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Próximos Agendamentos</h3>
          <div className="space-y-4">
            {[
              { time: '10:00', type: 'Consulta', doctor: 'Dr. Carlos Silva', patient: 'Roberto Alves' },
              { time: '10:30', type: 'Exame', doctor: 'Dra. Ana Paula', patient: 'Fernanda Lima' },
              { time: '11:00', type: 'Retorno', doctor: 'Dr. Marcos Santos', patient: 'Luciana Costa' },
              { time: '11:30', type: 'Consulta', doctor: 'Dra. Patricia', patient: 'Gabriel Souza' },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{appointment.type} - {appointment.doctor}</p>
                  <p className="text-sm text-gray-500">Paciente: {appointment.patient}</p>
                </div>
                <span className="text-sm text-gray-500">{appointment.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 