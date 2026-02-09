import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { User, ChevronRight, Settings, Bell, LogOut, Music } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <View style={styles.headerBg} />
        
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color="#FFF" />
          </View>
        </View>

        <Text style={styles.userName}>Willian Padilha</Text>
        
        <View style={styles.roleTag}>
          <Music size={12} color={Colors.dark.primary} style={{ marginRight: 6 }} />
          <Text style={styles.roleText}>Violista • ADM</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <User size={20} color={Colors.dark.textSecondary} />
          </View>
          <Text style={styles.menuText}>Editar Perfil</Text>
          <ChevronRight size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Bell size={20} color={Colors.dark.textSecondary} />
          </View>
          <Text style={styles.menuText}>Notificações</Text>
          <ChevronRight size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Settings size={20} color={Colors.dark.textSecondary} />
          </View>
          <Text style={styles.menuText}>Configurações do App</Text>
          <ChevronRight size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versão 1.0.0 - Desenvolvido por Willian</Text>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'linear-gradient(...)',
    opacity: 0.1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    backgroundColor: Colors.dark.background,
  },
  avatar: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 140, 112, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  roleText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    padding: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  menuIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#444',
    fontSize: 12,
    marginTop: 24,
  },
});