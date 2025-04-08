
import { Download, Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExamResultProps {
  examId: string;
  result: {
    url: string;
    type: string;
    date: string;
    doctor: string;
    summary: string;
  };
}

export default function ExamResult({ examId, result }: ExamResultProps) {
  const handleDownload = async () => {
    try {
      // Aqui você implementaria a lógica real de download
      // Por enquanto, vamos simular um download
      toast.success('Download iniciado');
    } catch (error) {
      toast.error('Erro ao baixar resultado');
    }
  };

  const handleShare = async () => {
    try {
      // Aqui você implementaria a lógica real de compartilhamento
      // Por enquanto, vamos simular um compartilhamento
      toast.success('Link de compartilhamento gerado');
    } catch (error) {
      toast.error('Erro ao compartilhar resultado');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Resultado do Exame</h3>
          <p className="text-sm text-gray-600">
            Data: {new Date(result.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Médico: {result.doctor}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Download className="w-4 h-4" />
            Baixar
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium">{result.type}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {result.summary}
        </p>
      </div>

      {/* Preview do documento (simulado) */}
      <div className="mt-4 border rounded-lg p-4 bg-gray-100 flex items-center justify-center h-40">
        <p className="text-gray-500">Visualização do documento</p>
      </div>
    </div>
  );
} 