import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { ArrowLeft, MapPin, Navigation, Phone, Clock, User, Coffee, Zap, RefreshCw, Eye, MessageCircle, Route } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { useCommunication } from '@/hooks/useCommunication';
import { CommunicationPanel } from '@/components/CommunicationPanel';

export default function TechnicianMapScreen() {
  const router = useRouter();
  const { technicians, loading, refreshTechnicians } = useRealTimeTracking();
  const communication = useCommunication('admin', 'admin');
  
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedTechnicianForChat, setSelectedTechnicianForChat] = useState(null);
  const [mapView, setMapView] = useState('map');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Simular atualizações em tempo real
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      if (!refreshing) {
        refreshTechnicians();
      }
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, refreshing]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTechnicians();
    setRefreshing(false);
  };

  const handleTechnicianPress = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianModal(true);
  };

  const handleCallTechnician = async (phone, name) => {
    Alert.alert(
      'Ligar para Técnico',
      `Deseja ligar para ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', onPress: async () => {
          // Log da ligação
          await communication.logCall(selectedTechnician?.id || '1', 180);
          Alert.alert('Ligando...', `Conectando com ${phone}`);
        }},
      ]
    );
  };

  const handleSendMessage = (technician) => {
    setSelectedTechnicianForChat(technician);
    setShowCommunicationModal(true);
  };

  const handleOptimizeRoute = async (technicianId) => {
    Alert.alert(
      'Otimizar Rota',
      'Deseja otimizar a rota para este técnico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Otimizar', onPress: async () => {
          // Enviar rota otimizada
          await communication.sendRouteOptimization(technicianId, {
            optimizedRoute: true,
            estimatedTime: '2h 30m',
            totalDistance: '45.2 km'
          });
          Alert.alert('Sucesso', 'Rota otimizada e enviada para o técnico!');
        }},
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22C55E';
      case 'busy': return '#F59E0B';
      case 'offline': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Disponível';
      case 'busy': return 'Em Visita';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const getVisitTypeColor = (type) => {
    switch (type) {
      case 'preventive': return '#22C55E';
      case 'corrective_technical': return '#F59E0B';
      case 'corrective_operational': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getVisitTypeLabel = (type) => {
    switch (type) {
      case 'preventive': return 'Preventiva';
      case 'corrective_technical': return 'Corretiva Técnica';
      case 'corrective_operational': return 'Corretiva Operacional';
      default: return 'Desconhecido';
    }
  };

  const activeTechnicians = technicians.filter(t => t.status !== 'offline');
  const totalDistance = technicians.reduce((sum, t) => sum + t.todayStats.distance, 0);
  const totalCompleted = technicians.reduce((sum, t) => sum + t.todayStats.completed, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MapPin size={48} color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Rastreamento em Tempo Real</Text>
          <Text style={styles.headerSubtitle}>
            {activeTechnicians.length} técnicos ativos • Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.refreshButton, autoRefresh && styles.refreshButtonActive]}
          onPress={() => setAutoRefresh(!autoRefresh)}
        >
          <RefreshCw size={20} color={autoRefresh ? "#FFFFFF" : "#22C55E"} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeTechnicians.length}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalDistance.toFixed(1)}km</Text>
          <Text style={styles.statLabel}>Percorridos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{technicians.filter(t => t.currentVisit).length}</Text>
          <Text style={styles.statLabel}>Em Visita</Text>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, mapView === 'map' && styles.toggleButtonActive]}
          onPress={() => setMapView('map')}
        >
          <MapPin size={16} color={mapView === 'map' ? "#FFFFFF" : "#6B7280"} />
          <Text style={[styles.toggleButtonText, mapView === 'map' && styles.toggleButtonTextActive]}>
            Mapa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, mapView === 'list' && styles.toggleButtonActive]}
          onPress={() => setMapView('list')}
        >
          <User size={16} color={mapView === 'list' ? "#FFFFFF" : "#6B7280"} />
          <Text style={[styles.toggleButtonText, mapView === 'list' && styles.toggleButtonTextActive]}>
            Lista
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {mapView === 'map' && (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#22C55E" />
            <Text style={styles.mapPlaceholderTitle}>Mapa Interativo</Text>
            <Text style={styles.mapPlaceholderText}>
              Visualização em tempo real dos técnicos no Espírito Santo
            </Text>
            <Text style={styles.mapPlaceholderNote}>
              Funcionalidade de mapa disponível na versão mobile
            </Text>
          </View>
        </View>
      )}

      {/* List View */}
      {mapView === 'list' && (
        <ScrollView 
          style={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          {technicians.length === 0 ? (
            <View style={styles.emptyState}>
              <User size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhum técnico encontrado</Text>
              <Text style={styles.emptySubtext}>
                Adicione técnicos no dashboard para visualizar suas localizações
              </Text>
            </View>
          ) : (
            technicians.map((technician) => (
              <TouchableOpacity 
                key={technician.id}
                style={styles.technicianCard}
                onPress={() => handleTechnicianPress(technician)}
              >
                <View style={styles.technicianHeader}>
                  <View style={styles.technicianInfo}>
                    <View style={styles.technicianNameRow}>
                      <Text style={styles.technicianName}>{technician.name}</Text>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(technician.status) }]} />
                    </View>
                    <Text style={styles.technicianStatus}>{getStatusLabel(technician.status)}</Text>
                  </View>
                  <View style={styles.technicianActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleCallTechnician(technician.phone, technician.name)}
                    >
                      <Phone size={16} color="#22C55E" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSendMessage(technician)}
                    >
                      <MessageCircle size={16} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleOptimizeRoute(technician.id)}
                    >
                      <Route size={16} color="#F59E0B" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.locationInfo}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.locationText}>{technician.location.address}</Text>
                  <Text style={styles.lastUpdate}>
                    {new Date(technician.location.lastUpdate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {technician.currentVisit && (
                  <View style={styles.currentVisit}>
                    <View style={styles.visitHeader}>
                      <Coffee size={14} color={getVisitTypeColor(technician.currentVisit.visitType)} />
                      <Text style={styles.visitClient}>{technician.currentVisit.clientName}</Text>
                      <View style={[styles.visitTypeBadge, { backgroundColor: getVisitTypeColor(technician.currentVisit.visitType) }]}>
                        <Text style={styles.visitTypeText}>
                          {getVisitTypeLabel(technician.currentVisit.visitType)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.visitTime}>
                      <Clock size={12} color="#6B7280" />
                      <Text style={styles.visitTimeText}>
                        {technician.currentVisit.startTime} - {technician.currentVisit.estimatedEnd}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.technicianStats}>
                  <View style={styles.statGroup}>
                    <Text style={styles.statValue}>{technician.todayStats.completed}</Text>
                    <Text style={styles.statLabel}>Concluídas</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Text style={styles.statValue}>{technician.todayStats.pending}</Text>
                    <Text style={styles.statLabel}>Pendentes</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Text style={styles.statValue}>{technician.todayStats.distance.toFixed(1)}km</Text>
                    <Text style={styles.statLabel}>Percorridos</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Technician Detail Modal */}
      <Modal
        visible={showTechnicianModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes do Técnico</Text>
            <TouchableOpacity onPress={() => setShowTechnicianModal(false)}>
              <Text style={styles.closeButton}>Fechar</Text>
            </TouchableOpacity>
          </View>
          
          {selectedTechnician && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.technicianProfile}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <User size={32} color="#6B7280" />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{selectedTechnician.name}</Text>
                    <View style={[styles.profileStatus, { backgroundColor: getStatusColor(selectedTechnician.status) }]}>
                      <Text style={styles.profileStatusText}>{getStatusLabel(selectedTechnician.status)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.profileActions}>
                  <TouchableOpacity 
                    style={styles.profileActionButton}
                    onPress={() => handleCallTechnician(selectedTechnician.phone, selectedTechnician.name)}
                  >
                    <Phone size={20} color="#FFFFFF" />
                    <Text style={styles.profileActionText}>Ligar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.profileActionButton, styles.profileActionButtonSecondary]}
                    onPress={() => handleSendMessage(selectedTechnician)}
                  >
                    <MessageCircle size={20} color="#3B82F6" />
                    <Text style={[styles.profileActionText, styles.profileActionTextSecondary]}>Mensagem</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.profileActionButton, styles.profileActionButtonSecondary]}
                    onPress={() => handleOptimizeRoute(selectedTechnician.id)}
                  >
                    <Route size={20} color="#F59E0B" />
                    <Text style={[styles.profileActionText, styles.profileActionTextSecondary]}>Rota</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Localização Atual</Text>
                <View style={styles.locationDetail}>
                  <MapPin size={16} color="#22C55E" />
                  <View style={styles.locationDetailText}>
                    <Text style={styles.locationAddress}>{selectedTechnician.location.address}</Text>
                    <Text style={styles.locationCoords}>
                      {selectedTechnician.location.latitude.toFixed(6)}, {selectedTechnician.location.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.locationUpdate}>
                      Última atualização: {new Date(selectedTechnician.location.lastUpdate).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedTechnician.currentVisit && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Visita Atual</Text>
                  <View style={styles.visitDetail}>
                    <View style={styles.visitDetailHeader}>
                      <Coffee size={16} color={getVisitTypeColor(selectedTechnician.currentVisit.visitType)} />
                      <Text style={styles.visitDetailClient}>{selectedTechnician.currentVisit.clientName}</Text>
                    </View>
                    <Text style={styles.visitDetailAddress}>{selectedTechnician.currentVisit.clientAddress}</Text>
                    <View style={styles.visitDetailTime}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.visitDetailTimeText}>
                        {selectedTechnician.currentVisit.startTime} - {selectedTechnician.currentVisit.estimatedEnd}
                      </Text>
                    </View>
                    <View style={[styles.visitDetailType, { backgroundColor: getVisitTypeColor(selectedTechnician.currentVisit.visitType) }]}>
                      <Text style={styles.visitDetailTypeText}>
                        {getVisitTypeLabel(selectedTechnician.currentVisit.visitType)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Estatísticas de Hoje</Text>
                <View style={styles.statsDetail}>
                  <View style={styles.statDetailItem}>
                    <Text style={styles.statDetailNumber}>{selectedTechnician.todayStats.completed}</Text>
                    <Text style={styles.statDetailLabel}>Visitas Concluídas</Text>
                  </View>
                  <View style={styles.statDetailItem}>
                    <Text style={styles.statDetailNumber}>{selectedTechnician.todayStats.pending}</Text>
                    <Text style={styles.statDetailLabel}>Visitas Pendentes</Text>
                  </View>
                  <View style={styles.statDetailItem}>
                    <Text style={styles.statDetailNumber}>{selectedTechnician.todayStats.distance.toFixed(1)}km</Text>
                    <Text style={styles.statDetailLabel}>Distância Percorrida</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Communication Panel */}
      {selectedTechnicianForChat && (
        <CommunicationPanel
          userId="admin"
          userType="admin"
          recipientId={selectedTechnicianForChat.id}
          recipientName={selectedTechnicianForChat.name}
          visible={showCommunicationModal}
          onClose={() => {
            setShowCommunicationModal(false);
            setSelectedTechnicianForChat(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  header: {
    flexDirection: 'row',
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
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  refreshButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
    paddingHorizontal: 40,
  },
  technicianCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  technicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  technicianStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  technicianActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  currentVisit: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  visitClient: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  visitTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  visitTypeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  visitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  technicianStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statGroup: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
  technicianProfile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  profileActionButtonSecondary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileActionTextSecondary: {
    color: '#6B7280',
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationDetailText: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  locationUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  visitDetail: {
    gap: 8,
  },
  visitDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitDetailClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  visitDetailAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitDetailTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitDetailTimeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  visitDetailType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  visitDetailTypeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsDetail: {
    flexDirection: 'row',
    gap: 16,
  },
  statDetailItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statDetailNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});