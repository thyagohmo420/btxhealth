import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos de dados
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  sector: string | null;
  active: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  cpf: string | null;
  rg: string | null;
  sus_card: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: any;
  emergency_contact: any;
  priority: string;
  created_at: string;
  updated_at: string;
}

// Funções de autenticação
export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao sair:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }
};

// Funções de pacientes
export const patients = {
  create: async (data: any) => {
    const { data: result, error } = await supabase
      .from('patients')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  search: async (query: string) => {
    const { data, error } = await supabase
      .from('patient_search')
      .select('*')
      .textSearch('search_vector', query);

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('patient_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// Funções de vacinas
export const vaccines = {
  create: async (vaccineData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      console.log('Dados da vacina:', vaccineData);
      console.log('Usuário:', session.user);

      const formattedData = {
        name: vaccineData.name,
        manufacturer: vaccineData.manufacturer,
        batch: vaccineData.batch,
        expiration_date: vaccineData.expiration_date,
        stock: parseInt(vaccineData.stock) || 0,
        min_stock: parseInt(vaccineData.min_stock) || 0,
        unit: vaccineData.unit || 'dose',
        description: vaccineData.description,
        active: true
      };

      console.log('Dados formatados:', formattedData);

      const { data, error } = await supabase
        .from('vaccines')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar vacina:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para registrar vacinas.');
        } else {
          toast.error(`Erro ao criar vacina: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      toast.success('Vacina cadastrada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar vacina:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar vacinas:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar vacinas:', error);
      throw error;
    }
  },

  update: async (id: string, vaccineData: any) => {
    try {
      const formattedData = {
        ...vaccineData,
        stock: parseInt(vaccineData.stock) || 0,
        min_stock: parseInt(vaccineData.min_stock) || 0
      };

      const { data, error } = await supabase
        .from('vaccines')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar vacina:', error);
        throw error;
      }

      toast.success('Vacina atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar vacina:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccines')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar vacina:', error);
        throw error;
      }

      toast.success('Vacina removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar vacina:', error);
      throw error;
    }
  },

  registerApplication: async (data: any) => {
    try {
      const { data: record, error } = await supabase
        .from('vaccine_records')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar aplicação:', error);
        throw error;
      }

      toast.success('Aplicação registrada com sucesso!');
      return record;
    } catch (error) {
      console.error('Erro ao registrar aplicação:', error);
      throw error;
    }
  },

  getApplicationsByPatient: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('vaccine_records')
        .select(`
          *,
          vaccine:vaccine_id (
            name,
            manufacturer
          ),
          professional:professional_id (
            full_name
          )
        `)
        .eq('patient_id', patientId)
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar aplicações:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar aplicações:', error);
      throw error;
    }
  }
};

// Funções de prontuário
export const medicalRecords = {
  create: async (record: any) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar registro médico:', error);
      throw error;
    }
  },

  getByPatient: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          professional:professional_id(full_name)
        `)
        .eq('patient_id', patientId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar registros médicos:', error);
      throw error;
    }
  },

  addAttachment: async (recordId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${recordId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: record, error: updateError } = await supabase
        .from('medical_records')
        .update({
          attachments: supabase.raw('array_append(attachments, ?)', [fileName])
        })
        .eq('id', recordId)
        .select()
        .single();

      if (updateError) throw updateError;
      return record;
    } catch (error) {
      console.error('Erro ao adicionar anexo:', error);
      throw error;
    }
  }
};

// Funções de agendamento
export const appointments = {
  create: async (appointment: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  update: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  },

  getByDate: async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id(full_name),
          professional:professional_id(full_name)
        `)
        .eq('date', date)
        .order('time');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  },

  getByPatient: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professional_id(full_name)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do paciente:', error);
      throw error;
    }
  }
};

// Funções de fila de espera
export const queue = {
  add: async (queueEntry: any) => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .insert([queueEntry])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: string, updates: any = {}) => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .update({ status, ...updates })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status na fila:', error);
      throw error;
    }
  },

  getCurrent: async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          patient:patient_id(full_name)
        `)
        .in('status', ['waiting', 'in_service'])
        .order('priority', { ascending: false })
        .order('arrival_time');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fila atual:', error);
      throw error;
    }
  }
};

