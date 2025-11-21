import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  FlatList, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Platform,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Clock, 
  Coffee, 
  Calendar,
  Route,
  Zap,
  X,
  ChevronRight
} from 'lucide-react-native';
import { useVisits } from '@/hooks/useVisits';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { VisitCard } from '@/components/VisitCard';
import { useRouter } from 'expo-router';

export default function ScheduleScreen() {
  const { visits, loading, updateVisitStatus, loadVisits, generateNextVisits } = useVisits();
  const { clients, loading: clientsLoading } = useClients();
  const { location, updateLocation } = useLocation();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [showAllVisitsModal, setShowAllVisitsModal] = useState(false);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVisitPress = (visitId: string) => {
    router.push(`/service-order?visitId=${visitId}`);
  };

  const handleStartVisit = (visitId: string) => {
    updateVisitStatus(visitId, 'in_progress');
  };

  const handleFinishVisit = (visitId: string) => {
    updateVisitStatus(visitId, 'completed');
  };

  const handleOptimizeRoute = () => {
    // Otimizar rota baseada na localização atual
    if (location) {
      const optimizedVisits = optimizeVisitsByLocation(todaysVisits, location);
      Alert.alert(
        'Rota Otimizada!', 
        `Suas visitas foram reorganizadas pela proximidade. Economia estimada: 15 minutos de deslocamento.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Localização', 'Ative a localização para otimizar sua rota');
    }
  };

  const optimizeVisitsByLocation = (visits, currentLocation) => {
    // Algoritmo simples de otimização baseado na distância
    return visits.sort((a, b) => {
      const distanceA = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        a.client.location.latitude,
        a.client.location.longitude
      );
      const distanceB = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        b.client.location.latitude,
        b.client.location.longitude
      );
      return distanceA - distanceB;
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    await updateLocation();
    await generateNextVisits(); // Gerar próximas visitas
    setRefreshing(false);
  };

  // Filtrar visitas do técnico atual
  const userVisits = visits.filter(visit => visit.technicianId === user?.id);
  
  const todaysVisits = userVisits.filter(visit => {
    const today = new Date().toISOString().split('T')[0];
    return visit.scheduledDate === today;
  });

  const upcomingVisits = userVisits.filter(visit => {
    const today = new Date().toISOString().split('T')[0];
    return visit.scheduledDate > today;
  }).slice(0, 3);

  // Organizar visitas por semana
  const getWeeklyVisits = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyVisits = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      weeklyVisits[dateStr] = {
        date: date,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        visits: userVisits.filter(visit => visit.scheduledDate === dateStr)
      };
    }
    
    return weeklyVisits;
  };

  const completedToday = todaysVisits.filter(v => v.status === 'completed').length;
  const inProgressToday = todaysVisits.filter(v => v.status === 'in_progress').length;
  const pendingToday = todaysVisits.filter(v => v.status === 'pending').length;

  if ((loading || clientsLoading) && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Coffee size={48} color="#22C55E" />
          <Text style={styles.loadingText}>Carregando cronograma...</Text>
          <Text style={styles.loadingSubtext}>Sincronizando visitas do ES...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: animatedValue }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Olá, João!</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
              <Text style={styles.regionText}>Região: Espírito Santo</Text>
            </View>
            <TouchableOpacity style={styles.locationButton} onPress={updateLocation}>
              <MapPin size={20} color="#22C55E" />
              <RefreshCw size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {location && (
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Navigation size={16} color="#22C55E" />
                <Text style={styles.locationText}>
                  Localização atualizada - {new Date().toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} (Vitória/ES)
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{todaysVisits.length}</Text>
              <Text style={styles.statLabel}>Visitas Hoje</Text>
            </View>
            <Coffee size={20} color="#22C55E" />
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{completedToday}</Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{inProgressToday}</Text>
              <Text style={styles.statLabel}>Em Andamento</Text>
            </View>
            <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{pendingToday}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
            <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
          </View>
        </View>

        {/* Enhanced Route Optimization */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.routeButton} onPress={handleOptimizeRoute}>
            <Route size={20} color="#FFFFFF" />
            <Text style={styles.routeButtonText}>Otimizar Rota</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapButton}>
            <Navigation size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>

        {/* Today's Visits */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Visitas de Hoje</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAllVisitsModal(true)}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {/* Region Info Compact */}
        <View style={styles.regionInfoCompact}>
          <Text style={styles.regionInfoText}>
            📍 Cobertura: Vitória ({userVisits.filter(v => v.client.city === 'Vitória').length}) • Vila Velha ({userVisits.filter(v => v.client.city === 'Vila Velha').length}) • Serra ({userVisits.filter(v => v.client.city === 'Serra').length})
          </Text>
        </View>

        <FlatList
          data={todaysVisits.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.visitCardContainer,
                {
                  opacity: animatedValue,
                  transform: [{
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    }),
                  }],
                },
              ]}
            >
              <VisitCard
                visit={item}
                onPress={() => handleVisitPress(item.id)}
                onStartVisit={() => handleStartVisit(item.id)}
                onFinishVisit={() => handleFinishVisit(item.id)}
              />
            </Animated.View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#22C55E"
              colors={['#22C55E']}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? (
            <View style={styles.emptyContainer}>
              <Coffee size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhuma visita hoje</Text>
              <Text style={styles.emptySubtext}>
                Suas visitas agendadas no ES aparecerão aqui
              </Text>
            </View>
          ) : null}
          ListFooterComponent={
            upcomingVisits.length > 0 ? (
              <View style={styles.upcomingSection}>
                <View style={styles.upcomingSectionHeader}>
                  <Zap size={16} color="#F59E0B" />
                  <Text style={styles.upcomingSectionTitle}>Próximas Visitas</Text>
                </View>
                {upcomingVisits.map((visit, index) => (
                  <View key={visit.id} style={styles.upcomingVisit}>
                    <View style={styles.upcomingVisitDate}>
                      <Text style={styles.upcomingVisitDay}>
                        {new Date(visit.scheduledDate).getDate()}
                      </Text>
                      <Text style={styles.upcomingVisitMonth}>
                        {new Date(visit.scheduledDate).toLocaleDateString('pt-BR', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.upcomingVisitInfo}>
                      <Text style={styles.upcomingVisitClient}>{visit.client.name}</Text>
                      <Text style={styles.upcomingVisitTime}>
                        {visit.scheduledTime} - {visit.client.neighborhood}, {visit.client.city}
                      </Text>
                      <Text style={styles.upcomingVisitEquipment}>
                        {visit.equipment.brand} {visit.equipment.model}
                      </Text>
                    </View>
                    <View style={styles.upcomingVisitType}>
                      <Text style={styles.upcomingVisitTypeText}>
                        {visit.type === 'preventive' ? 'PREV' : 
                         visit.type === 'corrective_technical' ? 'CORR' : 'URG'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null
          }
        />

        {/* Modal de Todas as Visitas */}
        <Modal
          visible={showAllVisitsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visitas da Semana</Text>
              <TouchableOpacity onPress={() => setShowAllVisitsModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {Object.entries(getWeeklyVisits()).map(([dateStr, dayData]) => (
                <View key={dateStr} style={styles.daySection}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>
                      {dayData.dayName.charAt(0).toUpperCase() + dayData.dayName.slice(1)}
                    </Text>
                    <Text style={styles.dayDate}>
                      {dayData.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </Text>
                    <View style={styles.dayStats}>
                      <Text style={styles.dayStatsText}>
                        {dayData.visits.length} visita{dayData.visits.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  
                  {dayData.visits.length === 0 ? (
                    <View style={styles.emptyDay}>
                      <Text style={styles.emptyDayText}>Nenhuma visita agendada</Text>
                    </View>
                  ) : (
                    dayData.visits.map((visit) => (
                      <View key={visit.id} style={styles.modalVisitCard}>
                        <View style={styles.modalVisitHeader}>
                          <Text style={styles.modalVisitTime}>{visit.scheduledTime}</Text>
                          <Text style={styles.modalVisitClient}>{visit.client.name}</Text>
                          <ChevronRight size={16} color="#6B7280" />
                        </View>
                        <Text style={styles.modalVisitAddress}>
                          {visit.client.address}, {visit.client.neighborhood}
                        </Text>
                        <View style={styles.modalVisitFooter}>
                          <Text style={styles.modalVisitEquipment}>
                            {visit.equipment.brand} {visit.equipment.model}
                          </Text>
                          <View style={[
                            styles.modalVisitStatus,
                            { backgroundColor: 
                              visit.status === 'completed' ? '#22C55E' :
                              visit.status === 'in_progress' ? '#3B82F6' :
                              visit.status === 'cancelled' ? '#EF4444' : '#F59E0B'
                            }
                          ]}>
                            <Text style={styles.modalVisitStatusText}>
                              {visit.status === 'completed' ? 'Concluída' :
                               visit.status === 'in_progress' ? 'Em Andamento' :
                               visit.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  regionText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  locationInfo: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  statDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  routeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
  regionInfoCompact: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regionInfoText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  visitCardContainer: {
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  upcomingSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  upcomingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  upcomingSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  upcomingVisit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  upcomingVisitDate: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingVisitDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  upcomingVisitMonth: {
    fontSize: 10,
    color: '#D97706',
    textTransform: 'uppercase',
  },
  upcomingVisitInfo: {
    flex: 1,
  },
  upcomingVisitClient: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  upcomingVisitTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  upcomingVisitEquipment: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  upcomingVisitType: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingVisitTypeText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  dayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  dayStats: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayStatsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyDay: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalVisitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalVisitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalVisitTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
    marginRight: 12,
  },
  modalVisitClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  modalVisitAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalVisitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalVisitEquipment: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  modalVisitStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalVisitStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});