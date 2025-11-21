import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { Client } from '@/types';

interface ClientSearchFieldProps {
  onSelectClient: (client: Client) => void;
  placeholder?: string;
}

export default function ClientSearchField({ onSelectClient, placeholder = "Buscar cliente..." }: ClientSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load clients from storage or mock data
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowResults(true);
    } else {
      setFilteredClients([]);
      setShowResults(false);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    // In a real app, you would load this from AsyncStorage or an API
    // For now, we'll use mock data from the coffee extraction clients
    const coffeeClients: Client[] = [
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

    setClients(coffeeClients);
  };

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => searchQuery.length > 0 && setShowResults(true)}
        />
      </View>
      
      {showResults && (
        <View style={styles.resultsContainer}>
          {filteredClients.length > 0 ? (
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => handleSelectClient(item)}
                >
                  <Text style={styles.clientName}>{item.name}</Text>
                  <Text style={styles.clientAddress}>{item.address}, {item.neighborhood}</Text>
                  <Text style={styles.clientCity}>{item.city} • {item.contact}</Text>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>Nenhum cliente encontrado</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
  },
  resultsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
    zIndex: 20,
  },
  resultsList: {
    width: '100%',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  clientCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
});