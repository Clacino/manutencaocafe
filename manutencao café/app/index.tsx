import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/LoginScreen';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirecionar para a tela principal dos técnicos
        router.replace('/(tabs)/schedule');
      }
    }
  }, [user, loading]);

  // Mostrar tela de loading enquanto verifica autenticação
  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  // Se não há usuário logado, mostrar tela de login
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});