// Configuração de realtime
export const realtime = {
  subscribeToQueue: (callback: (payload: any) => void) => {
    return supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue' },
        callback
      )
      .subscribe();
  },

  subscribeToPatient: (patientId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`patient_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medical_records',
          filter: `patient_id=eq.${patientId}`
        },
        callback
      )
      .subscribe();
  }
};

// Função para log de atividades
export const logActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any = {}
) => {
  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      }
    ]);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    // Não lançamos o erro aqui para não interromper o fluxo principal
  }
};

// Funções do painel de chamadas
export const displaySystem = {
  createCall: async (patientId: string, professionalId: string | null, room: string, priority: string = 'normal') => {
    try {
      // Primeiro, vamos buscar o painel de display ativo
      const { data: panels, error: panelError } = await supabase
        .from('display_panels')
        .select('id')
        .eq('status', 'active')
        .limit(1);

      if (panelError) throw panelError;

      let displayPanelId = panels?.[0]?.id;
      if (!displayPanelId) {
        // Se não houver painel, vamos criar um
        const { data: newPanel, error: createError } = await supabase
          .from('display_panels')
          .insert({
            name: 'Painel Principal',
            location: 'Recepção',
            type: 'reception',
            status: 'active'
          })
          .select()
          .single();

        if (createError) throw createError;
        displayPanelId = newPanel.id;
      }

      // Criar a chamada
      const { data: call, error: callError } = await supabase
        .from('display_calls')
        .insert({
          panel_id: displayPanelId,
          patient_id: patientId,
          professional_id: professionalId,
          room,
          priority,
          call_number: new Date().getTime().toString(),
          status: 'waiting'
        })
        .select(`
          *,
          patient:patient_id (
            full_name
          ),
          professional:professional_id (
            full_name
          )
        `)
        .single();

      if (callError) throw callError;
      return call;
    } catch (error) {
      console.error('Erro ao criar chamada:', error);
      throw error;
    }
  },

  updateCallStatus: async (callId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('display_calls')
        .update({ status })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status da chamada:', error);
      throw error;
    }
  }
};

// Funções de relatórios
export const reports = {
  generatePatientReport: async (patientId: string, startDate?: string, endDate?: string) => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          name: 'Relatório do Paciente',
          type: 'patient',
          parameters: { patientId, startDate, endDate }
        })
        .select()
        .single();

      if (reportError) throw reportError;

      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          patient:patient_id (
            full_name,
            cpf,
            sus_card,
            birth_date
          ),
          professional:professional_id (
            full_name
          )
        `)
        .eq('patient_id', patientId)
        .order('record_date', { ascending: false });

      if (recordsError) throw recordsError;

      // Atualizar o relatório com os dados
      const { error: updateError } = await supabase
        .from('reports')
        .update({ file_url: JSON.stringify(records) })
        .eq('id', reportData.id);

      if (updateError) throw updateError;

      return records;
    } catch (error) {
      console.error('Erro ao gerar relatório do paciente:', error);
      toast.error('Erro ao gerar relatório do paciente');
      throw error;
    }
  },

  generateAttendanceReport: async (startDate: string, endDate: string, type?: string) => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          name: 'Relatório de Atendimentos',
          type: 'attendance',
          parameters: { startDate, endDate, type }
        })
        .select()
        .single();

      if (reportError) throw reportError;

      const query = supabase
        .from('medical_records')
        .select(`
          *,
          patient:patient_id (
            full_name
          ),
          professional:professional_id (
            full_name
          )
        `)
        .gte('record_date', startDate)
        .lte('record_date', endDate)
        .order('record_date', { ascending: false });

      if (type) {
        query.eq('record_type', type);
      }

      const { data: records, error: recordsError } = await query;

      if (recordsError) throw recordsError;

      // Atualizar o relatório com os dados
      const { error: updateError } = await supabase
        .from('reports')
        .update({ file_url: JSON.stringify(records) })
        .eq('id', reportData.id);

      if (updateError) throw updateError;

      return records;
    } catch (error) {
      console.error('Erro ao gerar relatório de atendimentos:', error);
      toast.error('Erro ao gerar relatório de atendimentos');
      throw error;
    }
  },

  downloadReport: async (data: any[], filename: string) => {
    try {
      // Converter dados para formato CSV
      const csvContent = convertToCSV(data);
      
      // Criar blob com encoding UTF-8 com BOM para suporte a caracteres especiais
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { 
        type: 'text/csv;charset=utf-8'
      });

      // Criar URL do blob
      const url = URL.createObjectURL(blob);

      // Criar link temporário e forçar download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Download iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error('Erro ao baixar relatório');
      throw error;
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      return { data: null, error };
    }
  },

  async generate(data: any) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return { data: report, error: null };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return { data: null, error };
    }
  },

  async download(id: string) {
    try {
      const { data: report } = await supabase
        .from('reports')
        .select('file_url')
        .eq('id', id)
        .single();

      if (!report?.file_url) throw new Error('URL do arquivo não encontrada');

      const { data, error } = await supabase
        .storage
        .from('reports')
        .download(report.file_url);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      return { data: null, error };
    }
  }
};

