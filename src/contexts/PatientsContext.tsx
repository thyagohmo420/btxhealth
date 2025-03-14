import React, { createContext, useContext, useState, useEffect } from 'react';

interface VitalSigns {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  saturation: string;
  lastUpdate?: string;
  registeredBy?: string;
  isAutomatic?: boolean;
  isCritical?: boolean;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Exam {
  name: string;
  type: 'laboratory' | 'image';
  instructions?: string;
}

interface MedicalRecord {
  date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: Prescription[];
  exams: Exam[];
  doctor?: string;
}

interface BedAssignment {
  bedId: string;
  startDate: string;
  endDate?: string;
}

interface NursingRecord {
  id: string;
  date: string;
  registeredBy: string;
  type: 'admission' | 'evolution' | 'discharge' | 'procedure' | 'medication';
  description: string;
  vitalSigns?: VitalSigns;
}

interface NursingHistory {
  bedAssignments: BedAssignment[];
  vitalSignsHistory: VitalSigns[];
  nursingRecords: NursingRecord[];
}

interface Patient {
  id: string;
  name: string;
  cpf: string;
  susCard?: string;
  phone?: string;
  ticketNumber: string;
  arrivalTime: string;
  serviceStartTime?: string;
  symptoms?: string;
  vitalSigns?: VitalSigns;
  priority?: 'urgent' | 'priority' | 'normal';
  status: 'waiting' | 'in_triage' | 'in_service' | 'in_nursing' | 'completed';
  lastUpdate: string;
  medicalRecord?: MedicalRecord;
  nursingHistory?: NursingHistory;
}

interface PatientsContextData {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'arrivalTime' | 'status' | 'lastUpdate'>) => void;
  updatePatient: (patientId: string, data: Partial<Patient>) => void;
  currentTicketNumber: number;
  updateVitalSigns: (patientId: string, vitalSigns: VitalSigns) => void;
  assignBed: (patientId: string, bedId: string) => void;
  dischargeBed: (bedId: string) => void;
  addNursingRecord: (patientId: string, record: Omit<NursingRecord, 'id' | 'date'>) => void;
}

const PatientsContext = createContext<PatientsContextData>({
  patients: [],
  addPatient: () => {},
  updatePatient: () => {},
  currentTicketNumber: 1,
  updateVitalSigns: () => {},
  assignBed: () => {},
  dischargeBed: () => {},
  addNursingRecord: () => {}
});

