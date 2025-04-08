import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseConfig';
const ProfessionalsContext = createContext({});
export function ProfessionalsProvider({ children }) {
    const [professionals, setProfessionals] = useState([]);
    const [currentProfessional, setCurrentProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadProfessionals();
    }, []);
    async function loadProfessionals() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('professionals')
                .select('*');
            if (error)
                throw error;
            setProfessionals(data || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
        }
        finally {
            setLoading(false);
        }
    }
    async function getProfessional(id) {
        try {
            const { data, error } = await supabase
                .from('professionals')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar profissional');
            return null;
        }
    }
    async function updateProfessional(id, data) {
        try {
            const { error } = await supabase
                .from('professionals')
                .update(data)
                .eq('id', id);
            if (error)
                throw error;
            setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar profissional');
        }
    }
    async function createProfessional(data) {
        try {
            const { data: newProfessional, error } = await supabase
                .from('professionals')
                .insert([data])
                .select()
                .single();
            if (error)
                throw error;
            setProfessionals(prev => [...prev, newProfessional]);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar profissional');
        }
    }
    async function deleteProfessional(id) {
        try {
            const { error } = await supabase
                .from('professionals')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            setProfessionals(prev => prev.filter(p => p.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir profissional');
        }
    }
    return (_jsx(ProfessionalsContext.Provider, { value: {
            professionals,
            currentProfessional,
            loading,
            error,
            getProfessional,
            updateProfessional,
            createProfessional,
            deleteProfessional,
            setCurrentProfessional
        }, children: children }));
}
export function useProfessionals() {
    const context = useContext(ProfessionalsContext);
    if (!context) {
        throw new Error('useProfessionals must be used within a ProfessionalsProvider');
    }
    return context;
}