// Função auxiliar para converter dados em CSV
function convertToCSV(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Obter cabeçalhos
  const headers = Object.keys(data[0]);

  // Criar linha de cabeçalho
  const headerRow = headers.join(';');

  // Criar linhas de dados
  const rows = data.map(obj => 
    headers.map(header => {
      const value = obj[header];
      // Tratar valores especiais
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      if (typeof value === 'string' && (value.includes(';') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(';')
  );

  // Juntar tudo
  return [headerRow, ...rows].join('\n');
}

// Funções de triagem
export const triage = {
  create: async (triageData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      console.log('Dados da triagem:', triageData);
      console.log('Usuário:', session.user);

      // Garantir que os arrays estejam no formato correto
      const formattedData = {
        patient_id: triageData.patient_id,
        symptoms: Array.isArray(triageData.symptoms) ? triageData.symptoms : [],
        medications: Array.isArray(triageData.medications) ? triageData.medications : [],
        allergies: Array.isArray(triageData.allergies) ? triageData.allergies : [],
        vital_signs: {
          temperature: Number(triageData.vital_signs.temperature),
          blood_pressure: triageData.vital_signs.blood_pressure,
          heart_rate: Number(triageData.vital_signs.heart_rate),
          respiratory_rate: Number(triageData.vital_signs.respiratory_rate),
          oxygen_saturation: Number(triageData.vital_signs.oxygen_saturation)
        },
        priority: triageData.priority,
        notes: triageData.notes || '',
        status: triageData.status || 'completed'
      };

      console.log('Dados formatados:', formattedData);

      const { data, error } = await supabase
        .from('triage')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar triagem:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para registrar triagens.');
        } else if (error.code === '23503') {
          toast.error('Erro de referência: paciente não encontrado');
        } else {
          toast.error(`Erro ao registrar triagem: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Erro completo ao criar triagem:', error);
      throw error;
    }
  },

  getByPatient: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('triage')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar triagens:', error);
      throw error;
    }
  },

  update: async (triageId: string, triageData: any) => {
    try {
      const { data, error } = await supabase
        .from('triage')
        .update({
          ...triageData,
          updated_at: new Date().toISOString()
        })
        .eq('id', triageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar triagem:', error);
      throw error;
    }
  }
};

// Funções de setores
export const sectors = {
  create: async (sectorData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      console.log('Dados do setor:', sectorData);
      console.log('Usuário:', session.user);

      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar setor:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para criar setores.');
        } else {
          toast.error(`Erro ao criar setor: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      toast.success('Setor criado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro completo ao criar setor:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar setores:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      throw error;
    }
  },

  update: async (id: string, sectorData: any) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar setor:', error);
        throw error;
      }

      toast.success('Setor atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar setor:', error);
        throw error;
      }

      toast.success('Setor removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar setor:', error);
      throw error;
    }
  }
};

// Funções de profissionais
export const professionals = {
  create: async (professionalData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('professionals')
        .insert([professionalData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar profissional:', error);
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para criar profissionais.');
        } else {
          toast.error(`Erro ao criar profissional: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      toast.success('Profissional cadastrado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Erro ao buscar profissionais:', error);
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para visualizar profissionais.');
        } else {
          toast.error(`Erro ao buscar profissionais: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw error;
    }
  },

  update: async (id: string, professionalData: any) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .update(professionalData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar profissional:', error);
        throw error;
      }

      toast.success('Profissional atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar profissional:', error);
        throw error;
      }

      toast.success('Profissional removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      throw error;
    }
  }
};

export const pharmacy = {
  create: async (medicationData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        throw new Error('Usuário não autenticado');
      }

      console.log('Dados do medicamento:', medicationData);
      console.log('Usuário:', session.user);

      const formattedData = {
        name: medicationData.name,
        active_ingredient: medicationData.activeIngredient,
        form: medicationData.form,
        concentration: medicationData.concentration,
        manufacturer: medicationData.manufacturer,
        batch: medicationData.batch,
        expiration_date: medicationData.expirationDate,
        stock: parseInt(medicationData.stock) || 0,
        min_stock: parseInt(medicationData.minStock) || 0,
        unit: medicationData.unit || 'unidade',
        controlled: medicationData.controlled || false,
        storage_location: medicationData.storageLocation,
        temperature_control: medicationData.temperatureControl,
        description: medicationData.description,
        active: true
      };

      const { data, error } = await supabase
        .from('pharmacy')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar medicamento:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('Erro de permissão: Você não tem autorização para registrar medicamentos.');
        } else {
          toast.error(`Erro ao criar medicamento: ${error.message || 'Erro desconhecido'}`);
        }
        throw error;
      }

      toast.success('Medicamento cadastrado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar medicamento:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar medicamentos:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      throw error;
    }
  },

  dispense: async (data: any) => {
    try {
      const { data: dispensing, error } = await supabase
        .from('medication_dispensing')
        .insert([{
          medication_id: data.medicationId,
          patient_id: data.patientId,
          professional_id: data.professionalId,
          quantity: data.quantity,
          prescription_id: data.prescriptionId,
          notes: data.notes
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao dispensar medicamento:', error);
        throw error;
      }

      toast.success('Medicamento dispensado com sucesso!');
      return dispensing;
    } catch (error) {
      console.error('Erro ao dispensar medicamento:', error);
      throw error;
    }
  }
};

export const calls = {
  create: async (data: any) => {
    try {
      const { data: call, error } = await supabase
        .from('calls')
        .insert([{
          patient_id: data.patientId,
          sector_id: data.sectorId,
          professional_id: data.professionalId,
          triage_id: data.triageId,
          status: data.status || 'waiting',
          priority: data.priority || 'normal',
          display_name: data.displayName,
          room_number: data.roomNumber
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar chamada:', error);
        throw error;
      }

      return call;
    } catch (error) {
      console.error('Erro ao criar chamada:', error);
      throw error;
    }
  },

  getActive: async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          patient:patient_id (
            full_name,
            registration_number
          ),
          sector:sector_id (
            name
          ),
          professional:professional_id (
            full_name
          )
        `)
        .in('status', ['waiting', 'called'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar chamadas:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar chamadas:', error);
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      const { data: call, error } = await supabase
        .from('calls')
        .update({
          status: data.status,
          called_at: data.status === 'called' ? new Date().toISOString() : null,
          room_number: data.roomNumber
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar chamada:', error);
        throw error;
      }

      return call;
    } catch (error) {
      console.error('Erro ao atualizar chamada:', error);
      throw error;
    }
  }
}; 