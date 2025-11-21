import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  from: 'admin' | 'technician';
  fromId: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'location' | 'route' | 'alert' | 'call';
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    callDuration?: number;
    routeData?: any;
  };
}

export interface CommunicationState {
  messages: Message[];
  unreadCount: number;
  isConnected: boolean;
  lastActivity: string;
}

export function useCommunication(userId: string, userType: 'admin' | 'technician') {
  const [state, setState] = useState<CommunicationState>({
    messages: [],
    unreadCount: 0,
    isConnected: true,
    lastActivity: new Date().toISOString()
  });

  useEffect(() => {
    loadMessages();
    
    // Simular conexão em tempo real - verificar novas mensagens a cada 5 segundos
    const interval = setInterval(() => {
      loadMessages();
      setState(prev => ({
        ...prev,
        lastActivity: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(`@messages_${userId}`);
      if (storedMessages) {
        const messages: Message[] = JSON.parse(storedMessages);
        const unreadCount = messages.filter(m => !m.read && m.to === userId).length;
        
        setState(prev => ({
          ...prev,
          messages,
          unreadCount
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (
    to: string, 
    content: string, 
    type: Message['type'] = 'text',
    metadata?: Message['metadata']
  ): Promise<boolean> => {
    try {
      const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newMessage: Message = {
        id: messageId,
        from: userType,
        fromId: userId,
        to,
        content,
        timestamp: new Date().toISOString(),
        read: true, // Mensagens enviadas são marcadas como lidas
        type,
        metadata
      };

      // Adicionar à lista local do remetente
      const updatedMessages = [...state.messages, newMessage];
      
      setState(prev => ({
        ...prev,
        messages: updatedMessages,
        lastActivity: new Date().toISOString()
      }));

      // Salvar localmente para o remetente
      await AsyncStorage.setItem(`@messages_${userId}`, JSON.stringify(updatedMessages));
      
      // Salvar para o destinatário
      await saveMessageForRecipient(to, newMessage);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const saveMessageForRecipient = async (recipientId: string, message: Message) => {
    try {
      const recipientMessages = await AsyncStorage.getItem(`@messages_${recipientId}`);
      const messages: Message[] = recipientMessages ? JSON.parse(recipientMessages) : [];
      
      const messageForRecipient: Message = {
        ...message,
        read: false // Mensagens recebidas não são lidas inicialmente
      };
      
      const updatedMessages = [...messages, messageForRecipient];
      await AsyncStorage.setItem(`@messages_${recipientId}`, JSON.stringify(updatedMessages));
      
      // Notificar sobre nova mensagem
      await notifyNewMessage(recipientId, message);
    } catch (error) {
      console.error('Error saving message for recipient:', error);
    }
  };

  const notifyNewMessage = async (recipientId: string, message: Message) => {
    try {
      const notifications = await AsyncStorage.getItem(`@notifications_${recipientId}`);
      const notificationsList = notifications ? JSON.parse(notifications) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        type: 'new_message',
        title: 'Nova Mensagem',
        message: `${message.from === 'admin' ? 'Administrador' : 'Técnico'}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        data: { messageId: message.id, fromId: message.fromId }
      };
      
      notificationsList.push(newNotification);
      await AsyncStorage.setItem(`@notifications_${recipientId}`, JSON.stringify(notificationsList));
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const updatedMessages = state.messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      
      const unreadCount = updatedMessages.filter(m => !m.read && m.to === userId).length;
      
      setState(prev => ({
        ...prev,
        messages: updatedMessages,
        unreadCount
      }));

      await AsyncStorage.setItem(`@messages_${userId}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedMessages = state.messages.map(msg =>
        msg.to === userId ? { ...msg, read: true } : msg
      );
      
      setState(prev => ({
        ...prev,
        messages: updatedMessages,
        unreadCount: 0
      }));

      await AsyncStorage.setItem(`@messages_${userId}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const getConversation = (otherUserId: string): Message[] => {
    return state.messages.filter(msg =>
      (msg.fromId === userId && msg.to === otherUserId) ||
      (msg.to === userId && msg.fromId === otherUserId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const updatedMessages = state.messages.filter(msg => msg.id !== messageId);
      
      setState(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      await AsyncStorage.setItem(`@messages_${userId}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const sendQuickMessage = async (to: string, messageType: 'whereAreYou' | 'needHelp' | 'urgent' | 'onMyWay' | 'completed') => {
    const quickMessages = {
      whereAreYou: '📍 Onde você está?',
      needHelp: '🆘 Precisa de ajuda?',
      urgent: '🚨 URGENTE: Entre em contato imediatamente!',
      onMyWay: '🚗 Estou a caminho',
      completed: '✅ Serviço concluído'
    };

    const type = messageType === 'urgent' ? 'alert' : 'text';
    return await sendMessage(to, quickMessages[messageType], type);
  };

  const sendLocationUpdate = async (to: string, location: { latitude: number; longitude: number; address: string }) => {
    return await sendMessage(
      to,
      `📍 Localização atualizada: ${location.address}`,
      'location',
      { location }
    );
  };

  const sendRouteOptimization = async (to: string, routeData: any) => {
    return await sendMessage(
      to,
      '🗺️ Nova rota otimizada enviada',
      'route',
      { routeData }
    );
  };

  const logCall = async (to: string, duration: number) => {
    return await sendMessage(
      to,
      `📞 Ligação realizada (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
      'call',
      { callDuration: duration }
    );
  };

  const getUnreadMessagesCount = (): number => {
    return state.messages.filter(m => !m.read && m.to === userId).length;
  };

  const getAllConversations = () => {
    const conversations = new Map();
    
    state.messages.forEach(msg => {
      const otherUserId = msg.fromId === userId ? msg.to : msg.fromId;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg,
          unreadCount: 0
        });
      } else {
        const existing = conversations.get(otherUserId);
        if (new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
          existing.lastMessage = msg;
        }
      }
      
      if (!msg.read && msg.to === userId) {
        const existing = conversations.get(otherUserId);
        existing.unreadCount++;
      }
    });
    
    return Array.from(conversations.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  };

  return {
    ...state,
    sendMessage,
    markAsRead,
    markAllAsRead,
    getConversation,
    deleteMessage,
    sendQuickMessage,
    sendLocationUpdate,
    sendRouteOptimization,
    logCall,
    refreshMessages: loadMessages,
    getUnreadMessagesCount,
    getAllConversations
  };
}