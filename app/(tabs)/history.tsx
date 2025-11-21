import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity,
  RefreshControl,
  Animated,
  Modal,
  ScrollView
} from 'react-native';
import { Search, Filter, Calendar, TrendingUp, CircleCheck as CheckCircle, Clock, FileText, Download, ChartBar as BarChart3, Award } from 'lucide-react-native';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { ServiceOrderCard } from '@/components/ServiceOrderCard';
import { ServiceOrder } from '@/types';

export default function HistoryScreen() {
  const { serviceOrders, loading, loadServiceOrders } = useServiceOrders();
  const { user } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'synced'>('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServiceOrders();
    setRefreshing(false);
  };

  // Filtrar ordens do técnico atual
  const userOrders = serviceOrders.filter(order => order.technicianId === user?.id);
  
  const filteredOrders = userOrders.filter(order => {
    if (filterType === 'all') return true;
    return order.status === filterType;
  });

  const completedOrders = userOrders.filter(order => order.status === 'completed').length;
  const syncedOrders = userOrders.filter(order => order.status === 'synced').length;
  const averageTime = '2h 30m'; // Mock calculation
  const completionRate = userOrders.length > 0 ? Math.round((completedOrders / userOrders.length) * 100) : 0;

  const handleOrderPress = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if ((loading || clientsLoading) && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FileText size={48} color="#22C55E" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
          <Text style={styles.loadingSubtext}>Sincronizando ordens de serviço...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.subtitle}>Ordens de serviço realizadas</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.searchButton}>
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Download size={20} color="#22C55E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{userOrders.length}</Text>
              <Text style={styles.statLabel}>Total de O.S.</Text>
            </View>
            <FileText size={28} color="#22C55E" style={styles.statIcon} />
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{completedOrders}</Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <CheckCircle size={20} color="#22C55E" />
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{syncedOrders}</Text>
              <Text style={styles.statLabel}>Sincronizadas</Text>
            </View>
            <TrendingUp size={20} color="#3B82F6" />
          </View>
        </View>

        {/* Performance Cards */}
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.performanceTitle}>Tempo Médio</Text>
            </View>
            <Text style={styles.performanceValue}>{averageTime}</Text>
            <Text style={styles.performanceLabel}>por O.S.</Text>
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Award size={20} color="#8B5CF6" />
              <Text style={styles.performanceTitle}>Taxa de Sucesso</Text>
            </View>
            <Text style={styles.performanceValue}>{completionRate}%</Text>
            <Text style={styles.performanceLabel}>conclusão</Text>
          </View>
        </View>

        {/* Region Performance */}
        <View style={styles.regionPerformanceCard}>
          <View style={styles.regionPerformanceHeader}>
            <BarChart3 size={20} color="#22C55E" />
            <Text style={styles.regionPerformanceTitle}>Performance por Região</Text>
          </View>
          <View style={styles.regionStats}>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatNumber}>
                {userOrders.filter(o => o.client?.city === 'Vitória').length}
              </Text>
              <Text style={styles.regionStatLabel}>Vitória</Text>
            </View>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatNumber}>
                {userOrders.filter(o => o.client?.city === 'Vila Velha').length}
              </Text>
              <Text style={styles.regionStatLabel}>Vila Velha</Text>
            </View>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatNumber}>
                {userOrders.filter(o => o.client?.city === 'Serra').length}
              </Text>
              <Text style={styles.regionStatLabel}>Serra</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              {`Todas (${userOrders.length})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilterType('completed')}
          >
            <Text style={[styles.filterButtonText, filterType === 'completed' && styles.filterButtonTextActive]}>
              {`Concluídas (${completedOrders})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'synced' && styles.filterButtonActive]}
            onPress={() => setFilterType('synced')}
          >
            <Text style={[styles.filterButtonText, filterType === 'synced' && styles.filterButtonTextActive]}>
              {`Sincronizadas (${syncedOrders})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <FlatList
          data={filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.orderCardContainer,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30 * (index + 1), 0],
                    }),
                  }],
                },
              ]}
            >
              <ServiceOrderCard
                order={item}
                onPress={() => handleOrderPress(item)}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhuma ordem de serviço</Text>
              <Text style={styles.emptySubtext}>
                As ordens de serviço preenchidas aparecerão aqui
              </Text>
            </View>
          }
        />

        {/* Modal de Detalhes da Ordem de Serviço */}
        <Modal
          visible={showOrderModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Ordem de Serviço #{selectedOrder?.id.slice(-6)}
              </Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <Text style={styles.closeButton}>Fechar</Text>
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView style={styles.modalContent}>
                {/* Informações do Cliente */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Cliente</Text>
                  <Text style={styles.orderSectionText}>{selectedOrder.client.name}</Text>
                  <Text style={styles.orderSectionSubtext}>
                    {selectedOrder.client.address}, {selectedOrder.client.neighborhood}, {selectedOrder.client.city}
                  </Text>
                  <Text style={styles.orderSectionSubtext}>{selectedOrder.client.contact}</Text>
                </View>

                {/* Informações do Equipamento */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Equipamento</Text>
                  <Text style={styles.orderSectionText}>
                    {selectedOrder.equipment.brand} {selectedOrder.equipment.model}
                  </Text>
                  <Text style={styles.orderSectionSubtext}>
                    Moinho: {selectedOrder.equipment.millNumber} | Máquina: {selectedOrder.equipment.machineNumber}
                  </Text>
                </View>

                {/* Horários */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Horários</Text>
                  <Text style={styles.orderSectionText}>
                    Chegada: {selectedOrder.arrivalTime} | Saída: {selectedOrder.departureTime}
                  </Text>
                  <Text style={styles.orderSectionSubtext}>
                    Data: {new Date(selectedOrder.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                {/* Responsável */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Responsável no Local</Text>
                  <Text style={styles.orderSectionText}>{selectedOrder.responsibleName}</Text>
                </View>

                {/* Problemas Relatados */}
                {selectedOrder.reportedProblems && (
                  <View style={styles.orderSection}>
                    <Text style={styles.orderSectionTitle}>Problemas Relatados</Text>
                    <Text style={styles.orderSectionText}>{selectedOrder.reportedProblems}</Text>
                  </View>
                )}

                {/* Serviço Executado */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Serviço Executado</Text>
                  <Text style={styles.orderSectionText}>{selectedOrder.serviceExecuted}</Text>
                </View>

                {/* Peças Trocadas */}
                {selectedOrder.replacedParts.some(part => part.description) && (
                  <View style={styles.orderSection}>
                    <Text style={styles.orderSectionTitle}>Peças Trocadas</Text>
                    {selectedOrder.replacedParts.map((part, index) => (
                      part.description ? (
                        <Text key={index} style={styles.orderSectionText}>
                          {part.quantity}x {part.description}
                        </Text>
                      ) : null
                    ))}
                  </View>
                )}

                {/* Estatísticas */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Estatísticas da Máquina</Text>
                  <Text style={styles.orderSectionText}>
                    Pressão da Água: {selectedOrder.statistics.waterPressure} bar
                  </Text>
                  <Text style={styles.orderSectionText}>
                    Pressão da Caldeira: {selectedOrder.statistics.boilerPressure} bar
                  </Text>
                  <Text style={styles.orderSectionText}>
                    Contador de Dose: {selectedOrder.statistics.doseCounter}
                  </Text>
                  {selectedOrder.statistics.coffeeType && (
                    <Text style={styles.orderSectionText}>
                      Tipo de Café: {selectedOrder.statistics.coffeeType}
                    </Text>
                  )}
                </View>

                {/* Observações */}
                {selectedOrder.generalObservations && (
                  <View style={styles.orderSection}>
                    <Text style={styles.orderSectionTitle}>Observações Gerais</Text>
                    <Text style={styles.orderSectionText}>{selectedOrder.generalObservations}</Text>
                  </View>
                )}

                {/* Status */}
                <View style={styles.orderSection}>
                  <Text style={styles.orderSectionTitle}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: 
                      selectedOrder.status === 'completed' ? '#22C55E' :
                      selectedOrder.status === 'synced' ? '#3B82F6' : '#F59E0B'
                    }
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedOrder.status === 'completed' ? 'Concluída' :
                       selectedOrder.status === 'synced' ? 'Sincronizada' : 'Rascunho'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: 'relative',
  },
  primaryStatCard: {
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  statIcon: {
    opacity: 0.3,
  },
  performanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  regionPerformanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  regionPerformanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  regionPerformanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  regionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  regionStat: {
    alignItems: 'center',
  },
  regionStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  regionStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  orderCardContainer: {
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
  closeButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  orderSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  orderSectionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  orderSectionSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});