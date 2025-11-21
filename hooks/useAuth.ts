import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      const validCredentials = [
        { email: 'klaus@coffee.com', password: '123456', name: 'Klaus Silva', id: '2' },
        { email: 'joao@coffee.com', password: '123456', name: 'João Santos', id: '3' },
        { email: 'edison@coffee.com', password: '123456', name: 'Edison Lima', id: '4' },
        { email: 'tecnico@coffee.com', password: '123456', name: 'João Silva', id: '1' }
      ];

      const user = validCredentials.find(cred => cred.email === email && cred.password === password);
      
      if (user) {
        const userData: User = {
          id: user.id,
          name: user.name,
          email: email,
        };
        
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Limpar todos os dados do usuário
      await AsyncStorage.multiRemove([
        '@user',
        '@visits',
        '@serviceOrders',
        `@messages_${user?.id}`,
        '@technicians'
      ]);
      
      // Resetar estado do usuário
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo com erro, garantir que o usuário seja deslogado
      setUser(null);
    }
  };

  return { user, login, logout, loading };
}