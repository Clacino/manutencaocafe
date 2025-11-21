import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Modal,
  Alert,
  SafeAreaView
} from 'react-native';
import { MessageCircle, Send, Phone, MapPin, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle, X, User, Wifi, WifiOff } from 'lucide-react-native';
import { useCommunication, Message } from '@/hooks/useCommunication';

interface CommunicationPanelProps {
  userId: string;
  userType: 'admin' | 'technician';
  recipientId?: string;
  recipientName?: string;
  visible: boolean;
  onClose: () => void;
}

export function CommunicationPanel({
  userId,
  userType,
  recipientId,
  recipientName,
  visible,
  onClose
}: CommunicationPanelProps) {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const communication = useCommunication(userId, userType);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const conversation = recipientId ? communication.getConversation(recipientId) : [];

  useEffect(() => {
    if (visible && conversation.length > 0) {
      // Marcar mensagens como lidas quando o painel é aberto
      conversation.forEach(msg => {
        if (!msg.read && msg.to === userId) {
          communication.markAsRead(msg.id);
        }
      });
      
      // Scroll para o final da conversa
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, conversation.length]);

  const sendMessage = async () => {
    if (!messageText.trim() || !recipientId) return;

    setIsTyping(true);
    const success = await communication.sendMessage(recipientId, messageText.trim());
    
    if (success) {
      setMessageText('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
    }
    setIsTyping(false);
  };

  const sendQuickMessage = async (type: 'whereAreYou' | 'needHelp' | 'urgent' | 'onMyWay' | 'completed') => {
    if (!recipientId) return;
    
    const success = await communication.sendQuickMessage(recipientId, type);
    if (!success) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem rápida');
    } else {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case 'alert':
        return <AlertCircle size={12} color="#EF4444" />;
      case 'location':
        return <MapPin size={12} color="#22C55E" />;
      case 'route':
        return <MapPin size={12} color="#F59E0B" />;
      case 'call':
        return <Phone size={12} color="#3B82F6" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (message: Message) => {
    return message.fromId === userId;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <User size={20} color="#6B7280" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                {recipientName || 'Conversa'}
              </Text>
              <View style={styles.connectionStatus}>
                {communication.isConnected ? (
                  <Wifi size={12} color="#22C55E" />
                ) : (
                  <WifiOff size={12} color="#EF4444" />
                )}
                <Text style={[
                  styles.connectionText,
                  { color: communication.isConnected ? '#22C55E' : '#EF4444' }
                ]}>
                  {communication.isConnected ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            {communication.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{communication.unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        {userType === 'admin' && (
          <View style={styles.quickActions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContent}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => sendQuickMessage('whereAreYou')}
              >
                <MapPin size={16} color="#3B82F6" />
                <Text style={styles.quickButtonText}>Onde está?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => sendQuickMessage('needHelp')}
              >
                <AlertCircle size={16} color="#F59E0B" />
                <Text style={styles.quickButtonText}>Precisa ajuda?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickButton, styles.urgentButton]}
                onPress={() => sendQuickMessage('urgent')}
              >
                <AlertCircle size={16} color="#FFFFFF" />
                <Text style={[styles.quickButtonText, { color: '#FFFFFF' }]}>Urgente</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {userType === 'technician' && (
          <View style={styles.quickActions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContent}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => sendQuickMessage('onMyWay')}
              >
                <MapPin size={16} color="#22C55E" />
                <Text style={styles.quickButtonText}>A caminho</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => sendQuickMessage('completed')}
              >
                <CheckCircle size={16} color="#22C55E" />
                <Text style={styles.quickButtonText}>Concluído</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {conversation.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
              <Text style={styles.emptySubtitle}>
                Inicie uma conversa enviando uma mensagem
              </Text>
            </View>
          ) : (
            conversation.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageItem,
                  isMyMessage(message) ? styles.sentMessage : styles.receivedMessage
                ]}
              >
                <View style={[
                  styles.messageContent,
                  isMyMessage(message) ? styles.sentMessageContent : styles.receivedMessageContent
                ]}>
                  <View style={styles.messageHeader}>
                    {getMessageIcon(message)}
                    <Text style={[
                      styles.messageText,
                      isMyMessage(message) ? styles.sentText : styles.receivedText
                    ]}>
                      {message.content}
                    </Text>
                  </View>
                  <Text style={[
                    styles.messageTime,
                    isMyMessage(message) ? styles.sentTime : styles.receivedTime
                  ]}>
                    {formatTime(message.timestamp)}
                    {isMyMessage(message) && (
                      <Text style={styles.messageStatus}>
                        {message.read ? ' ✓✓' : ' ✓'}
                      </Text>
                    )}
                  </Text>
                </View>
                {message.type === 'alert' && (
                  <View style={styles.alertIndicator} />
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isTyping) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!messageText.trim() || isTyping}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[
            styles.connectionDot,
            { backgroundColor: communication.isConnected ? '#22C55E' : '#EF4444' }
          ]} />
          <Text style={styles.statusText}>
            {communication.isConnected ? 'Conectado' : 'Reconectando...'}
          </Text>
          <Text style={styles.lastActivity}>
            Última atividade: {formatTime(communication.lastActivity)}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  urgentButton: {
    backgroundColor: '#EF4444',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  messageItem: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sentMessageContent: {
    backgroundColor: '#22C55E',
  },
  receivedMessageContent: {
    backgroundColor: '#FFFFFF',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  receivedTime: {
    color: '#6B7280',
  },
  messageStatus: {
    fontSize: 10,
  },
  alertIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#22C55E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
    shadowOpacity: 0,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  lastActivity: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
});