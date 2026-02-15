import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator, 
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { profileService } from '../../services/profile.service';
import { authService } from '../../services/auth.service';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Music,
  Award,
  Calendar,
  Edit3
} from 'lucide-react-native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await profileService.getUserProfile();
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja desconectar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: async () => {
            try {
              await authService.signOut();
              router.replace('/(auth)/login' as any);
            } catch (error: any) {
              Alert.alert("Erro", error.message);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D48C70" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER DO PERFIL */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#D48C70" />
            </View>
          )}
          <TouchableOpacity style={styles.editBadge}>
            <Edit3 size={12} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile?.full_name || "Músico"}</Text>
        
        <View style={styles.roleContainer}>
          <Music size={14} color="#D48C70" />
          <Text style={styles.roleText}>
            {profile?.instrument} • {profile?.section}
          </Text>
        </View>

        {profile?.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}
      </View>

      {/* ESTATÍSTICAS RÁPIDAS (Gamificação Futura) */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Concertos</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>Frequência</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2019</Text>
          <Text style={styles.statLabel}>Desde</Text>
        </View>
      </View>

      {/* MENU DE OPÇÕES */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <User size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuText}>Dados Pessoais</Text>
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Award size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuText}>Minhas Conquistas</Text>
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Settings size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuText}>Configurações</Text>
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* BOTÃO SAIR */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>v2.0.0 (Dark Edition)</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#151A26',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#D48C70',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 140, 112, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D48C70',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D48C70',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#151A26',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 140, 112, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  roleText: {
    color: '#D48C70',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151A26',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 12,
    marginTop: 24,
  },
});