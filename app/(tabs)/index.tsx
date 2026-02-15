import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { profileService } from '../../services/profile.service';
import { 
  User, 
  Clock, 
  MapPin, 
  BookOpen, 
  ChevronRight, 
  MoreVertical,
  PlayCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const data = await profileService.getUserProfile();
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D48C70" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Bem-vindo de volta,</Text>
          <Text style={styles.userName}>
            {profile?.nickname || profile?.full_name || 'Willian José'}
          </Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/(tabs)/perfil' as any)}>
            {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <User size={20} color="#FFF" />
                </View>
            )}
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HOJE</Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroTitle}>Sinfonia No. 5</Text>
        <Text style={styles.heroSubtitle}>Ludwig van Beethoven</Text>

        <View style={styles.heroFooter}>
          <View style={styles.heroInfoItem}>
            <Clock size={16} color="#D48C70" /> 
            <Text style={styles.heroInfoText}>19:00</Text>
          </View>
          <View style={styles.heroInfoItem}>
            <MapPin size={16} color="#D48C70" />
            <Text style={styles.heroInfoText}>Teatro CEFEC</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Clock size={20} color="#60A5FA" />
          </View>
          <View>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Frequência</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <BookOpen size={20} color="#C084FC" />
          </View>
          <View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Novas Partituras</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COMUNICADOS RECENTES</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Ver Todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.announcementList}>
        <TouchableOpacity style={styles.noticeCard}>
            <View style={[styles.noticeIndicator, { backgroundColor: '#D48C70' }]} />
            <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Alteração de Pauta</Text>
                <Text style={styles.noticePreview} numberOfLines={1}>
                    Adicionada a obra O Guarani para o próximo ensaio.
                </Text>
            </View>
            <Text style={styles.noticeTime}>30 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.noticeCard}>
            <View style={[styles.noticeIndicator, { backgroundColor: '#EF4444' }]} />
            <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Cancelamento</Text>
                <Text style={styles.noticePreview} numberOfLines={1}>
                    Ensaio de sopros cancelado.
                </Text>
            </View>
            <Text style={styles.noticeTime}>Há 2h</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ADICIONADOS RECENTEMENTE</Text>
      </View>

      <View style={styles.recentList}>
        {[1, 2, 3].map((i) => (
            <TouchableOpacity key={i} style={styles.recentItem}>
                <View style={styles.recentLeft}>
                    <View style={styles.playIconContainer}>
                        <PlayCircle size={20} color="#9CA3AF" />
                    </View>
                    <View>
                        <Text style={styles.recentTitle}>Concerto para Violino</Text>
                        <Text style={styles.recentSubtitle}>Tchaikovsky</Text>
                    </View>
                </View>
                <ChevronRight size={16} color="#4B5563" />
            </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B0F19',
    paddingHorizontal: 24 
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'System',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    borderColor: '#D48C70',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#151A26',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#151A26',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(212, 140, 112, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 140, 112, 0.2)',
  },
  badgeText: {
    color: '#D48C70',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 24,
  },
  heroFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  heroInfoText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#151A26',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAllText: {
    color: '#D48C70',
    fontSize: 12,
    fontWeight: '600',
  },
  announcementList: {
    gap: 12,
    marginBottom: 32,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#151A26',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 16,
  },
  noticeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  noticePreview: {
    color: '#6B7280',
    fontSize: 12,
  },
  noticeTime: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
  },
  recentList: {
      gap: 12,
  },
  recentItem: {
      backgroundColor: '#151A26',
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  recentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  playIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#1E2433',
      justifyContent: 'center',
      alignItems: 'center',
  },
  recentTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
  },
  recentSubtitle: {
      color: '#6B7280',
      fontSize: 12,
  }
});