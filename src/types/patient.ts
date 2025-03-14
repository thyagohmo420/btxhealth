export interface Patient {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  susCard: string;
  birthDate: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  priority?: 'normal' | 'preferential';
  status: 'waiting' | 'in-service' | 'completed';
  createdAt: string;
  updatedAt: string;
}