import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export interface TechnicianLocation {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'busy' | 'offline';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdate: string;
  };
  currentVisit?: {
    clientName: string;
    clientAddress: string;
    startTime: string;
    estimatedEnd: string;
    visitType: 'preventive' | 'corrective_technical' | 'corrective_operational';
  };
  todayStats: {
    completed: number;
    pending: number;
    distance: number;
  };
}

export function useRealTimeTracking() {
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
    initializeTechnicians();
    
    // Atualizar localizações a cada 30 segundos
    const interval = setInterval(() => {
      updateTechnicianLocations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadTechnicians = async () => {
    try {
      const storedTechnicians = await AsyncStorage.getItem('@technicians');
      if (storedTechnicians) {
        setTechnicians(JSON.parse(storedTechnicians));
      } else {
        // Inicializar com técnicos padrão se não houver dados
        await initializeTechnicians();
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeTechnicians = async () => {
    try {
      const defaultTechnicians: TechnicianLocation[] = [
        {
          id: '1',
          name: 'Klaus Silva',
          email: 'klaus@coffee.com',
          phone: '(27) 99999-1111',
          status: 'active',
          location: {
            latitude: -20.3155,
            longitude: -40.3128,
            address: 'Av. Jerônimo Monteiro, 321 - Centro, Vitória - ES',
            lastUpdate: new Date().toISOString()
          },
          currentVisit: {
            clientName: 'Café do Porto',
            clientAddress: 'Av. Jerônimo Monteiro, 321',
            startTime: '14:30',
            estimatedEnd: '16:00',
            visitType: 'preventive'
          },
          todayStats: {
            completed: 4,
            pending: 2,
            distance: 45.2
          }
        },
        {
          id: '2',
          name: 'João Santos',
          email: 'joao@coffee.com',
          phone: '(27) 99999-2222',
          status: 'busy',
          location: {
            latitude: -20.2976,
            longitude: -40.2925,
            address: 'Av. Carlos Gomes, 200 - Praia do Canto, Vitória - ES',
            lastUpdate: new Date().toISOString()
          },
          currentVisit: {
            clientName: 'Padaria Vitória',
            clientAddress: 'Av. Carlos Gomes, 200',
            startTime: '15:15',
            estimatedEnd: '16:30',
            visitType: 'corrective_technical'
          },
          todayStats: {
            completed: 3,
            pending: 3,
            distance: 38.7
          }
        },
        {
          id: '3',
          name: 'Edison Lima',
          email: 'edison@coffee.com',
          phone: '(27) 99999-3333',
          status: 'active',
          location: {
            latitude: -20.3297,
            longitude: -40.2925,
            address: 'Rua Henrique Moscoso, 147 - Centro, Vila Velha - ES',
            lastUpdate: new Date().toISOString()
          },
          todayStats: {
            completed: 5,
            pending: 1,
            distance: 52.1
          }
        }
      ];

      setTechnicians(defaultTechnicians);
      await AsyncStorage.setItem('@technicians', JSON.stringify(defaultTechnicians));
    } catch (error) {
      console.error('Error initializing technicians:', error);
    }
  };

  const updateTechnicianLocations = async () => {
    try {
      // Simular atualizações de localização em tempo real
      setTechnicians(prev => prev.map(tech => ({
        ...tech,
        location: {
          ...tech.location,
          lastUpdate: new Date().toISOString()
        }
      })));
    } catch (error) {
      console.error('Error updating technician locations:', error);
    }
  };

  const updateTechnicianLocation = async (
    technicianId: string, 
    location: { latitude: number; longitude: number; address: string }
  ) => {
    try {
      const updatedTechnicians = technicians.map(tech =>
        tech.id === technicianId
          ? {
              ...tech,
              location: {
                ...location,
                lastUpdate: new Date().toISOString()
              }
            }
          : tech
      );
      
      setTechnicians(updatedTechnicians);
      await AsyncStorage.setItem('@technicians', JSON.stringify(updatedTechnicians));
    } catch (error) {
      console.error('Error updating technician location:', error);
    }
  };

  const updateTechnicianStatus = async (technicianId: string, status: TechnicianLocation['status']) => {
    try {
      const updatedTechnicians = technicians.map(tech =>
        tech.id === technicianId ? { ...tech, status } : tech
      );
      
      setTechnicians(updatedTechnicians);
      await AsyncStorage.setItem('@technicians', JSON.stringify(updatedTechnicians));
    } catch (error) {
      console.error('Error updating technician status:', error);
    }
  };

  const addTechnician = async (technician: Omit<TechnicianLocation, 'id' | 'todayStats'>) => {
    try {
      const newTechnician: TechnicianLocation = {
        ...technician,
        id: Date.now().toString(),
        todayStats: {
          completed: 0,
          pending: 0,
          distance: 0
        }
      };

      const updatedTechnicians = [...technicians, newTechnician];
      setTechnicians(updatedTechnicians);
      await AsyncStorage.setItem('@technicians', JSON.stringify(updatedTechnicians));
      
      return newTechnician;
    } catch (error) {
      console.error('Error adding technician:', error);
      return null;
    }
  };

  const getCurrentUserLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const address = result[0];
        return `${address.street || ''} ${address.streetNumber || ''}, ${address.district || ''}, ${address.city || ''} - ${address.region || ''}`.trim();
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  return {
    technicians,
    loading,
    updateTechnicianLocation,
    updateTechnicianStatus,
    addTechnician,
    getCurrentUserLocation,
    reverseGeocode,
    refreshTechnicians: loadTechnicians
  };
}