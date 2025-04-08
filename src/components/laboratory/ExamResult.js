import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download, Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';
export default function ExamResult({ examId, result }) {
    const handleDownload = async () => {
        try {
            // Aqui você implementaria a lógica real de download
            // Por enquanto, vamos simular um download
            toast.success('Download iniciado');
        }
        catch (error) {
            toast.error('Erro ao baixar resultado');
        }
    };
    const handleShare = async () => {
        try {
            // Aqui você implementaria a lógica real de compartilhamento
            // Por enquanto, vamos simular um compartilhamento
            toast.success('Link de compartilhamento gerado');
        }
        catch (error) {
            toast.error('Erro ao compartilhar resultado');
        }
    };
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-1", children: "Resultado do Exame" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Data: ", new Date(result.date).toLocaleDateString()] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["M\u00E9dico: ", result.doctor] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleDownload, className: "flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md", children: [_jsx(Download, { className: "w-4 h-4" }), "Baixar"] }), _jsxs("button", { onClick: handleShare, className: "flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md", children: [_jsx(Share2, { className: "w-4 h-4" }), "Compartilhar"] })] })] }), _jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(FileText, { className: "w-5 h-5 text-gray-500" }), _jsx("span", { className: "text-sm font-medium", children: result.type })] }), _jsx("p", { className: "text-sm text-gray-700 whitespace-pre-line", children: result.summary })] }), _jsx("div", { className: "mt-4 border rounded-lg p-4 bg-gray-100 flex items-center justify-center h-40", children: _jsx("p", { className: "text-gray-500", children: "Visualiza\u00E7\u00E3o do documento" }) })] }));
}
