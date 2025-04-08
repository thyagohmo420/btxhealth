import { supabase } from './supabase';

interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  data: any[];
}

interface CreateReportData {
  title: string;
  description: string;
  date: string;
  type: string;
  status: string;
  user_id: string;
}

export const reports = {
  async getAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(report: CreateReportData): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: string, report: Partial<CreateReportData>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async generatePatientReport(patientId: string, startDate: string, endDate: string): Promise<Report> {
    const { data, error } = await supabase.rpc('generate_patient_report', {
      patient_id: patientId,
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async generateAttendanceReport(startDate: string, endDate: string, recordType?: string): Promise<Report> {
    const { data, error } = await supabase.rpc('generate_attendance_report', {
      start_date: startDate,
      end_date: endDate,
      record_type: recordType
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const { data, error } = await supabase
      .from('reports')
      .select('file_url')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.file_url) {
      throw new Error('URL do arquivo não encontrada');
    }

    const response = await fetch(data.file_url);
    if (!response.ok) {
      throw new Error('Erro ao baixar o arquivo');
    }

    return response.blob();
  }
}; 