import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSenhas } from '@/hooks/useSenhas';

export default function QueueDisplay() {
  const { senhas } = useSenhas();

  const senhasEmAtendimento = senhas.filter(
    (senha) => senha.status === 'em_atendimento'
  );

  useEffect(() => {
    // Tocar som quando uma nova senha é chamada
    if (senhasEmAtendimento.length > 0) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play();
    }
  }, [senhasEmAtendimento.length]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Painel de Senhas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {senhasEmAtendimento.map((senha) => (
            <Card
              key={senha.id}
              className={`
                ${senha.prioridade === 'normal' ? 'bg-blue-50' : ''}
                ${senha.prioridade === 'prioritario' ? 'bg-yellow-50' : ''}
                ${senha.prioridade === 'emergencia' ? 'bg-red-50' : ''}
              `}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-6xl font-bold mb-4">{senha.numero}</p>
                  <p className="text-xl font-semibold mb-2">
                    {senha.setor === 'triagem' ? 'TRIAGEM' :
                     senha.setor === 'consultorio1' ? 'CONSULTÓRIO 1' :
                     senha.setor === 'consultorio2' ? 'CONSULTÓRIO 2' : ''}
                  </p>
                  <p className={`
                    text-lg font-medium
                    ${senha.prioridade === 'normal' ? 'text-blue-600' : ''}
                    ${senha.prioridade === 'prioritario' ? 'text-yellow-600' : ''}
                    ${senha.prioridade === 'emergencia' ? 'text-red-600' : ''}
                  `}>
                    {senha.prioridade.toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 