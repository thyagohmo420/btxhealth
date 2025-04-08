import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
export default function QueueDisplay() {
    const [queueItems, setQueueItems] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    useEffect(() => {
        // Atualizar data e hora a cada minuto
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        // Buscar senhas chamadas
        const fetchQueue = async () => {
            const { data, error } = await supabase
                .from('queue_display')
                .select('*')
                .in('status', ['em_atendimento', 'triagem'])
                .order('called_at', { ascending: false });
            if (error) {
                console.error('Erro ao buscar senhas:', error);
                return;
            }
            setQueueItems(data || []);
        };
        fetchQueue();
        // Inscrever para atualizações em tempo real
        const subscription = supabase
            .channel('queue_changes')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'queue_tickets',
        }, () => {
            fetchQueue();
        })
            .subscribe();
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-gray-100 p-8", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-purple-800 mb-4", children: "Sistema de Chamadas BTx Health" }), _jsx("p", { className: "text-xl text-gray-600", children: format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", {
                            locale: ptBR,
                        }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: queueItems.map((item) => (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-800 mb-2", children: item.ticket_number }), _jsx("div", { className: "text-xl text-gray-800 text-center mb-2", children: item.patient_name }), _jsx("div", { className: "text-lg text-purple-600 font-semibold", children: item.room || 'Aguardando sala...' }), _jsx("div", { className: "text-sm text-gray-500 mt-2", children: format(new Date(item.called_at), 'HH:mm') })] }) }, item.id))) }), queueItems.length === 0 && (_jsx("div", { className: "text-center text-gray-500 text-xl mt-12", children: "Nenhuma senha sendo chamada no momento" }))] }));
}
