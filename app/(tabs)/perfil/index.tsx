import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { profileService } from '../../../services/profile.service';
import { LogOut, Settings, Award, Clock, Handshake, Zap, Timer, BookOpen, Megaphone, Star, ShieldCheck } from 'lucide-react-native';

const IconMap: any = {
  Clock: Clock, ShieldCheck: ShieldCheck, Handshake: Handshake, Award: Award,
  Zap: Zap, Timer: Timer, BookOpen: BookOpen, Megaphone: Megaphone, Star: Star
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    try {
      const userProfile = await profileService.getUserProfile();
      setProfile(userProfile);

      const userStats = await profileService.getUserStats();
      setStats(userStats);

      const rankData = await profileService.getRankingFrequencia();
      setRanking(rankData);

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userProfile.id);
      setBadges(userBadges || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  const getLevelColor = (level: number) => {
    if (level <= 3) return '#CD7F32';
    if (level <= 6) return '#60A5FA';
    if (level <= 9) return '#F59E0B';
    if (level === 10) return '#22D3EE';
    return '#D48C70';
  };

  const getLevelName = (level: number) => {
    if (level <= 3) return 'Iniciante';
    if (level <= 6) return 'Intermediário';
    if (level <= 9) return 'Avançado';
    if (level === 10) return 'Virtuoso';
    return 'Lenda';
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#D48C70" /></View>;

  const levelColor = getLevelColor(stats?.level || 1);
  const xpAtual = stats?.xp || 0;
  const progresso = (xpAtual % 500) / 500;

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>Meu Perfil</Text>
          <View style={{flexDirection: 'row', gap: 16}}>
            <TouchableOpacity onPress={() => router.push('/perfil/editar')}>
              <Settings size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <LogOut size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Image source={{ uri: profile?.avatar_url || 'https://github.com/shadcn.png' }} style={[styles.avatar, { borderColor: levelColor }]} />
          <View>
            <Text style={styles.name}>{profile?.nickname || 'Músico'}</Text>
            <Text style={styles.instrument}>{profile?.instrument} • {profile?.role === 'admin' ? 'Maestro/Admin' : 'Músico'}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColor + '20', borderColor: levelColor }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>Nível {stats?.level} • {getLevelName(stats?.level)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>XP Total: {xpAtual}</Text>
            <Text style={styles.xpLabel}>Próx. Nível: {500 - (xpAtual % 500)} XP</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progresso * 100}%`, backgroundColor: levelColor }]} />
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.concerts_attended || 0}</Text>
          <Text style={styles.statLabel}>Concertos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.rehearsals_attended || 0}</Text>
          <Text style={styles.statLabel}>Ensaios</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{badges.length}</Text>
          <Text style={styles.statLabel}>Selos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>MEUS SELOS E CONQUISTAS</Text>
      
      {badges.length > 0 ? (
        <View style={styles.badgesGrid}>
          {badges.map((item) => {
            const IconComponent = IconMap[item.badges.icon_name] || Award;
            return (
              <View key={item.id} style={styles.badgeCard}>
                <View style={styles.badgeIconBg}><IconComponent size={24} color="#FFD700" /></View>
                <Text style={styles.badgeName}>{item.badges.name}</Text>
                <Text style={styles.badgeDesc}>{item.badges.description}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBadges}>
          <Award size={48} color="#333" />
          <Text style={styles.emptyText}>Participe dos eventos para ganhar selos!</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>RANKING DE FREQUÊNCIA (MÊS)</Text>
      <View style={styles.rankingCard}>
        {ranking.map((item, index) => (
          <View key={item.id}>
            <View style={styles.rankingRow}>
              <Text style={[styles.rankPos, index === 2 && {color: '#CD7F32'}]}>{index + 1}º</Text>
              <Text style={styles.rankName}>{item.naipe}</Text>
              <Text style={styles.rankValue}>{item.score}</Text>
            </View>
            {index !== ranking.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  instrument: { fontSize: 14, color: '#BBB', marginBottom: 6 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  levelText: { fontSize: 12, fontWeight: 'bold' },
  xpContainer: { marginTop: 0 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { color: '#888', fontSize: 12 },
  progressBarBg: { height: 8, backgroundColor: '#1F2937', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: '#151A26', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: '#666' },
  sectionTitle: { paddingHorizontal: 20, color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 30 },
  badgeCard: { width: '48%', backgroundColor: '#151A26', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badgeIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  badgeName: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  badgeDesc: { color: '#888', fontSize: 10, textAlign: 'center' },
  emptyBadges: { alignItems: 'center', gap: 10, padding: 20, marginBottom: 30 },
  emptyText: { color: '#666', fontStyle: 'italic' },
  rankingCard: { marginHorizontal: 20, backgroundColor: '#151A26', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  rankingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rankPos: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#FFD700' },
  rankName: { flex: 1, color: '#FFF', fontSize: 14 },
  rankValue: { color: '#D48C70', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#222' }
});