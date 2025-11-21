import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Visit, Client, Equipment } from '@/types';

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const storedVisits = await AsyncStorage.getItem('@visits');
      if (storedVisits) {
        setVisits(JSON.parse(storedVisits));
      } else {
        // Inicializar com visitas de exemplo para os técnicos
        const defaultVisits = generateDefaultVisits();
        setVisits(defaultVisits);
        await AsyncStorage.setItem('@visits', JSON.stringify(defaultVisits));
      }
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId: string, status: Visit['status']) => {
    try {
      const updatedVisits = visits.map(visit =>
        visit.id === visitId ? { ...visit, status } : visit
      );
      setVisits(updatedVisits);
      await AsyncStorage.setItem('@visits', JSON.stringify(updatedVisits));
      
      // Notificar admin sobre mudança de status
      await notifyStatusChange(visitId, status);
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const addVisit = async (visit: Visit) => {
    try {
      const updatedVisits = [...visits, visit];
      setVisits(updatedVisits);
      await AsyncStorage.setItem('@visits', JSON.stringify(updatedVisits));
    } catch (error) {
      console.error('Error adding visit:', error);
    }
  };

  const generateNextVisits = async () => {
    try {
      // Gerar próximas visitas automaticamente
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      
      const existingVisits = await AsyncStorage.getItem('@visits');
      const currentVisits = existingVisits ? JSON.parse(existingVisits) : [];
      
      // Verificar se já existem visitas para os próximos dias
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dayAfterStr = dayAfter.toISOString().split('T')[0];
      
      const hasTomorrowVisits = currentVisits.some(v => v.scheduledDate === tomorrowStr);
      const hasDayAfterVisits = currentVisits.some(v => v.scheduledDate === dayAfterStr);
      
      const newVisits = [];
      
      if (!hasTomorrowVisits) {
        // Adicionar visitas para amanhã
        newVisits.push({
          id: `auto_${Date.now()}_1`,
          clientId: '5',
          client: {
            id: '5',
            name: 'Café Jardim Camburi',
            address: 'Av. Dante Michelini, 2500',
            neighborhood: 'Jardim Camburi',
            city: 'Vitória',
            contact: '(27) 3317-9012',
            location: { latitude: -20.2539, longitude: -40.2788 }
          },
          equipment: {
            id: '5',
            clientId: '5',
            brand: 'Saeco',
            model: 'Aulika Focus',
            millNumber: 'ML005-VT',
            machineNumber: 'MC005-VT'
          },
          type: 'preventive',
          scheduledDate: tomorrowStr,
          scheduledTime: '09:00',
          status: 'pending',
          technicianId: '1'
        });
      }
      
      if (!hasDayAfterVisits) {
        // Adicionar visitas para depois de amanhã
        newVisits.push({
          id: `auto_${Date.now()}_2`,
          clientId: '6',
          client: {
            id: '6',
            name: 'Restaurante Itaparica',
            address: 'Rua Aleixo Netto, 432',
            neighborhood: 'Itaparica',
            city: 'Vila Velha',
            contact: '(27) 3389-3456',
            location: { latitude: -20.3445, longitude: -40.2923 }
          },
          equipment: {
            id: '6',
            clientId: '6',
            brand: 'Necta',
            model: 'Koro Max Prime',
            millNumber: 'ML006-VV',
            machineNumber: 'MC006-VV'
          },
          type: 'corrective_technical',
          scheduledDate: dayAfterStr,
          scheduledTime: '14:00',
          status: 'pending',
          technicianId: '1'
        });
      }
      
      if (newVisits.length > 0) {
        const updatedVisits = [...currentVisits, ...newVisits];
        setVisits(updatedVisits);
        await AsyncStorage.setItem('@visits', JSON.stringify(updatedVisits));
      }
    } catch (error) {
      console.error('Error generating next visits:', error);
    }
  };
  const generateDefaultVisits = (): Visit[] => {
    const esClients = [
      {
        id: '1',
        name: 'Café do Porto',
        address: 'Av. Jerônimo Monteiro, 321',
        neighborhood: 'Centro',
        city: 'Vitória',
        contact: '(27) 3223-4567',
        location: { latitude: -20.3155, longitude: -40.3128 }
      },
      {
        id: '2',
        name: 'Padaria Vitória',
        address: 'Rua Sete de Setembro, 145',
        neighborhood: 'Centro',
        city: 'Vitória',
        contact: '(27) 3324-8901',
        location: { latitude: -20.3189, longitude: -40.3378 }
      },
      {
        id: '3',
        name: 'Café da Praia',
        address: 'Av. Champagnat, 501',
        neighborhood: 'Praia da Costa',
        city: 'Vila Velha',
        contact: '(27) 3329-1234',
        location: { latitude: -20.3234, longitude: -40.2876 }
      },
      {
        id: '4',
        name: 'Lanchonete Serra Verde',
        address: 'Av. Central, 789',
        neighborhood: 'Laranjeiras',
        city: 'Serra',
        contact: '(27) 3338-5678',
        location: { latitude: -20.1689, longitude: -40.2634 }
      }
    ];

    const esEquipments = [
      {
        id: '1',
        clientId: '1',
        brand: 'Saeco',
        model: 'Aulika Top HSC',
        millNumber: 'ML001-VT',
        machineNumber: 'MC001-VT'
      },
      {
        id: '2',
        clientId: '2',
        brand: 'Jura',
        model: 'X8 Professional',
        millNumber: 'ML002-VT',
        machineNumber: 'MC002-VT'
      },
      {
        id: '3',
        clientId: '3',
        brand: 'Delonghi',
        model: 'Prima Donna Elite',
        millNumber: 'ML003-VV',
        machineNumber: 'MC003-VV'
      },
      {
        id: '4',
        clientId: '4',
        brand: 'Franke',
        model: 'A600 FM',
        millNumber: 'ML004-SR',
        machineNumber: 'MC004-SR'
      }
    ];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return [
      {
        id: '1',
        clientId: '1',
        client: esClients[0],
        equipment: esEquipments[0],
        type: 'preventive',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '08:30',
        status: 'pending',
        technicianId: '1'
      },
      {
        id: '2',
        clientId: '2',
        client: esClients[1],
        equipment: esEquipments[1],
        type: 'corrective_technical',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '10:00',
        status: 'pending',
        technicianId: '2'
      },
      {
        id: '3',
        clientId: '3',
        client: esClients[2],
        equipment: esEquipments[2],
        type: 'preventive',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '14:30',
        status: 'pending',
        technicianId: '3'
      },
      {
        id: '4',
        clientId: '4',
        client: esClients[3],
        equipment: esEquipments[3],
        type: 'corrective_operational',
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '09:00',
        status: 'pending',
        technicianId: '1'
      }
    ];
  };

  const notifyStatusChange = async (visitId: string, status: Visit['status']) => {
    try {
      const visit = visits.find(v => v.id === visitId);
      if (!visit) return;

      const adminNotifications = await AsyncStorage.getItem('@admin_notifications');
      const notifications = adminNotifications ? JSON.parse(adminNotifications) : [];
      
      const statusMessages = {
        'in_progress': 'iniciou',
        'completed': 'concluiu',
        'cancelled': 'cancelou'
      };

      if (statusMessages[status]) {
        const newNotification = {
          id: Date.now().toString(),
          type: 'status_change',
          title: 'Status da Visita Atualizado',
          message: `Técnico ${statusMessages[status]} visita em ${visit.client.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          data: { visitId, status }
        };
        
        notifications.push(newNotification);
        await AsyncStorage.setItem('@admin_notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error notifying status change:', error);
    }
  };

  return { 
    visits, 
    loading, 
    updateVisitStatus, 
    loadVisits, 
    addVisit,
    generateNextVisits
  };
}