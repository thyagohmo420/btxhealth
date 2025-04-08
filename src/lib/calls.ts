import { supabase } from './supabase';

interface Call {
  id: string;
  patient_name: string;
  status: 'waiting' | 'called' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  room?: string;
}

interface CreateCallData {
  patient_name: string;
  status: 'waiting';
  priority: 'low' | 'medium' | 'high';
}

export const calls = {
  async getAll(): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(call: CreateCallData): Promise<Call> {
    const { data, error } = await supabase
      .from('calls')
      .insert([call])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: string, call: Partial<Call>): Promise<Call> {
    const { data, error } = await supabase
      .from('calls')
      .update(call)
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
      .from('calls')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getWaiting(): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async callNext(room: string): Promise<Call | null> {
    const { data: waitingCalls, error: waitingError } = await supabase
      .from('calls')
      .select('*')
      .eq('status', 'waiting')
      .order('priority', { ascending: false })
      .order('created_at')
      .limit(1);

    if (waitingError) {
      throw new Error(waitingError.message);
    }

    if (!waitingCalls || waitingCalls.length === 0) {
      return null;
    }

    const nextCall = waitingCalls[0];
    const { data: updatedCall, error: updateError } = await supabase
      .from('calls')
      .update({ status: 'called', room, updated_at: new Date().toISOString() })
      .eq('id', nextCall.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return updatedCall;
  },

  async getActive(): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .in('status', ['waiting', 'called'])
      .order('created_at');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}; 