import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Save, Clock, User, FileText, Settings, ArrowLeft, MapPin, Phone, Coffee, Wrench, SquareCheck as CheckSquare, Square, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ClientSearchField from '@/components/ClientSearchField';
import { useVisits } from '@/hooks/useVisits';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useAuth } from '@/hooks/useAuth';
import { ServiceOrder } from '@/types';

export default function ServiceOrderScreen() {
  const { visitId } = useLocalSearchParams();
  const { visits } = useVisits();
  const { saveServiceOrder, loadServiceOrders } = useServiceOrders();
  const { user } = useAuth();
  const router = useRouter();

  const [currentVisit, setCurrentVisit] = useState(null);
  const [serviceOrder, setServiceOrder] = useState<Partial<ServiceOrder>>({
    visitType: 'preventive',
    date: new Date().toISOString().split('T')[0],
    arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    departureTime: '',
    responsibleName: '',
    reportedProblems: '',
    serviceExecuted: '',
    replacedParts: [{ quantity: 0, description: '' }],
    generalObservations: '',
    statistics: {
      waterPressure: 0,
      boilerPressure: 0,
      doseCounter: 0,
      filterElement: {
        changeDate: '',
        nextChangeDate: '',
      },
      coffeeType: '',
    },
    machinePhoto: '',
    technicianSignature: '',
    clientSignature: '',
    status: 'draft',
  });

  useEffect(() => {
    if (visitId) {
      const visit = visits.find(v => v.id === visitId);
      if (visit) {
        setCurrentVisit(visit);
        setServiceOrder(prev => ({
          ...prev,
          clientId: visit.clientId,
          client: visit.client,
          equipment: visit.equipment,
          visitType: visit.type,
        }));
      }
    }
  }, [visitId, visits]);

  const handleInputChange = (field: string, value: any) => {
    setServiceOrder(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatisticsChange = (field: string, value: any) => {
    setServiceOrder(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        [field]: value,
      },
    }));
  };

  const handleFilterElementChange = (field: string, value: string) => {
    setServiceOrder(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        filterElement: {
          ...prev.statistics.filterElement,
          [field]: value,
        },
      },
    }));
  };

  const handlePartsChange = (index: number, field: string, value: any) => {
    const newParts = [...serviceOrder.replacedParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setServiceOrder(prev => ({
      ...prev,
      replacedParts: newParts,
    }));
  };

  const addPart = () => {
    setServiceOrder(prev => ({
      ...prev,
      replacedParts: [...prev.replacedParts, { quantity: 0, description: '' }],
    }));
  };

  const removePart = (index: number) => {
    if (serviceOrder.replacedParts.length > 1) {
      const newParts = serviceOrder.replacedParts.filter((_, i) => i !== index);
      setServiceOrder(prev => ({
        ...prev,
        replacedParts: newParts,
      }));
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use a placeholder
        setServiceOrder(prev => ({
          ...prev,
          machinePhoto: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg',
        }));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setServiceOrder(prev => ({
          ...prev,
          machinePhoto: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao tirar foto');
    }
  };

  const selectFromGallery = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use a placeholder
        setServiceOrder(prev => ({
          ...prev,
          machinePhoto: 'https://images.pexels.com/photos/6832450/pexels-photo-6832450.jpeg',
        }));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setServiceOrder(prev => ({
          ...prev,
          machinePhoto: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Adicionar Foto da Máquina',
      'Como você gostaria de adicionar a foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: selectFromGallery },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  const saveOrder = async () => {
    if (!serviceOrder.responsibleName?.trim() || !serviceOrder.serviceExecuted?.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome do responsável e o serviço executado');
      return;
    }

    try {
      const completeOrder: ServiceOrder = {
        ...serviceOrder,
        id: Date.now().toString(),
        technicianId: user?.id || '1',
        departureTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'completed',
      } as ServiceOrder;

      await saveServiceOrder(completeOrder);
      
      // Marcar visita como concluída se existir
      if (currentVisit) {
        const { updateVisitStatus } = useVisits();
        await updateVisitStatus(currentVisit.id, 'completed');
      }
      
      Alert.alert(
        'Ordem de Serviço Finalizada!', 
        `O.S. #${completeOrder.id.slice(-6)} foi salva com sucesso e está pronta para sincronização.`,
        [
          {
            text: 'Ver Histórico',
            onPress: () => {
              router.replace('/(tabs)/history');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar ordem de serviço');
    }
  };

  if (!currentVisit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FileText size={64} color="#EF4444" />
          <Text style={styles.errorText}>Visita não encontrada</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Ordem de Serviço</Text>
            <Text style={styles.subtitle}>OS #{Date.now().toString().slice(-6)}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveOrder}>
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Client Info Card */}
          <View style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <Text style={styles.clientName}>{currentVisit.client.name}</Text>
              <View style={styles.visitTypeChip}>
                <Text style={styles.visitTypeText}>
                  {currentVisit.type === 'preventive' ? 'Preventiva' : 
                   currentVisit.type === 'corrective_technical' ? 'Corretiva Técnica' : 
                   'Corretiva Operacional'}
                </Text>
              </View>
            </View>
            
            <View style={styles.clientDetails}>
              <View style={styles.clientDetailRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.clientDetailText}>
                  {currentVisit.client.address}, {currentVisit.client.neighborhood}, {currentVisit.client.city} - ES
                </Text>
              </View>
              <View style={styles.clientDetailRow}>
                <Phone size={16} color="#6B7280" />
                <Text style={styles.clientDetailText}>{currentVisit.client.contact}</Text>
              </View>
            </View>

            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentTitle}>Equipamento</Text>
              <Text style={styles.equipmentText}>
                {currentVisit.equipment.brand} {currentVisit.equipment.model}
              </Text>
              <Text style={styles.equipmentDetail}>
                Moinho: {currentVisit.equipment.millNumber} | Máquina: {currentVisit.equipment.machineNumber}
              </Text>
            </View>
          </View>

          {/* Visit Type Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckSquare size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Tipo de Visita</Text>
            </View>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => handleInputChange('visitType', 'preventive')}
              >
                {serviceOrder.visitType === 'preventive' ? 
                  <CheckSquare size={20} color="#22C55E" /> : 
                  <Square size={20} color="#6B7280" />
                }
                <Text style={styles.checkboxLabel}>Preventiva</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => handleInputChange('visitType', 'corrective_technical')}
              >
                {serviceOrder.visitType === 'corrective_technical' ? 
                  <CheckSquare size={20} color="#22C55E" /> : 
                  <Square size={20} color="#6B7280" />
                }
                <Text style={styles.checkboxLabel}>Corretiva Técnica</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => handleInputChange('visitType', 'corrective_operational')}
              >
                {serviceOrder.visitType === 'corrective_operational' ? 
                  <CheckSquare size={20} color="#22C55E" /> : 
                  <Square size={20} color="#6B7280" />
                }
                <Text style={styles.checkboxLabel}>Corretiva Operacional</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Horários</Text>
            </View>
            
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Chegada</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.arrivalTime}
                  onChangeText={(value) => handleInputChange('arrivalTime', value)}
                  placeholder="00:00"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Saída</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.departureTime}
                  onChangeText={(value) => handleInputChange('departureTime', value)}
                  placeholder="00:00"
                />
              </View>
            </View>
          </View>

          {/* Responsible Person */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Responsável no Local *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={serviceOrder.responsibleName}
              onChangeText={(value) => handleInputChange('responsibleName', value)}
              placeholder="Nome completo do responsável"
            />
          </View>

          {/* Problems and Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Problemas e Serviços</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Problemas Relatados</Text>
              <TextInput
                style={styles.textArea}
                value={serviceOrder.reportedProblems}
                onChangeText={(value) => handleInputChange('reportedProblems', value)}
                placeholder="Descreva os problemas relatados pelo cliente"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Serviço Executado *</Text>
              <TextInput
                style={styles.textArea}
                value={serviceOrder.serviceExecuted}
                onChangeText={(value) => handleInputChange('serviceExecuted', value)}
                placeholder="Descreva detalhadamente o serviço executado"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observações Gerais</Text>
              <TextInput
                style={styles.textArea}
                value={serviceOrder.generalObservations}
                onChangeText={(value) => handleInputChange('generalObservations', value)}
                placeholder="Observações adicionais, recomendações, etc."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Replaced Parts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Peças Trocadas</Text>
            </View>
            
            {serviceOrder.replacedParts.map((part, index) => (
              <View key={index} style={styles.partRow}>
                <TextInput
                  style={styles.quantityInput}
                  value={part.quantity.toString()}
                  onChangeText={(value) => handlePartsChange(index, 'quantity', parseInt(value) || 0)}
                  placeholder="Qtd"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.descriptionInput}
                  value={part.description}
                  onChangeText={(value) => handlePartsChange(index, 'description', value)}
                  placeholder="Descrição da peça trocada"
                />
                {serviceOrder.replacedParts.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removePartButton} 
                    onPress={() => removePart(index)}
                  >
                    <Text style={styles.removePartText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addPartButton} onPress={addPart}>
              <Text style={styles.addPartText}>+ Adicionar Peça</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Estatísticas da Máquina</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.inputLabel}>Pressão da Água (bar)</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.statistics.waterPressure.toString()}
                  onChangeText={(value) => handleStatisticsChange('waterPressure', parseFloat(value) || 0)}
                  placeholder="0.0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.statInput}>
                <Text style={styles.inputLabel}>Pressão da Caldeira (bar)</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.statistics.boilerPressure.toString()}
                  onChangeText={(value) => handleStatisticsChange('boilerPressure', parseFloat(value) || 0)}
                  placeholder="0.0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.statInput}>
                <Text style={styles.inputLabel}>Contador de Dose</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.statistics.doseCounter.toString()}
                  onChangeText={(value) => handleStatisticsChange('doseCounter', parseInt(value) || 0)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.statInput}>
                <Text style={styles.inputLabel}>Tipo de Café</Text>
                <TextInput
                  style={styles.input}
                  value={serviceOrder.statistics.coffeeType}
                  onChangeText={(value) => handleStatisticsChange('coffeeType', value)}
                  placeholder="Tipo do café utilizado"
                />
              </View>
            </View>

            {/* Filter Element */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Elemento Filtrante</Text>
              <View style={styles.filterRow}>
                <View style={styles.filterInput}>
                  <Text style={styles.inputLabel}>Data da Troca</Text>
                  <TextInput
                    style={styles.input}
                    value={serviceOrder.statistics.filterElement.changeDate}
                    onChangeText={(value) => handleFilterElementChange('changeDate', value)}
                    placeholder="DD/MM/AAAA"
                  />
                </View>
                <View style={styles.filterInput}>
                  <Text style={styles.inputLabel}>Próxima Troca</Text>
                  <TextInput
                    style={styles.input}
                    value={serviceOrder.statistics.filterElement.nextChangeDate}
                    onChangeText={(value) => handleFilterElementChange('nextChangeDate', value)}
                    placeholder="DD/MM/AAAA"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Photo Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Foto da Máquina</Text>
            </View>
            
            {!serviceOrder.machinePhoto ? (
              <TouchableOpacity style={styles.photoButton} onPress={showImageOptions}>
                <Camera size={32} color="#22C55E" />
                <Text style={styles.photoButtonText}>Adicionar Foto</Text>
                <Text style={styles.photoButtonSubtext}>Toque para tirar foto ou selecionar da galeria</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoContainer}>
                <Image source={{ uri: serviceOrder.machinePhoto }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.changePhotoButton} onPress={showImageOptions}>
                  <Text style={styles.changePhotoText}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Signatures */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#22C55E" />
              <Text style={styles.sectionTitle}>Assinaturas</Text>
            </View>
            
            <View style={styles.signaturesContainer}>
              <TouchableOpacity 
                style={styles.signatureButton}
                onPress={() => Alert.alert('Assinatura', 'Funcionalidade de assinatura digital será implementada em breve.')}
              >
                <User size={24} color="#6B7280" />
                <Text style={styles.signatureButtonText}>Assinatura do Técnico</Text>
                <Text style={styles.signatureButtonSubtext}>Toque para assinar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.signatureButton}
                onPress={() => Alert.alert('Assinatura', 'Funcionalidade de assinatura digital será implementada em breve.')}
              >
                <User size={24} color="#6B7280" />
                <Text style={styles.signatureButtonText}>Assinatura do Cliente</Text>
                <Text style={styles.signatureButtonSubtext}>Toque para assinar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveOrderButton} onPress={saveOrder}>
            <Save size={24} color="#FFFFFF" />
            <Text style={styles.saveOrderButtonText}>Finalizar Ordem de Serviço</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  backButtonHeader: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  visitTypeChip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visitTypeText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  clientDetails: {
    gap: 6,
    marginBottom: 12,
  },
  clientDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  equipmentInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  equipmentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 3,
  },
  equipmentText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  equipmentDetail: {
    fontSize: 11,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  checkboxContainer: {
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 70,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  partRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  quantityInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  descriptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
  },
  removePartButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removePartText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  addPartButton: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  addPartText: {
    color: '#15803D',
    fontWeight: '600',
    fontSize: 13,
  },
  statsGrid: {
    gap: 8,
  },
  statInput: {
    marginBottom: 4,
  },
  filterSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
  },
  photoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 8,
  },
  photoButtonSubtext: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 3,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  changePhotoButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  changePhotoText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 12,
  },
  signaturesContainer: {
    gap: 8,
  },
  signatureButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  signatureButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 13,
  },
  signatureButtonSubtext: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  saveOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 4,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});