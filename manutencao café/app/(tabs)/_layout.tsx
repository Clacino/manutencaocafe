import { Tabs } from 'expo-router';
import { Calendar, FileText, History, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Cronograma',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="service-order"
        options={{
          title: 'Ordem de Serviço',
          tabBarIcon: ({ size, color }) => (
            <FileText size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ size, color }) => (
            <History size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ size, color }) => (
            <User size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}