import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search, FileText, Pill } from 'lucide-react';
export default function MedicalRecords() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const patients = [
        {
            id: '1',
            name: 'Maria Silva',
            birthDate: '1980-05-15',
            cpf: '123.456.789-00',
            bloodType: 'O+',
            allergies: ['Penicilina', 'Dipirona'],
            chronicConditions: ['Hipertensão', 'Diabetes']
        },
        {
            id: '2',
            name: 'João Santos',
            birthDate: '1975-08-22',
            cpf: '987.654.321-00',
            bloodType: 'A+',
            allergies: ['Sulfas'],
            chronicConditions: ['Asma']
        },
        // Adicione mais pacientes conforme necessário
    ];
    const medicalRecords = [
        {
            id: '1',
            date: '2024-02-20',
            type: 'consultation',
            description: 'Consulta de rotina. Paciente apresentou pressão arterial controlada.',
            professional: 'Dr. Silva',
            prescriptions: ['Losartana 50mg', 'Metformina 850mg'],
            attachments: ['exame_sangue.pdf']
        },
        {
            id: '2',
            date: '2024-01-15',
            type: 'exam',
            description: 'Exame de sangue completo. Resultados dentro da normalidade.',
            professional: 'Dra. Costa',
            attachments: ['resultado_exame.pdf']
        },
        // Adicione mais registros conforme necessário
    ];
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    const getRecordTypeColor = (type) => {
        switch (type) {
            case 'consultation':
                return 'bg-blue-100 text-blue-800';
            case 'exam':
                return 'bg-green-100 text-green-800';
            case 'procedure':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getRecordTypeText = (type) => {
        switch (type) {
            case 'consultation':
                return 'Consulta';
            case 'exam':
                return 'Exame';
            case 'procedure':
                return 'Procedimento';
            default:
                return type;
        }
    };
    const filteredPatients = patients.filter(patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h2", { className: "text-2xl font-semibold text-gray-800", children: "Prontu\u00E1rio M\u00E9dico" }) }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", placeholder: "Buscar por nome ou CPF...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Paciente" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "CPF" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Idade" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tipo Sangu\u00EDneo" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredPatients.map((patient) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => setSelectedPatient(patient), children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: patient.name }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: patient.cpf }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [calculateAge(patient.birthDate), " anos"] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: patient.bloodType })] }, patient.id))) })] }) })] }), selectedPatient && (_jsxs("div", { className: "w-96 bg-white rounded-lg shadow", children: [_jsxs("div", { className: "p-4 border-b", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: selectedPatient.name }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: `flex-1 px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'info'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'text-gray-600 hover:bg-gray-100'}`, onClick: () => setActiveTab('info'), children: "Informa\u00E7\u00F5es" }), _jsx("button", { className: `flex-1 px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'history'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'text-gray-600 hover:bg-gray-100'}`, onClick: () => setActiveTab('history'), children: "Hist\u00F3rico" }), _jsx("button", { className: `flex-1 px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'attachments'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'text-gray-600 hover:bg-gray-100'}`, onClick: () => setActiveTab('attachments'), children: "Anexos" })] })] }), _jsxs("div", { className: "p-4", children: [activeTab === 'info' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Data de Nascimento" }), _jsx("div", { className: "font-medium", children: new Date(selectedPatient.birthDate).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "CPF" }), _jsx("div", { className: "font-medium", children: selectedPatient.cpf })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Tipo Sangu\u00EDneo" }), _jsx("div", { className: "font-medium", children: selectedPatient.bloodType })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Alergias" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-1", children: selectedPatient.allergies.map((allergy, index) => (_jsx("span", { className: "px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full", children: allergy }, index))) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Condi\u00E7\u00F5es Cr\u00F4nicas" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-1", children: selectedPatient.chronicConditions.map((condition, index) => (_jsx("span", { className: "px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full", children: condition }, index))) })] })] })), activeTab === 'history' && (_jsx("div", { className: "space-y-4", children: medicalRecords.map((record) => (_jsxs("div", { className: "border-b pb-4 last:border-0 last:pb-0", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)}`, children: getRecordTypeText(record.type) }), _jsx("div", { className: "text-sm text-gray-500", children: record.date })] }), _jsx("div", { className: "text-sm text-gray-600 mb-2", children: record.description }), _jsx("div", { className: "text-sm text-gray-500", children: record.professional }), record.prescriptions && record.prescriptions.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Prescri\u00E7\u00F5es:" }), _jsx("ul", { className: "mt-1 space-y-1", children: record.prescriptions.map((prescription, index) => (_jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Pill, { className: "w-4 h-4 text-blue-500" }), prescription] }, index))) })] }))] }, record.id))) })), activeTab === 'attachments' && (_jsx("div", { className: "space-y-4", children: medicalRecords
                                            .filter(record => record.attachments && record.attachments.length > 0)
                                            .map((record) => (_jsxs("div", { className: "border-b pb-4 last:border-0 last:pb-0", children: [_jsx("div", { className: "text-sm text-gray-500 mb-2", children: record.date }), _jsx("ul", { className: "space-y-2", children: record.attachments?.map((attachment, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-sm", children: attachment })] }, index))) })] }, record.id))) }))] })] }))] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-medium text-blue-800 mb-2", children: "Informa\u00E7\u00F5es Importantes" }), _jsxs("ul", { className: "list-disc list-inside text-blue-700 space-y-1", children: [_jsx("li", { children: "Mantenha o prontu\u00E1rio sempre atualizado" }), _jsx("li", { children: "Verifique as alergias antes de prescrever medicamentos" }), _jsx("li", { children: "Anexe todos os exames e resultados relevantes" }), _jsx("li", { children: "Em caso de d\u00FAvida, consulte o hist\u00F3rico completo do paciente" })] })] })] }));
}