const STORAGE_KEY_PATIENTS = '@HospitalJuquitiba:patients';
const STORAGE_KEY_TICKET = '@HospitalJuquitiba:ticketNumber';

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const savedPatients = localStorage.getItem(STORAGE_KEY_PATIENTS);
    if (!savedPatients) return [];

    try {
      const parsedPatients = JSON.parse(savedPatients);
      return parsedPatients.map((patient: any) => ({
        ...patient,
        priority: patient.priority || 'normal',
        status: patient.status || 'waiting'
      }));
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      return [];
    }
  });

  const [currentTicketNumber, setCurrentTicketNumber] = useState(() => {
    const savedTicketNumber = localStorage.getItem(STORAGE_KEY_TICKET);
    return savedTicketNumber ? parseInt(savedTicketNumber) : 1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TICKET, currentTicketNumber.toString());
  }, [currentTicketNumber]);

  const addPatient = (patientData: Omit<Patient, 'id' | 'arrivalTime' | 'status' | 'lastUpdate'>) => {
    const now = new Date();
    const newPatient: Patient = {
      ...patientData,
      id: crypto.randomUUID(),
      ticketNumber: currentTicketNumber.toString().padStart(3, '0'),
      arrivalTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'waiting',
      lastUpdate: now.toISOString(),
      priority: 'normal'
    };

    setPatients(prevPatients => [...prevPatients, newPatient]);
    setCurrentTicketNumber(prev => prev + 1);
  };

  const updatePatient = (patientId: string, data: Partial<Patient>) => {
    setPatients(prevPatients =>
      prevPatients.map(patient => {
        if (patient.id === patientId) {
          let newStatus = patient.status;

          if (data.status === 'in_triage') {
            newStatus = 'in_triage';
          } else if (data.vitalSigns && data.symptoms) {
            newStatus = 'in_service';
          } else if (data.status === 'in_nursing') {
            newStatus = 'in_nursing';
          } else if (data.status === 'completed') {
            newStatus = 'completed';
          }

          return {
            ...patient,
            ...data,
            status: data.status || newStatus,
            lastUpdate: new Date().toISOString()
          };
        }
        return patient;
      })
    );
  };

  const updateVitalSigns = (patientId: string, vitalSigns: VitalSigns) => {
    setPatients(prevPatients =>
      prevPatients.map(patient => {
        if (patient.id === patientId) {
          const nursingHistory = patient.nursingHistory || {
            bedAssignments: [],
            vitalSignsHistory: [],
            nursingRecords: []
          };

          return {
            ...patient,
            vitalSigns,
            lastUpdate: new Date().toISOString(),
            nursingHistory: {
              ...nursingHistory,
              vitalSignsHistory: [...nursingHistory.vitalSignsHistory, vitalSigns]
            }
          };
        }
        return patient;
      })
    );
  };

  const assignBed = (patientId: string, bedId: string) => {
    setPatients(prevPatients =>
      prevPatients.map(patient => {
        if (patient.id === patientId) {
          const nursingHistory = patient.nursingHistory || {
            bedAssignments: [],
            vitalSignsHistory: [],
            nursingRecords: []
          };

          return {
            ...patient,
            status: 'in_nursing',
            lastUpdate: new Date().toISOString(),
            nursingHistory: {
              ...nursingHistory,
              bedAssignments: [
                ...nursingHistory.bedAssignments,
                {
                  bedId,
                  startDate: new Date().toISOString()
                }
              ]
            }
          };
        }
        return patient;
      })
    );
  };

  const dischargeBed = (bedId: string) => {
    setPatients(prevPatients =>
      prevPatients.map(patient => {
        const currentBedAssignment = patient.nursingHistory?.bedAssignments
          .find(a => a.bedId === bedId && !a.endDate);

        if (currentBedAssignment) {
          const nursingHistory = patient.nursingHistory || {
            bedAssignments: [],
            vitalSignsHistory: [],
            nursingRecords: []
          };

          return {
            ...patient,
            status: 'completed',
            lastUpdate: new Date().toISOString(),
            nursingHistory: {
              ...nursingHistory,
              bedAssignments: nursingHistory.bedAssignments.map(assignment =>
                assignment === currentBedAssignment
                  ? { ...assignment, endDate: new Date().toISOString() }
                  : assignment
              )
            }
          };
        }
        return patient;
      })
    );
  };

  const addNursingRecord = (patientId: string, record: Omit<NursingRecord, 'id' | 'date'>) => {
    setPatients(prevPatients =>
      prevPatients.map(patient => {
        if (patient.id === patientId) {
          const nursingHistory = patient.nursingHistory || {
            bedAssignments: [],
            vitalSignsHistory: [],
            nursingRecords: []
          };

          const newRecord: NursingRecord = {
            ...record,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
          };

          return {
            ...patient,
            lastUpdate: new Date().toISOString(),
            nursingHistory: {
              ...nursingHistory,
              nursingRecords: [...nursingHistory.nursingRecords, newRecord]
            }
          };
        }
        return patient;
      })
    );
  };

  return (
    <PatientsContext.Provider
      value={{
        patients,
        addPatient,
        updatePatient,
        currentTicketNumber,
        updateVitalSigns,
        assignBed,
        dischargeBed,
        addNursingRecord
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export const usePatients = () => {
  const context = useContext(PatientsContext);

  if (!context) {
    throw new Error('usePatients must be used within a PatientsProvider');
  }

  return context;
}; 