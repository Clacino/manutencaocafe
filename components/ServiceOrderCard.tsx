import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, FileText, User } from 'lucide-react-native';
import { ServiceOrder } from '@/types';

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onPress: () => void;
}

export function ServiceOrderCard({ order, onPress }: ServiceOrderCardProps) {
  const getStatusColor = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'draft':
        return '#F59E0B';
      case 'completed':
        return '#22C55E';
      case 'synced':
        return '#3B82F6';
    }
  };

  const getStatusLabel = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'completed':
        return 'Concluída';
      case 'synced':
        return 'Sincronizada';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>OS #{order.id.slice(-6)}</Text>
          <Text style={styles.clientName}>{order.client.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            {new Date(order.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            {order.client.neighborhood}, {order.client.city}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FileText size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            {order.equipment.brand} {order.equipment.model}
          </Text>
        </View>
        {order.responsibleName && (
          <View style={styles.detailRow}>
            <User size={14} color="#6B7280" />
            <Text style={styles.detailText}>{order.responsibleName}</Text>
          </View>
        )}
      </View>

      {order.serviceExecuted && (
        <View style={styles.serviceSection}>
          <Text style={styles.serviceSectionTitle}>Serviço Executado:</Text>
          <Text style={styles.serviceText} numberOfLines={2}>
            {order.serviceExecuted}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
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
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  serviceSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  serviceSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    color: '#6B7280',
  },
});