import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@/types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const storedClients = await AsyncStorage.getItem('@clients');
      
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        // Initialize with default coffee extraction clients
        const defaultClients = getDefaultClients();
        await AsyncStorage.setItem('@clients', JSON.stringify(defaultClients));
        setClients(defaultClients);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (client: Client) => {
    try {
      const newClient = {
        ...client,
        id: Date.now().toString(),
      };
      
      const updatedClients = [...clients, newClient];
      await AsyncStorage.setItem('@clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error adding client:', error);
      return false;
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      const updatedClients = clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      );
      
      await AsyncStorage.setItem('@clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      return false;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const updatedClients = clients.filter(client => client.id !== clientId);
      await AsyncStorage.setItem('@clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  };

  const getDefaultClients = (): Client[] => {
    return [
      {
        id: '1',
        name: 'EXTRAÇÃO DE CAFÉS LTDA',
        address: 'RUA JOSÉ PAULINO, 1028',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3232-2982',
        location: { latitude: -22.9071, longitude: -47.0573 }
      },
      {
        id: '2',
        name: 'CAFÉ PACAEMBU LTDA',
        address: 'RUA BARÃO DE JAGUARA, 707',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3232-9971',
        location: { latitude: -22.9025, longitude: -47.0547 }
      },
      {
        id: '3',
        name: 'CAFÉS FINOS LTDA',
        address: 'RUA CORONEL QUIRINO, 1020',
        neighborhood: 'CAMBUÍ',
        city: 'CAMPINAS',
        contact: '(19) 3252-5020',
        location: { latitude: -22.8936, longitude: -47.0524 }
      },
      {
        id: '4',
        name: 'CAFÉ BRASIL LTDA',
        address: 'AV. FRANCISCO GLICÉRIO, 1270',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3232-1234',
        location: { latitude: -22.9033, longitude: -47.0553 }
      },
      {
        id: '5',
        name: 'CAFÉ JAGUARI LTDA',
        address: 'RUA GENERAL OSÓRIO, 1020',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3233-4567',
        location: { latitude: -22.9029, longitude: -47.0561 }
      },
      {
        id: '6',
        name: 'CAFÉ ANHANGUERA LTDA',
        address: 'AV. MORAES SALES, 1800',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3234-5678',
        location: { latitude: -22.9012, longitude: -47.0583 }
      },
      {
        id: '7',
        name: 'CAFÉ BARÃO LTDA',
        address: 'RUA BARÃO DE JAGUARA, 1200',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3235-6789',
        location: { latitude: -22.9025, longitude: -47.0547 }
      },
      {
        id: '8',
        name: 'CAFÉ BANDEIRANTES LTDA',
        address: 'AV. BRASIL, 1500',
        neighborhood: 'GUANABARA',
        city: 'CAMPINAS',
        contact: '(19) 3236-7890',
        location: { latitude: -22.9098, longitude: -47.0631 }
      },
      {
        id: '9',
        name: 'CAFÉ TAQUARAL LTDA',
        address: 'AV. NORTE SUL, 1000',
        neighborhood: 'TAQUARAL',
        city: 'CAMPINAS',
        contact: '(19) 3237-8901',
        location: { latitude: -22.8867, longitude: -47.0506 }
      },
      {
        id: '10',
        name: 'CAFÉ FLAMBOYANT LTDA',
        address: 'RUA CONCEIÇÃO, 233',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3238-9012',
        location: { latitude: -22.9033, longitude: -47.0553 }
      },
      {
        id: '11',
        name: 'CAFÉ CASTELO LTDA',
        address: 'AV. JOHN BOYD DUNLOP, 500',
        neighborhood: 'CASTELO',
        city: 'CAMPINAS',
        contact: '(19) 3239-0123',
        location: { latitude: -22.9336, longitude: -47.1075 }
      },
      {
        id: '12',
        name: 'CAFÉ PRIMAVERA LTDA',
        address: 'RUA MARIA MONTEIRO, 1000',
        neighborhood: 'CAMBUÍ',
        city: 'CAMPINAS',
        contact: '(19) 3240-1234',
        location: { latitude: -22.8936, longitude: -47.0524 }
      },
      {
        id: '13',
        name: 'CAFÉ NOVA CAMPINAS LTDA',
        address: 'AV. JOSÉ DE SOUZA CAMPOS, 1200',
        neighborhood: 'NOVA CAMPINAS',
        city: 'CAMPINAS',
        contact: '(19) 3241-2345',
        location: { latitude: -22.8936, longitude: -47.0524 }
      },
      {
        id: '14',
        name: 'CAFÉ CAMBUÍ LTDA',
        address: 'RUA CORONEL QUIRINO, 1500',
        neighborhood: 'CAMBUÍ',
        city: 'CAMPINAS',
        contact: '(19) 3242-3456',
        location: { latitude: -22.8936, longitude: -47.0524 }
      },
      {
        id: '15',
        name: 'CAFÉ BOSQUE LTDA',
        address: 'AV. DAS AMOREIRAS, 2000',
        neighborhood: 'JARDIM DO LAGO',
        city: 'CAMPINAS',
        contact: '(19) 3243-4567',
        location: { latitude: -22.9336, longitude: -47.1075 }
      },
      {
        id: '16',
        name: 'CAFÉ SHOPPING LTDA',
        address: 'AV. IGUATEMI, 777',
        neighborhood: 'VILA BRANDINA',
        city: 'CAMPINAS',
        contact: '(19) 3244-5678',
        location: { latitude: -22.8670, longitude: -47.0444 }
      },
      {
        id: '17',
        name: 'CAFÉ DOM PEDRO LTDA',
        address: 'ROD. DOM PEDRO I, KM 137',
        neighborhood: 'JARDIM SANTA GENEBRA',
        city: 'CAMPINAS',
        contact: '(19) 3245-6789',
        location: { latitude: -22.8489, longitude: -47.0494 }
      },
      {
        id: '18',
        name: 'CAFÉ UNICAMP LTDA',
        address: 'RUA ALBERT EINSTEIN, 400',
        neighborhood: 'CIDADE UNIVERSITÁRIA',
        city: 'CAMPINAS',
        contact: '(19) 3246-7890',
        location: { latitude: -22.8184, longitude: -47.0647 }
      },
      {
        id: '19',
        name: 'CAFÉ PUCCAMP LTDA',
        address: 'ROD. DOM PEDRO I, KM 136',
        neighborhood: 'PARQUE DAS UNIVERSIDADES',
        city: 'CAMPINAS',
        contact: '(19) 3247-8901',
        location: { latitude: -22.8489, longitude: -47.0494 }
      },
      {
        id: '20',
        name: 'CAFÉ GALLERIA LTDA',
        address: 'RUA BARÃO DE ITAPURA, 950',
        neighborhood: 'BOTAFOGO',
        city: 'CAMPINAS',
        contact: '(19) 3248-9012',
        location: { latitude: -22.9025, longitude: -47.0547 }
      },
      {
        id: '21',
        name: 'CAFÉ TERMINAL LTDA',
        address: 'RUA DR. RICARDO, 400',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3249-0123',
        location: { latitude: -22.9033, longitude: -47.0553 }
      },
      {
        id: '22',
        name: 'CAFÉ ESTAÇÃO LTDA',
        address: 'PRAÇA MARECHAL FLORIANO PEIXOTO, 10',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3250-1234',
        location: { latitude: -22.9033, longitude: -47.0553 }
      },
      {
        id: '23',
        name: 'CAFÉ CENTRAL LTDA',
        address: 'AV. CAMPOS SALES, 890',
        neighborhood: 'CENTRO',
        city: 'CAMPINAS',
        contact: '(19) 3251-2345',
        location: { latitude: -22.9033, longitude: -47.0553 }
      },
      {
        id: '24',
        name: 'CAFÉ SOLAR LTDA',
        address: 'AV. JÚLIO PRESTES, 500',
        neighborhood: 'TAQUARAL',
        city: 'CAMPINAS',
        contact: '(19) 3252-3456',
        location: { latitude: -22.8867, longitude: -47.0506 }
      },
      {
        id: '25',
        name: 'CAFÉ LAGOA LTDA',
        address: 'AV. HEITOR PENTEADO, 1800',
        neighborhood: 'TAQUARAL',
        city: 'CAMPINAS',
        contact: '(19) 3253-4567',
        location: { latitude: -22.8867, longitude: -47.0506 }
      },
      {
        id: '26',
        name: 'CAFÉ PARQUE LTDA',
        address: 'AV. DR. HEITOR PENTEADO, 2000',
        neighborhood: 'PARQUE TAQUARAL',
        city: 'CAMPINAS',
        contact: '(19) 3254-5678',
        location: { latitude: -22.8867, longitude: -47.0506 }
      },
      {
        id: '27',
        name: 'CAFÉ PORTUGAL LTDA',
        address: 'AV. PRINCESA D\'OESTE, 1200',
        neighborhood: 'JARDIM PROENÇA',
        city: 'CAMPINAS',
        contact: '(19) 3255-6789',
        location: { latitude: -22.9098, longitude: -47.0631 }
      },
      {
        id: '28',
        name: 'CAFÉ PROENÇA LTDA',
        address: 'RUA JORGE MIRANDA, 150',
        neighborhood: 'JARDIM PROENÇA',
        city: 'CAMPINAS',
        contact: '(19) 3256-7890',
        location: { latitude: -22.9098, longitude: -47.0631 }
      },
      {
        id: '29',
        name: 'CAFÉ GUARANI LTDA',
        address: 'AV. GUARANI, 800',
        neighborhood: 'VILA JOÃO JORGE',
        city: 'CAMPINAS',
        contact: '(19) 3257-8901',
        location: { latitude: -22.9336, longitude: -47.1075 }
      },
      {
        id: '30',
        name: 'CAFÉ OURO VERDE LTDA',
        address: 'AV. OROSIMBO MAIA, 1700',
        neighborhood: 'VILA ITAPURA',
        city: 'CAMPINAS',
        contact: '(19) 3258-9012',
        location: { latitude: -22.9025, longitude: -47.0547 }
      }
    ];
  };

  return { 
    clients, 
    loading, 
    loadClients, 
    addClient, 
    updateClient, 
    deleteClient 
  };
}