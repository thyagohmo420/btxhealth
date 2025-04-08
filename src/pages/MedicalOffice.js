import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { supabase } from '@/lib/supabaseConfig';
export default function MedicalOffice() {
    const { patients } = usePatients();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const filteredPatients = patients.filter((patient) => patient.status === 'in_progress' &&
        (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.cpf.includes(searchTerm)));
    const handleStartConsultation = async (patient) => {
        try {
            const { error } = await supabase
                .from('patients')
                .update({
                status: 'in_progress',
                updated_at: new Date().toISOString()
            })
                .eq('id', patient.id);
            if (error)
                throw error;
            setSelectedPatient(patient);
        }
        catch (error) {
            console.error('Erro ao iniciar consulta:', error);
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("div", { className: "flex justify-between items-center mb-6", children: _jsx("h1", { className: "text-2xl font-bold", children: "Consult\u00F3rio" }) }), _jsx("div", { className: "flex gap-4 mb-6", children: _jsx("div", { className: "form-control flex-1", children: _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", placeholder: "Buscar por nome ou CPF...", className: "input input-bordered w-full", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx("button", { className: "btn btn-square", children: _jsx(Search, { className: "w-6 h-6" }) })] }) }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "table w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nome" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: "Prioridade" }), _jsx("th", { children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: filteredPatients.map((patient) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("div", { className: "flex items-center space-x-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-bold", children: patient.full_name }), _jsx("div", { className: "text-sm opacity-50", children: patient.sus_card || '-' })] }) }) }), _jsx("td", { children: patient.cpf }), _jsx("td", { children: patient.priority }), _jsx("td", { children: _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => handleStartConsultation(patient), children: "Iniciar Consulta" }) })] }, patient.id))) })] }) }), selectedPatient && (_jsx("div", { className: "card bg-base-100 shadow-xl", children: _jsxs("div", { className: "card-body", children: [_jsxs("h2", { className: "card-title", children: ["Consulta - ", selectedPatient.full_name] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Sinais Vitais" }), selectedPatient.vital_signs ? (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-gray-600", children: ["PA: ", selectedPatient.vital_signs.blood_pressure] }), _jsxs("div", { className: "text-gray-600", children: ["FC: ", selectedPatient.vital_signs.heart_rate, " bpm"] }), _jsxs("div", { className: "text-gray-600", children: ["FR: ", selectedPatient.vital_signs.respiratory_rate, " rpm"] }), _jsxs("div", { className: "text-gray-600", children: ["SpO2: ", selectedPatient.vital_signs.oxygen_saturation, "%"] }), _jsxs("div", { className: "text-gray-600", children: ["Temp: ", selectedPatient.vital_signs.temperature, "\u00B0C"] }), _jsxs("div", { className: "text-gray-600", children: ["Dor: ", selectedPatient.vital_signs.pain_level, "/10"] })] })) : (_jsx("p", { className: "text-gray-500", children: "Nenhum sinal vital registrado" }))] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Hist\u00F3rico de Triagem" }), selectedPatient.triage_history?.map((triage, index) => (_jsxs("div", { className: "card bg-base-100 shadow-sm p-4 mb-4", children: [_jsxs("h4", { className: "font-bold", children: ["Triagem ", index + 1] }), _jsxs("p", { children: [_jsx("strong", { children: "Sintomas:" }), " ", triage.symptoms.join(', ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Prioridade:" }), " ", triage.priority] }), _jsxs("p", { children: [_jsx("strong", { children: "Data:" }), " ", new Date(triage.created_at).toLocaleString()] })] }, triage.id)))] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Hist\u00F3rico de Consultas" }), selectedPatient.consultation_history?.map((consultation, index) => (_jsxs("div", { className: "card bg-base-100 shadow-sm p-4 mb-4", children: [_jsxs("h4", { className: "font-bold", children: ["Consulta ", index + 1] }), _jsxs("p", { children: [_jsx("strong", { children: "Sintomas:" }), " ", consultation.symptoms.join(', ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Diagn\u00F3stico:" }), " ", consultation.diagnosis] }), _jsxs("p", { children: [_jsx("strong", { children: "Tratamento:" }), " ", consultation.treatment] }), _jsxs("p", { children: [_jsx("strong", { children: "Prescri\u00E7\u00F5es:" }), " ", consultation.prescriptions.map(p => p.medication).join(', ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Exames:" }), " ", consultation.exams.map(e => e.name).join(', ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Data:" }), " ", new Date(consultation.created_at).toLocaleString()] })] }, consultation.id)))] })] })] }) }))] })] }));
}
