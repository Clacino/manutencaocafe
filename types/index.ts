export interface User {
  id: string;
  name: string;
  email: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Client {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  contact: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Equipment {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  millNumber: string;
  machineNumber: string;
}

export interface Visit {
  id: string;
  clientId: string;
  client: Client;
  equipment: Equipment;
  type: 'preventive' | 'corrective_technical' | 'corrective_operational';
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  technicianId: string;
}

export interface ServiceOrder {
  id: string;
  technicianId: string;
  clientId: string;
  client: Client;
  equipment: Equipment;
  visitType: 'preventive' | 'corrective_technical' | 'corrective_operational';
  date: string;
  arrivalTime: string;
  departureTime: string;
  responsibleName: string;
  reportedProblems: string;
  serviceExecuted: string;
  replacedParts: Array<{
    quantity: number;
    description: string;
  }>;
  generalObservations: string;
  statistics: {
    waterPressure: number;
    boilerPressure: number;
    doseCounter: number;
    filterElement: {
      changeDate: string;
      nextChangeDate: string;
    };
    coffeeType: string;
  };
  machinePhoto?: string;
  technicianSignature?: string;
  clientSignature?: string;
  status: 'draft' | 'completed' | 'synced';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  averageVisitDuration: number;
}