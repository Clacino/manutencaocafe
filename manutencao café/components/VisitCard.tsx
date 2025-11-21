import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { MapPin, Clock, Wrench, TriangleAlert as AlertTriangle, Settings, Play, CircleCheck as CheckCircle, Coffee, Navigation, Phone, Building } from 'lucide-react-native';
import { Visit } from '@/types';

interface VisitCardProps {
  visit: Visit;
  onPress: () => void;
  onStartVisit: () => void;
  onFinishVisit: () => void;
}

export function VisitCard({ visit, onPress, onStartVisit, onFinishVisit }: VisitCardProps) {
  const [scaleValue] = React.useState(new Animated.Value(1));

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getVisitTypeIcon = (type: Visit['type']) => {
    switch (type) {
      case 'preventive':
        return <Settings size={16} color="#22C55E" />;
      case 'corrective_technical':
        return <Wrench size={16} color="#F59E0B" />;
      case 'corrective_operational':
        return <AlertTriangle size={16} color="#EF4444" />;
    }
  };

  const getVisitTypeLabel = (type: Visit['type']) => {
    switch (type) {
      case 'preventive':
        return 'Preventiva';
      case 'corrective_technical':
        return 'Corretiva Técnica';
      case 'corrective_operational':
        return 'Corretiva Operacional';
    }
  };

  const getVisitTypeColor = (type: Visit['type']) => {
    switch (type) {
      case 'preventive':
        return '#F0FDF4';
      case 'corrective_technical':
        return '#FFFBEB';
      case 'corrective_operational':
        return '#FEF2F2';
    }
  };

  const getStatusColor = (status: Visit['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#22C55E';
      case 'cancelled':
        return '#EF4444';
    }
  };

  const getStatusLabel = (status: Visit['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
    }
  };

  const makePhoneCall = () => {
    const phoneNumber = visit.client.contact.replace(/\D/g, '');
    const url = Platform.select({
      ios: `tel:${phoneNumber}`,
      android: `tel:${phoneNumber}`,
      web: `tel:${phoneNumber}`,
    });
    
    if (Platform.OS === 'web') {
      window.open(url);
    }
  };

  const openGoogleMaps = () => {
    const address = `${visit.client.address}, ${visit.client.neighborhood}, ${visit.client.city}, ES`;
    const url = Platform.select({
      ios: `maps://app?daddr=${encodeURIComponent(address)}`,
      android: `google.navigation:q=${encodeURIComponent(address)}`,
      web: `https://maps.google.com/maps?daddr=${encodeURIComponent(address)}`,
    });
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    }
  };

  const handlePress = () => {
    animatePress();
    onPress();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.clientSection}>
            <View style={styles.clientHeader}>
              <Text style={styles.clientName}>{visit.client.name}</Text>
              <View style={styles.cityBadge}>
                <Building size={12} color="#6B7280" />
                <Text style={styles.cityText}>{visit.client.city}</Text>
              </View>
            </View>
            <View style={[styles.typeContainer, { backgroundColor: getVisitTypeColor(visit.type) }]}>
              {getVisitTypeIcon(visit.type)}
              <Text style={styles.visitType}>{getVisitTypeLabel(visit.type)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visit.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(visit.status)}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {visit.client.address}, {visit.client.neighborhood}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(visit.scheduledDate).toLocaleDateString('pt-BR')} às {visit.scheduledTime}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Coffee size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {visit.equipment.brand} {visit.equipment.model}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Phone size={14} color="#6B7280" />
            <TouchableOpacity onPress={makePhoneCall}>
              <Text style={[styles.detailText, styles.phoneText]}>
                {visit.client.contact}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipment Details */}
        <View style={styles.equipmentSection}>
          <Text style={styles.equipmentTitle}>Equipamento</Text>
          <View style={styles.equipmentDetails}>
            <Text style={styles.equipmentDetail}>
              Moinho: {visit.equipment.millNumber}
            </Text>
            <Text style={styles.equipmentDetail}>
              Máquina: {visit.equipment.machineNumber}
            </Text>
          </View>
        </View>

        {/* Priority Indicator */}
        {visit.type !== 'preventive' && (
          <View style={styles.priorityIndicator}>
            <Text style={styles.priorityText}>
              {visit.type === 'corrective_operational' ? '🚨 URGENTE' : '⚡ ALTA PRIORIDADE'}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {visit.status === 'pending' && (
            <>
              <TouchableOpacity style={styles.navigationButton} onPress={openGoogleMaps}>
                <Navigation size={16} color="#3B82F6" />
                <Text style={styles.navigationButtonText}>Rota</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.startButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  onStartVisit();
                }}
              >
                <Play size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Iniciar</Text>
              </TouchableOpacity>
            </>
          )}
          
          {visit.status === 'in_progress' && (
            <>
              <TouchableOpacity 
                style={styles.serviceButton}
                onPress={handlePress}
              >
                <Wrench size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>O.S.</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.finishButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onFinishVisit();
                }}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </>
          )}

          {visit.status === 'completed' && (
            <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
              <CheckCircle size={16} color="#22C55E" />
              <Text style={styles.viewButtonText}>Ver O.S.</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientSection: {
    flex: 1,
    marginRight: 8,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  cityText: {
    fontSize: 9,
    color: '#3B82F6',
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  visitType: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  details: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  phoneText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  equipmentSection: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  equipmentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3,
  },
  equipmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  equipmentDetail: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
  },
  priorityIndicator: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  priorityText: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#22C55E',
    gap: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navigationButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButtonText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: 'bold',
  },
});