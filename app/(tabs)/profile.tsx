import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Platform, Modal } from 'react-native';
import { User, MapPin, Phone, Mail, LogOut, Settings, Coffee, Shield, Smartphone, Globe, MessageCircle, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useCommunication } from '@/hooks/useCommunication';
import { CommunicationPanel } from '@/components/CommunicationPanel';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const router = useRouter();
  const [showMessages, setShowMessages] = useState(false);
  const communication = useCommunication(user?.id || '1', 'technician');

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await logout();
              // Forçar navegação para tela de login
              router.replace('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              // Mesmo com erro, redirecionar para login
              router.replace('/');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>Informações do técnico</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#22C55E" />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.statusBadge}>
            <Shield size={12} color="#22C55E" />
            <Text style={styles.statusText}>Técnico Ativo</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <Mail size={20} color="#6B7280" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <Phone size={20} color="#6B7280" />
            <Text style={styles.infoText}>(27) 99999-9999</Text>
          </TouchableOpacity>

          {location && (
            <TouchableOpacity style={styles.infoItem}>
              <MapPin size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Vitória, ES ({location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Coffee size={24} color="#22C55E" />
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>O.S. este mês</Text>
            </View>
            
            <View style={styles.statCard}>
              <MapPin size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Cidades</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.menuText}>Configurações do App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Smartphone size={20} color="#6B7280" />
            <Text style={styles.menuText}>Sincronização</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Globe size={20} color="#6B7280" />
            <Text style={styles.menuText}>Sobre o App</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowMessages(true)}
          >
            <MessageCircle size={20} color="#3B82F6" />
            <Text style={styles.menuText}>Central de Mensagens</Text>
            {communication.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{communication.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color="#F59E0B" />
            <Text style={styles.menuText}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Sair do Sistema</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Coffee Maintenance v1.0.0</Text>
          <Text style={styles.appDescription}>
            Sistema de gestão de manutenção de máquinas de café
          </Text>
          <Text style={styles.platformInfo}>
            Plataforma: {Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
        </View>
      </ScrollView>

      <CommunicationPanel
        userId={user?.id || '1'}
        userType="technician"
        recipientId="admin"
        recipientName="Central de Controle"
        visible={showMessages}
        onClose={() => setShowMessages(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  logoutItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
  },
  appInfo: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  appDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  platformInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});