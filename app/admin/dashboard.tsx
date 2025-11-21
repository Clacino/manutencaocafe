import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChartBar as BarChart3, Users, MapPin, FileText, Calendar, TrendingUp, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Coffee, Settings, LogOut, Download, Filter, Search, Plus, Navigation, Phone, Eye, X, UserPlus, CalendarPlus, FileSearch, MessageCircle, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useVisits } from '@/hooks/useVisits';
import { useClients } from '@/hooks/useClients';
import { useCommunication } from '@/hooks/useCommunication';
import { CommunicationPanel } from '@/components/CommunicationPanel';

export default function AdminDashboard() {
  const router = useRouter();
  const { technicians, loading: techLoading, addTechnician, refreshTechnicians } = useRealTimeTracking();
  const { serviceOrders, loading: ordersLoading, loadServiceOrders } = useServiceOrders();
  const { visits, loading: visitsLoading, loadVisits, addVisit } = useVisits();
  const { clients, loading: clientsLoading } = useClients();
  const communication = useCommunication('admin', 'admin');
  
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showNewTechnicianModal, setShowNewTechnicianModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedTechnicianForChat, setSelectedTechnicianForChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newTechnicianData, setNewTechnicianData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [newVisitData, setNewVisitData] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    equipmentBrand: '',
    equipmentModel: '',
    visitType: 'preventive',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    technicianId: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      refreshTechnicians(),
      loadServiceOrders(),
      loadVisits(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair do Dashboard',
      'Tem certeza que deseja sair do sistema administrativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              // Limpar dados administrativos
              await AsyncStorage.multiRemove(['@admin_session', '@admin_notifications']);
              // Navegar para a tela inicial
              router.replace('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              // Mesmo com erro, redirecionar
              router.replace('/');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleViewTechnician = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianModal(true);
  };

  const handleCallTechnician = (phone, name) => {
    Alert.alert(
      'Ligar para Técnico',
      `Deseja ligar para ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', onPress: async () => {
          // Log da ligação
          await communication.logCall(selectedTechnician?.id || '1', 120);
          Alert.alert('Ligação', `Conectando com ${phone}...`);
        }},
      ]
    );
  };

  const handleMessageTechnician = (technician) => {
    setSelectedTechnicianForChat(technician);
    setShowCommunicationModal(true);
  };

  const handleTrackTechnician = (technician) => {
    router.push('/admin/technician-map');
  };

  const handleAddTechnician = async () => {
    if (!newTechnicianData.name || !newTechnicianData.email || !newTechnicianData.phone) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const newTechnician = await addTechnician({
      name: newTechnicianData.name,
      email: newTechnicianData.email,
      phone: newTechnicianData.phone,
      status: 'offline',
      location: {
        latitude: -20.3155,
        longitude: -40.3128,
        address: 'Aguardando localização...',
        lastUpdate: new Date().toISOString()
      }
    });

    if (newTechnician) {
      setNewTechnicianData({ name: '', email: '', phone: '' });
      setShowNewTechnicianModal(false);
      Alert.alert('Sucesso', 'Técnico adicionado com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar o técnico');
    }
  };

  const handleScheduleVisit = async () => {
    if (!newVisitData.clientName || !newVisitData.technicianId) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    const newVisit = {
      id: Date.now().toString(),
      clientId: Date.now().toString(),
      client: {
        id: Date.now().toString(),
        name: newVisitData.clientName,
        address: newVisitData.clientAddress,
        neighborhood: 'Centro',
        city: 'Vitória',
        contact: newVisitData.clientPhone,
        location: { latitude: -20.3155, longitude: -40.3128 }
      },
      equipment: {
        id: Date.now().toString(),
        clientId: Date.now().toString(),
        brand: newVisitData.equipmentBrand,
        model: newVisitData.equipmentModel,
        millNumber: `ML${Date.now().toString().slice(-3)}`,
        machineNumber: `MC${Date.now().toString().slice(-3)}`
      },
      type: newVisitData.visitType,
      scheduledDate: newVisitData.scheduledDate,
      scheduledTime: newVisitData.scheduledTime,
      status: 'pending',
      technicianId: newVisitData.technicianId
    };

    await addVisit(newVisit);
    
    // Notificar técnico
    const technician = technicians.find(t => t.id === newVisitData.technicianId);
    if (technician) {
      await communication.sendMessage(
        newVisitData.technicianId,
        `Nova visita agendada: ${newVisitData.clientName} - ${newVisitData.scheduledDate} às ${newVisitData.scheduledTime}`
      );
    }

    setNewVisitData({
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      equipmentBrand: '',
      equipmentModel: '',
      visitType: 'preventive',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      technicianId: ''
    });
    setShowScheduleModal(false);
    Alert.alert('Sucesso', 'Visita agendada com sucesso!');
  };

  const handleSearchOrders = () => {
    const filteredOrders = serviceOrders.filter(order =>
      order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery) ||
      order.responsibleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    Alert.alert(
      'Resultados da Busca',
      `Encontradas ${filteredOrders.length} ordens de serviço`,
      [{ text: 'OK' }]
    );
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Escolha o formato de exportação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('Exportando...', 'Gerando relatório em PDF') },
        { text: 'CSV', onPress: () => Alert.alert('Exportando...', 'Gerando arquivo CSV') },
      ]
    );
  };

  // Calcular estatísticas em tempo real
  const stats = {
    totalTechnicians: technicians.length,
    totalClients: clients.length,
    activeTechnicians: technicians.filter(t => t.status === 'active' || t.status === 'busy').length,
    activeVisits: technicians.filter(t => t.currentVisit).length,
    completedToday: technicians.reduce((sum, t) => sum + t.todayStats.completed, 0),
    pendingOrders: serviceOrders.filter(o => o.status === 'draft').length,
    equipmentCount: new Set(serviceOrders.map(o => o.equipment.id)).size,
    averageTime: '2h 15m',
    completionRate: serviceOrders.length > 0 ? Math.round((serviceOrders.filter(o => o.status === 'completed').length / serviceOrders.length) * 100) : 0
  };

  const recentActivities = serviceOrders
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      technician: order.client.name,
      client: order.client.name,
      action: order.status === 'completed' ? 'Finalizou O.S.' : 'Criou O.S.',
      time: new Date(order.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: order.status
    }));

  const regionStats = [
    { 
      city: 'Vitória', 
      visits: serviceOrders.filter(o => o.client.city === 'Vitória').length, 
      completion: 96 
    },
    { 
      city: 'Vila Velha', 
      visits: serviceOrders.filter(o => o.client.city === 'Vila Velha').length, 
      completion: 91 
    },
    { 
      city: 'Serra', 
      visits: serviceOrders.filter(o => o.client.city === 'Serra').length, 
      completion: 89 
    }
  ];

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

  if (techLoading || ordersLoading || visitsLoading || clientsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <BarChart3 size={48} color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <BarChart3 size={32} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Dashboard Administrativo</Text>
            <Text style={styles.headerSubtitle}>Coffee Maintenance System</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notificações', `${communication.unreadCount} mensagens não lidas`)}
          >
            <Bell size={20} color="#6B7280" />
            {communication.unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{communication.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
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
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('today')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.periodButtonTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Mês
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.activeTechnicians}</Text>
              <Text style={styles.statLabel}>Técnicos Ativos</Text>
            </View>
            <Users size={24} color="#3B82F6" />
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.activeVisits}</Text>
              <Text style={styles.statLabel}>Visitas Ativas</Text>
            </View>
            <Navigation size={20} color="#22C55E" />
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.completedToday}</Text>
              <Text style={styles.statLabel}>Concluídas Hoje</Text>
            </View>
            <CheckCircle size={20} color="#22C55E" />
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>O.S. Pendentes</Text>
            </View>
            <AlertTriangle size={20} color="#F59E0B" />
          </View>
        </View>

        {/* Technicians Monitoring */}
        <View style={styles.technicianSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monitoramento de Técnicos</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => router.push('/admin/technician-map')}
            >
              <MapPin size={16} color="#3B82F6" />
              <Text style={styles.refreshButtonText}>Ver Mapa</Text>
            </TouchableOpacity>
          </View>

          {technicians.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhum técnico cadastrado</Text>
              <Text style={styles.emptySubtext}>Adicione técnicos para começar o monitoramento</Text>
            </View>
          ) : (
            technicians.map((technician) => (
              <View key={technician.id} style={styles.technicianCard}>
                <View style={styles.technicianInfo}>
                  <View style={styles.technicianHeader}>
                    <Text style={styles.technicianName}>{technician.name}</Text>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(technician.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(technician.status)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.technicianDetails}>
                    <View style={styles.technicianDetailRow}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.technicianDetailText}>{technician.location.address}</Text>
                    </View>
                    
                    {technician.currentVisit && (
                      <View style={styles.technicianDetailRow}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.technicianDetailText}>
                          {technician.currentVisit.clientName} - {technician.currentVisit.startTime}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.technicianStats}>
                      <Text style={styles.technicianStatText}>
                        Hoje: {technician.todayStats.completed}/{technician.todayStats.completed + technician.todayStats.pending}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.technicianActions}>
                  <TouchableOpacity 
                    style={styles.technicianActionButton}
                    onPress={() => handleViewTechnician(technician)}
                  >
                    <Eye size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.technicianActionButton}
                    onPress={() => handleCallTechnician(technician.phone, technician.name)}
                  >
                    <Phone size={16} color="#22C55E" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.technicianActionButton}
                    onPress={() => handleMessageTechnician(technician)}
                  >
                    <MessageCircle size={16} color="#F59E0B" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.technicianActionButton}
                    onPress={() => handleTrackTechnician(technician)}
                  >
                    <Navigation size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <View style={styles.secondaryStatCard}>
            <Coffee size={20} color="#22C55E" />
            <Text style={styles.secondaryStatNumber}>{stats.totalClients}</Text>
            <Text style={styles.secondaryStatLabel}>Clientes Ativos</Text>
          </View>

          <View style={styles.secondaryStatCard}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.secondaryStatNumber}>{stats.equipmentCount}</Text>
            <Text style={styles.secondaryStatLabel}>Equipamentos</Text>
          </View>

          <View style={styles.secondaryStatCard}>
            <Clock size={20} color="#F59E0B" />
            <Text style={styles.secondaryStatNumber}>{stats.averageTime}</Text>
            <Text style={styles.secondaryStatLabel}>Tempo Médio</Text>
          </View>
        </View>

        {/* Region Performance */}
        <View style={styles.regionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance por Região - ES</Text>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
              <Download size={16} color="#3B82F6" />
              <Text style={styles.exportButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>

          {regionStats.map((region, index) => (
            <View key={index} style={styles.regionCard}>
              <View style={styles.regionInfo}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.regionName}>{region.city}</Text>
              </View>
              <View style={styles.regionStats}>
                <Text style={styles.regionVisits}>{region.visits} visitas</Text>
                <View style={styles.regionCompletion}>
                  <Text style={styles.regionCompletionText}>{region.completion}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {recentActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={32} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhuma atividade recente</Text>
            </View>
          ) : (
            recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTechnician}>{activity.technician}</Text>
                  <Text style={styles.activityAction}>
                    {activity.action} - {activity.client}
                  </Text>
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <View style={[
                    styles.activityStatus,
                    { backgroundColor: 
                      activity.status === 'completed' ? '#22C55E' :
                      activity.status === 'in_progress' ? '#3B82F6' : '#F59E0B'
                    }
                  ]} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowNewTechnicianModal(true)}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Novo Técnico</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setShowScheduleModal(true)}
            >
              <CalendarPlus size={20} color="#3B82F6" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Agendar Visita
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setShowSearchModal(true)}
            >
              <FileSearch size={20} color="#3B82F6" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Buscar O.S.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Coffee Maintenance Dashboard - Espírito Santo
          </Text>
          <Text style={styles.footerSubtext}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
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
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {selectedTechnician && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.technicianDetailCard}>
                <Text style={styles.technicianDetailName}>{selectedTechnician.name}</Text>
                <Text style={styles.technicianDetailEmail}>{selectedTechnician.email}</Text>
                <Text style={styles.technicianDetailPhone}>{selectedTechnician.phone}</Text>
                
                <View style={styles.technicianDetailSection}>
                  <Text style={styles.technicianDetailSectionTitle}>Status Atual</Text>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(selectedTechnician.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(selectedTechnician.status)}</Text>
                  </View>
                </View>

                <View style={styles.technicianDetailSection}>
                  <Text style={styles.technicianDetailSectionTitle}>Localização</Text>
                  <Text style={styles.technicianDetailText}>{selectedTechnician.location.address}</Text>
                  <Text style={styles.technicianDetailCoords}>
                    {selectedTechnician.location.latitude.toFixed(4)}, {selectedTechnician.location.longitude.toFixed(4)}
                  </Text>
                </View>

                {selectedTechnician.currentVisit && (
                  <View style={styles.technicianDetailSection}>
                    <Text style={styles.technicianDetailSectionTitle}>Visita Atual</Text>
                    <Text style={styles.technicianDetailText}>{selectedTechnician.currentVisit.clientName}</Text>
                    <Text style={styles.technicianDetailSubtext}>
                      Início: {selectedTechnician.currentVisit.startTime} | Previsão: {selectedTechnician.currentVisit.estimatedEnd}
                    </Text>
                  </View>
                )}

                <View style={styles.technicianDetailSection}>
                  <Text style={styles.technicianDetailSectionTitle}>Estatísticas de Hoje</Text>
                  <View style={styles.technicianStatsGrid}>
                    <View style={styles.technicianStatItem}>
                      <Text style={styles.technicianStatNumber}>{selectedTechnician.todayStats.completed}</Text>
                      <Text style={styles.technicianStatLabel}>Concluídas</Text>
                    </View>
                    <View style={styles.technicianStatItem}>
                      <Text style={styles.technicianStatNumber}>{selectedTechnician.todayStats.pending}</Text>
                      <Text style={styles.technicianStatLabel}>Pendentes</Text>
                    </View>
                    <View style={styles.technicianStatItem}>
                      <Text style={styles.technicianStatNumber}>{selectedTechnician.todayStats.completed + selectedTechnician.todayStats.pending}</Text>
                      <Text style={styles.technicianStatLabel}>Total</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* New Technician Modal */}
      <Modal
        visible={showNewTechnicianModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Técnico</Text>
            <TouchableOpacity onPress={() => setShowNewTechnicianModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={newTechnicianData.name}
                onChangeText={(text) => setNewTechnicianData({...newTechnicianData, name: text})}
                placeholder="Digite o nome completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={newTechnicianData.email}
                onChangeText={(text) => setNewTechnicianData({...newTechnicianData, email: text})}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={newTechnicianData.phone}
                onChangeText={(text) => setNewTechnicianData({...newTechnicianData, phone: text})}
                placeholder="(27) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddTechnician}>
              <Text style={styles.addButtonText}>Adicionar Técnico</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agendar Visita</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Cliente *</Text>
              <TextInput
                style={styles.input}
                value={newVisitData.clientName}
                onChangeText={(text) => setNewVisitData({...newVisitData, clientName: text})}
                placeholder="Nome do cliente"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={newVisitData.clientAddress}
                onChangeText={(text) => setNewVisitData({...newVisitData, clientAddress: text})}
                placeholder="Endereço completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={newVisitData.clientPhone}
                onChangeText={(text) => setNewVisitData({...newVisitData, clientPhone: text})}
                placeholder="(27) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Marca do Equipamento</Text>
              <TextInput
                style={styles.input}
                value={newVisitData.equipmentBrand}
                onChangeText={(text) => setNewVisitData({...newVisitData, equipmentBrand: text})}
                placeholder="Ex: Saeco, Jura, Delonghi"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Modelo do Equipamento</Text>
              <TextInput
                style={styles.input}
                value={newVisitData.equipmentModel}
                onChangeText={(text) => setNewVisitData({...newVisitData, equipmentModel: text})}
                placeholder="Ex: Aulika Top HSC"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Técnico Responsável *</Text>
              <View style={styles.pickerContainer}>
                {technicians.map((tech) => (
                  <TouchableOpacity
                    key={tech.id}
                    style={[
                      styles.pickerOption,
                      newVisitData.technicianId === tech.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setNewVisitData({...newVisitData, technicianId: tech.id})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      newVisitData.technicianId === tech.id && styles.pickerOptionTextSelected
                    ]}>
                      {tech.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data</Text>
                <TextInput
                  style={styles.input}
                  value={newVisitData.scheduledDate}
                  onChangeText={(text) => setNewVisitData({...newVisitData, scheduledDate: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horário</Text>
                <TextInput
                  style={styles.input}
                  value={newVisitData.scheduledTime}
                  onChangeText={(text) => setNewVisitData({...newVisitData, scheduledTime: text})}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleScheduleVisit}>
              <Text style={styles.addButtonText}>Agendar Visita</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar Ordens de Serviço</Text>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Termo de Busca</Text>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cliente, técnico, número da O.S..."
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleSearchOrders}>
              <Text style={styles.addButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 16,
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryStatCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  technicianSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
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
  technicianCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  technicianInfo: {
    flex: 1,
  },
  technicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  technicianDetails: {
    gap: 4,
  },
  technicianDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  technicianDetailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  technicianStats: {
    marginTop: 4,
  },
  technicianStatText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  technicianActions: {
    flexDirection: 'row',
    gap: 8,
  },
  technicianActionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  secondaryStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  secondaryStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  secondaryStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  regionSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  regionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  regionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  regionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regionVisits: {
    fontSize: 12,
    color: '#6B7280',
  },
  regionCompletion: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regionCompletionText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  activitiesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  filterButton: {
    padding: 8,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityInfo: {
    flex: 1,
  },
  activityTechnician: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityAction: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#3B82F6',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
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
  technicianDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  technicianDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  technicianDetailEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  technicianDetailPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  technicianDetailSection: {
    marginBottom: 20,
  },
  technicianDetailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  technicianDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  technicianDetailSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  technicianDetailCoords: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  technicianStatsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  technicianStatItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  technicianStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  technicianStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});