import { useState } from 'react';
import { VitalSigns } from '@/types/patient';
import { Button } from '@/components/ui/button';

interface VitalSignsFormProps {
  onSubmit: (data: VitalSigns) => Promise<void>;
  onCancel: () => void;
  initialData?: VitalSigns;
}

export function VitalSignsForm({ onSubmit, onCancel, initialData }: VitalSignsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VitalSigns>({
    temperature: initialData?.temperature || 0,
    bloodPressure: {
      systolic: initialData?.bloodPressure?.systolic || 0,
      diastolic: initialData?.bloodPressure?.diastolic || 0
    },
    heartRate: initialData?.heartRate || 0,
    respiratoryRate: initialData?.respiratoryRate || 0,
    oxygenSaturation: initialData?.oxygenSaturation || 0,
    painLevel: initialData?.painLevel || 0,
    glucoseLevel: initialData?.glucoseLevel,
    weight: initialData?.weight,
    height: initialData?.height,
    bmi: initialData?.bmi,
    measuredAt: initialData?.measuredAt || new Date().toISOString(),
    notes: initialData?.notes || ''
  });

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar sinais vitais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bloodPressure.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bloodPressure: {
          ...prev.bloodPressure,
          [field]: parseInt(value) || 0
        }
      }));
    } else if (name === 'height' || name === 'weight') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || undefined }));
      if (name === 'height' || name === 'weight') {
        setTimeout(calculateBMI, 0);
      }
    } else if (
      name === 'temperature' ||
      name === 'heartRate' ||
      name === 'respiratoryRate' ||
      name === 'oxygenSaturation' ||
      name === 'painLevel' ||
      name === 'glucoseLevel'
    ) {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            Temperatura (°C)
          </label>
          <input
            type="number"
            step="0.1"
            name="temperature"
            id="temperature"
            required
            value={formData.temperature || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bloodPressure.systolic" className="block text-sm font-medium text-gray-700">
            Pressão Arterial (mmHg)
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="number"
              name="bloodPressure.systolic"
              id="bloodPressure.systolic"
              required
              value={formData.bloodPressure.systolic || ''}
              onChange={handleChange}
              placeholder="Sistólica"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <span className="inline-flex items-center text-gray-500">/</span>
            <input
              type="number"
              name="bloodPressure.diastolic"
              id="bloodPressure.diastolic"
              required
              value={formData.bloodPressure.diastolic || ''}
              onChange={handleChange}
              placeholder="Diastólica"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">
            Frequência Cardíaca (bpm)
          </label>
          <input
            type="number"
            name="heartRate"
            id="heartRate"
            required
            value={formData.heartRate || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700">
            Frequência Respiratória (rpm)
          </label>
          <input
            type="number"
            name="respiratoryRate"
            id="respiratoryRate"
            required
            value={formData.respiratoryRate || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="oxygenSaturation" className="block text-sm font-medium text-gray-700">
            Saturação de Oxigênio (%)
          </label>
          <input
            type="number"
            name="oxygenSaturation"
            id="oxygenSaturation"
            required
            value={formData.oxygenSaturation || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="painLevel" className="block text-sm font-medium text-gray-700">
            Nível de Dor (0-10)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            name="painLevel"
            id="painLevel"
            value={formData.painLevel || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="glucoseLevel" className="block text-sm font-medium text-gray-700">
            Glicemia (mg/dL)
          </label>
          <input
            type="number"
            name="glucoseLevel"
            id="glucoseLevel"
            value={formData.glucoseLevel || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            name="weight"
            id="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">
            Altura (cm)
          </label>
          <input
            type="number"
            name="height"
            id="height"
            value={formData.height || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">
            IMC
          </label>
          <input
            type="number"
            name="bmi"
            id="bmi"
            disabled
            value={formData.bmi || ''}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={formData.notes || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
} 