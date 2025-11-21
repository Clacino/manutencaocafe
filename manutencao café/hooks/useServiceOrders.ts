import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceOrder } from '@/types';

export function useServiceOrders() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceOrders();
  }, []);

  const loadServiceOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('@serviceOrders');
      if (storedOrders) {
        setServiceOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error('Error loading service orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveServiceOrder = async (order: ServiceOrder) => {
    try {
      const updatedOrders = [...serviceOrders, order];
      setServiceOrders(updatedOrders);
      await AsyncStorage.setItem('@serviceOrders', JSON.stringify(updatedOrders));
      
      // Notificar administrador sobre nova O.S.
      await notifyAdminNewOrder(order);
    } catch (error) {
      console.error('Error saving service order:', error);
    }
  };

  const updateServiceOrder = async (orderId: string, updates: Partial<ServiceOrder>) => {
    try {
      const updatedOrders = serviceOrders.map(order =>
        order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
      );
      setServiceOrders(updatedOrders);
      await AsyncStorage.setItem('@serviceOrders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error updating service order:', error);
    }
  };

  const syncServiceOrder = async (orderId: string) => {
    try {
      await updateServiceOrder(orderId, { status: 'synced' });
    } catch (error) {
      console.error('Error syncing service order:', error);
    }
  };

  const notifyAdminNewOrder = async (order: ServiceOrder) => {
    try {
      // Salvar notificação para o admin
      const adminNotifications = await AsyncStorage.getItem('@admin_notifications');
      const notifications = adminNotifications ? JSON.parse(adminNotifications) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        type: 'new_order',
        title: 'Nova Ordem de Serviço',
        message: `O.S. #${order.id.slice(-6)} criada por ${order.client.name}`,
        timestamp: new Date().toISOString(),
        read: false,
        data: { orderId: order.id }
      };
      
      notifications.push(newNotification);
      await AsyncStorage.setItem('@admin_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  };

  return { 
    serviceOrders, 
    loading, 
    saveServiceOrder, 
    updateServiceOrder, 
    syncServiceOrder,
    loadServiceOrders 
  };
}