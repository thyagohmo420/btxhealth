import { VitalSigns } from '@/types/patient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VitalSignsHistoryProps {
  vitalSigns: VitalSigns[];
}

export function VitalSignsHistory({ vitalSigns }: VitalSignsHistoryProps) {
  if (vitalSigns.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhum registro de sinais vitais
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data/Hora
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Temperatura
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pressão Arterial
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              FC
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              FR
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SpO2
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Glicemia
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IMC
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vitalSigns.map((record, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(record.measuredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.temperature}°C
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.bloodPressure.systolic}/{record.bloodPressure.diastolic} mmHg
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.heartRate} bpm
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.respiratoryRate} rpm
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.oxygenSaturation}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.painLevel ?? '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.glucoseLevel ? `${record.glucoseLevel} mg/dL` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.bmi ? record.bmi.toFixed(1) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 