import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/LoginScreen';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && !loading) {
      // Se o usuário está logado, redirecionar para schedule
      router.replace('/(tabs)/schedule');
    }
  }, [user, loading, router]);

  // Mostrar tela de loading enquanto verifica autenticação
  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  // Se não há usuário logado, mostrar tela de login
  if (!user) {
    return <LoginScreen />;
  }

  // Fallback
  return <View style={styles.container} />;
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