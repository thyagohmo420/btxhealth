import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from './supabase';
import { toast } from 'sonner';

interface BTxHealthDB extends DBSchema {
  patients: {
    key: string;
    value: {
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
      sync_status: 'synced' | 'pending' | 'error';
    };
    indexes: { 'by-cpf': string, 'by-sus': string, 'by-sync': string };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'insert' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retries: number;
    };
  };
}

let db: IDBPDatabase<BTxHealthDB>;

export async function initDB() {
  try {
    db = await openDB<BTxHealthDB>('btx-health', 1, {
      upgrade(db) {
        // Patients store
        const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
        patientStore.createIndex('by-cpf', 'cpf');
        patientStore.createIndex('by-sus', 'sus_card');
        patientStore.createIndex('by-sync', 'sync_status');

        // Sync queue store
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    });

    // Start sync process
    startSync();
    return true;
  } catch (error) {
    console.error('Error initializing IndexedDB:', error);
    toast.error('Erro ao inicializar banco de dados local');
    return false;
  }
}

export async function addPatient(patient: any) {
  try {
    const timestamp = new Date().toISOString();
    const patientData = {
      ...patient,
      created_at: timestamp,
      updated_at: timestamp,
      sync_status: 'pending'
    };

    await db.add('patients', patientData);

    // Add to sync queue
    await db.add('sync_queue', {
      id: crypto.randomUUID(),
      table: 'patients',
      operation: 'insert',
      data: patientData,
      timestamp: Date.now(),
      retries: 0
    });

    toast.success('Paciente cadastrado com sucesso');
    triggerSync();
    return patientData;
  } catch (error) {
    console.error('Error adding patient:', error);
    toast.error('Erro ao cadastrar paciente');
    throw error;
  }
}

export async function updatePatient(id: string, updates: any) {
  try {
    const patient = await db.get('patients', id);
    if (!patient) throw new Error('Patient not found');

    const updatedPatient = {
      ...patient,
      ...updates,
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };

    await db.put('patients', updatedPatient);

    // Add to sync queue
    await db.add('sync_queue', {
      id: crypto.randomUUID(),
      table: 'patients',
      operation: 'update',
      data: updatedPatient,
      timestamp: Date.now(),
      retries: 0
    });

    toast.success('Paciente atualizado com sucesso');
    triggerSync();
    return updatedPatient;
  } catch (error) {
    console.error('Error updating patient:', error);
    toast.error('Erro ao atualizar paciente');
    throw error;
  }
}

export async function getPatients() {
  try {
    return await db.getAll('patients');
  } catch (error) {
    console.error('Error getting patients:', error);
    toast.error('Erro ao carregar pacientes');
    return [];
  }
}

let syncInProgress = false;
let syncTimeout: NodeJS.Timeout | null = null;

async function startSync() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const pendingPatients = await db.getAllFromIndex('patients', 'by-sync', 'pending');
    const queue = await db.getAll('sync_queue');

    if (navigator.onLine && (pendingPatients.length > 0 || queue.length > 0)) {
      for (const item of queue) {
        try {
          if (item.operation === 'insert') {
            const { error } = await supabase
              .from(item.table)
              .insert([item.data]);

            if (error) throw error;

            // Update local status
            const patient = await db.get('patients', item.data.id);
            if (patient) {
              await db.put('patients', { ...patient, sync_status: 'synced' });
            }

            // Remove from queue
            await db.delete('sync_queue', item.id);
          } else if (item.operation === 'update') {
            const { error } = await supabase
              .from(item.table)
              .update(item.data)
              .eq('id', item.data.id);

            if (error) throw error;

            // Update local status
            const patient = await db.get('patients', item.data.id);
            if (patient) {
              await db.put('patients', { ...patient, sync_status: 'synced' });
            }

            // Remove from queue
            await db.delete('sync_queue', item.id);
          }
        } catch (error) {
          console.error('Sync error:', error);
          item.retries++;
          if (item.retries < 3) {
            await db.put('sync_queue', item);
          } else {
            // Move to error state after 3 retries
            const patient = await db.get('patients', item.data.id);
            if (patient) {
              await db.put('patients', { ...patient, sync_status: 'error' });
            }
            await db.delete('sync_queue', item.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Sync process error:', error);
  } finally {
    syncInProgress = false;
    // Schedule next sync
    syncTimeout = setTimeout(startSync, 60000); // 1 minute
  }
}

function triggerSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  startSync();
}

// Listen for online/offline events
window.addEventListener('online', () => {
  toast.success('Conexão restabelecida');
  triggerSync();
});

window.addEventListener('offline', () => {
  toast.error('Sem conexão com a internet');
});

// Initialize the database
initDB().catch(console.error);