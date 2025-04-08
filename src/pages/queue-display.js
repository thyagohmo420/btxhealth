import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useSenhas } from '@/hooks/useSenhas';
export default function QueueDisplay() {
    const { senhas } = useSenhas();
    const senhasEmAtendimento = senhas.filter((senha) => senha.status === 'em_atendimento');
    useEffect(() => {
        // Tocar som quando uma nova senha é chamada
        if (senhasEmAtendimento.length > 0) {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play();
        }
    }, [senhasEmAtendimento.length]);
    return (_jsx("div", { className: "min-h-screen bg-gray-100 p-8", children: _jsxs("div", { className: "container mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold text-center mb-8", children: "Painel de Senhas" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: senhasEmAtendimento.map((senha) => (_jsx(Card, { className: `
                ${senha.priority === 'normal' ? 'bg-blue-50' : ''}
                ${senha.priority === 'priority' ? 'bg-yellow-50' : ''}
                ${senha.priority === 'urgent' ? 'bg-red-50' : ''}
                p-4 rounded-lg shadow-sm flex justify-between items-center
              `, children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: senha.sector === 'triagem' ? 'TRIAGEM' :
                                        senha.sector === 'consultorio1' ? 'CONSULTÓRIO 1' :
                                            senha.sector === 'consultorio2' ? 'CONSULTÓRIO 2' : '' }), _jsx("div", { className: "text-2xl font-bold", children: senha.number }), _jsx("div", { className: `
                  text-sm font-medium
                  ${senha.priority === 'normal' ? 'text-blue-600' : ''}
                  ${senha.priority === 'priority' ? 'text-yellow-600' : ''}
                  ${senha.priority === 'urgent' ? 'text-red-600' : ''}
                `, children: senha.priority.toUpperCase() })] }) }, senha.id))) })] }) }));
}
