import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator, 
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { profileService } from '../../services/profile.service';
import { authService } from '../../services/auth.service';
import { 
  Settings, 
  Edit3, 
  LogOut, 
  Award, 
  User, 
  Bell, 
  Music
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
      "Encerrar Sessão",
      "Deseja realmente sair do aplicativo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: async () => {
            await authService.signOut();
            router.replace('/(auth)/login' as any);
          }
        }
      ]
    );
  }

  const renderBadges = () => {
    if (!profile) return null;
    
    return (
      <View style={styles.badgeContainer}>

        <View style={styles.badgeInstrument}>
          <Text style={styles.badgeText}>{profile.instrument?.toUpperCase() || "MÚSICO"}</Text>
        </View>

        {profile.is_spalla && (
          <View style={styles.badgeRole}>
            <Text style={styles.badgeTextActive}>SPALLA</Text>
          </View>
        )}
        {!profile.is_spalla && profile.is_section_leader && (
          <View style={styles.badgeRole}>
            <Text style={styles.badgeTextActive}>CHEFE DE NAIPE</Text>
          </View>
        )}
        {profile.role === 'admin' || profile.role === 'maestro' && (
           <View style={styles.badgeRole}>
           <Text style={styles.badgeTextActive}>{profile.role.toUpperCase()}</Text>
         </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D48C70" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      <View style={styles.header}>
        {renderBadges()}

        <View style={styles.profileRow}>

          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#666" />
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
             <TouchableOpacity style={styles.iconButton}>
                <Edit3 size={20} color="#888" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton}>
                <Settings size={20} color="#888" />
             </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.name}>{profile?.full_name}</Text>
        
        <Text style={styles.bio}>
          {profile?.bio || '"Músico dedicado, apaixonado por harmonia e sempre em busca do tom perfeito."'}
        </Text>
      </View>


      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>PARTITURAS</Text> 
          
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={[styles.statValue, { color: '#D48C70' }]}>98%</Text>
          <Text style={styles.statLabel}>FREQUÊNCIA</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.year_joined || '2024'}</Text>
          <Text style={styles.statLabel}>DESDE</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>CENTRAL DO MÚSICO</Text>
      
      <View style={styles.gridContainer}>

        <TouchableOpacity style={styles.gridCard}>
          <View style={styles.cardIconBg}>
            <Award size={24} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Conquistas</Text>
            <Text style={styles.cardSubtitle}>Ver medalhas</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.gridCard}>
           <View style={[styles.cardIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <User size={24} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Dados</Text>
            <Text style={styles.cardSubtitle}>Editar info</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard}>
           <View style={[styles.cardIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <Bell size={24} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Avisos</Text>
            <Text style={styles.cardSubtitle}>Mural pessoal</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard}>
           <View style={[styles.cardIconBg, { backgroundColor: 'rgba(212, 140, 112, 0.1)' }]}>
            <Music size={24} color="#D48C70" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Instrumento</Text>
            <Text style={styles.cardSubtitle}>
              {profile?.instrument_ownership === 'proprio' ? 'Próprio' : 'C.E.F.E.C.'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
        <LogOut size={18} color="#FF6B6B" />
      </TouchableOpacity>

      <Text style={styles.idText}>Seu ID: {profile?.id?.slice(0, 8).toUpperCase()}</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badgeInstrument: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  badgeRole: {
    backgroundColor: 'rgba(212, 140, 112, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D48C70',
  },
  badgeText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badgeTextActive: {
    color: '#D48C70',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#151A26',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bio: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1F2937',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  sectionTitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  gridCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: '#151A26',
    borderRadius: 20,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },

  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  idText: {
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 10,
  }
});