import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl, ActivityIndicator, Alert 
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { agendaService, Evento, Aviso } from '../../services/agenda.service';
import { acervoService, Musica } from '../../services/acervo.service';
import { profileService } from '../../services/profile.service';
import { Bell, Calendar, Music, ChevronRight, AlertTriangle, Trophy, MapPin, Clock, CheckCircle, XCircle, Activity } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados dos Dados
  const [user, setUser] = useState<any>(null);
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [avisoUrgente, setAvisoUrgente] = useState<Aviso | null>(null);
  const [musicaRecente, setMusicaRecente] = useState<Musica | null>(null);
  const [stats, setStats] = useState({ partituras: 0, nivel: 1, xp: 150, frequencia: 98 });

  useFocusEffect(
    useCallback(() => {
      carregarTudo();
    }, [])
  );

  async function carregarTudo() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const perfil = await profileService.getUserProfile();
      setUser(perfil);

      const [eventos, avisos, musicas] = await Promise.all([
        agendaService.getProximosEventos(authUser.id),
        agendaService.getAvisos(),
        acervoService.getAllMusicas()
      ]);

      setProximosEventos(eventos.slice(0, 2));

      const urgente = avisos.find(a => a.priority === 'alta');
      setAvisoUrgente(urgente || null);

      if (musicas.length > 0) {
        setMusicaRecente(musicas[musicas.length - 1]);
        setStats(prev => ({ ...prev, partituras: musicas.length }));
      }

    } catch (e) {
      console.log("Erro Home:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handlePresenca(evento: Evento, status: 'confirmado' | 'ausente') {
    if (!user?.id) return;

    const listaAtualizada = proximosEventos.map(e => {
      if (e.id === evento.id) return { ...e, my_status: status };
      return e;
    });
    setProximosEventos(listaAtualizada);

    try {
      await agendaService.confirmarPresenca(evento.id, user.id, status);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar presença.");
      carregarTudo();
    }
  }

  const getDataBadge = (isoDate: string) => {
    const data = new Date(isoDate);
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) return "HOJE";
    if (data.toDateString() === amanha.toDateString()) return "AMANHÃ";
    
    const dia = data.getDate();
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${dia} ${meses[data.getMonth()]}`;
  }

  const renderHeroEvent = (evento: Evento) => {
    const dataObj = new Date(evento.date);
    const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.heroCard}>

        <View style={styles.heroHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{getDataBadge(evento.date)}</Text>
          </View>
          <Text style={{color: '#666', fontWeight: 'bold', fontSize: 20}}>⋮</Text> 
        </View>


        <Text style={styles.heroTitle}>{evento.title}</Text>
        <Text style={styles.heroSubtitle}>
          {evento.description || (evento.type === 'ensaio' ? 'Ensaio Regular' : 'Repertório da Temporada')}
        </Text>

        <View style={styles.heroInfoRow}>
          <View style={styles.heroPill}>
            <Clock size={14} color="#D48C70" />
            <Text style={styles.heroPillText}>{hora}</Text>
          </View>
          <View style={styles.heroPill}>
            <MapPin size={14} color="#D48C70" />
            <Text style={styles.heroPillText}>{evento.location}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, evento.my_status === 'confirmado' ? styles.btnConfirmado : styles.btnOutline]}
            onPress={() => handlePresenca(evento, 'confirmado')}
          >
            <CheckCircle size={16} color={evento.my_status === 'confirmado' ? "#FFF" : "#10B981"} />
            <Text style={[styles.actionBtnText, evento.my_status === 'confirmado' && {color: '#FFF'}]}>Vou</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, evento.my_status === 'ausente' ? styles.btnAusente : styles.btnOutline]}
            onPress={() => handlePresenca(evento, 'ausente')}
          >
            <XCircle size={16} color={evento.my_status === 'ausente' ? "#FFF" : "#EF4444"} />
            <Text style={[styles.actionBtnText, evento.my_status === 'ausente' && {color: '#FFF'}]}>Não vou</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSecondEvent = (evento: Evento) => {
    const dataObj = new Date(evento.date);
    const dia = dataObj.getDate();
    const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
    
    return (
      <View style={{marginTop: 16}}>
        <Text style={styles.sectionLabelSmall}>EM BREVE</Text>
        <TouchableOpacity style={styles.secondEventCard} onPress={() => router.push('/(tabs)/agenda')}>
          <View style={styles.secondDateBox}>
            <Text style={styles.secondDateDay}>{dia}</Text>
            <Text style={styles.secondDateMonth}>{mes}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.secondTitle}>{evento.title}</Text>
            <Text style={styles.secondSubtitle}>{evento.type.toUpperCase()} • {evento.location}</Text>
          </View>
          <ChevronRight size={16} color="#666" />
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <View style={styles.container}><ActivityIndicator color="#D48C70" style={{marginTop: 50}} /></View>;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarTudo(); }} tintColor="#D48C70"/>}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />


      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nickname || 'Músico'}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Text style={styles.subGreeting}>{user?.instrument || 'Instrumentista'}</Text>
            
            {(user?.is_spalla) && <View style={styles.roleBadge}><Text style={styles.roleText}>SPALLA</Text></View>}
            {(user?.is_section_leader && !user?.is_spalla) && <View style={styles.roleBadge}><Text style={styles.roleText}>CHEFE DE NAIPE</Text></View>}
            {(user?.role === 'admin' || user?.role === 'maestro') && <View style={styles.roleBadge}><Text style={styles.roleText}>{user.role.toUpperCase()}</Text></View>}
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
          <Image source={{ uri: user?.avatar_url || 'https://github.com/shadcn.png' }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
            <Trophy size={20} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.xp} XP</Text>
            <Text style={styles.statLabel}>Nível {stats.nivel}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Activity size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.frequencia}%</Text>
            <Text style={styles.statLabel}>Frequência</Text>
          </View>
        </View>
      </View>

      {avisoUrgente && (
        <View style={styles.urgentNoticeBox}>
          <View style={styles.urgentHeader}>
            <AlertTriangle size={18} color="#EF4444" />
            <Text style={styles.urgentTitle}>COMUNICADO IMPORTANTE</Text>
          </View>
          <Text style={styles.urgentSubject}>{avisoUrgente.title}</Text>
          <Text style={styles.urgentContent}>{avisoUrgente.content}</Text>
        </View>
      )}

      <View style={{marginTop: 20}}>
        {proximosEventos.length > 0 ? (
          <>
            {renderHeroEvent(proximosEventos[0])}
            {proximosEventos.length > 1 && renderSecondEvent(proximosEventos[1])}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={32} color="#666" />
            <Text style={styles.emptyText}>Agenda livre por enquanto.</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>NOVIDADE NO ACERVO</Text>
      {musicaRecente ? (
        <TouchableOpacity style={styles.musicCard} onPress={() => router.push(`/acervo/${musicaRecente.id}`)}>
           <View style={styles.musicIcon}><Music size={24} color="#D48C70" /></View>
           <View style={{flex: 1}}>
             <Text style={styles.musicTitle}>{musicaRecente.title}</Text>
             <Text style={styles.musicSubtitle}>{musicaRecente.arranger}</Text>
           </View>
           <ChevronRight size={16} color="#4B5563" />
        </TouchableOpacity>
      ) : (
        <Text style={styles.emptyText}>Nenhuma música recente.</Text>
      )}

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20 },
  header: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subGreeting: { fontSize: 14, color: '#9CA3AF' },
  roleBadge: { backgroundColor: 'rgba(212, 140, 112, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { color: '#D48C70', fontSize: 10, fontWeight: 'bold' },
  avatar: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#333' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#151A26', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 11, color: '#666' },

  urgentNoticeBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  urgentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  urgentTitle: { color: '#EF4444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  urgentSubject: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  urgentContent: { color: '#FECACA', fontSize: 13, lineHeight: 20 },

  heroCard: { backgroundColor: '#151A26', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dateBadge: { borderWidth: 1, borderColor: '#D48C70', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dateBadgeText: { color: '#D48C70', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  heroInfoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  heroPill: { backgroundColor: '#0B0F19', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  heroPillText: { color: '#CCC', fontSize: 12 },
  
  actionButtonsContainer: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  btnOutline: { borderColor: '#333', backgroundColor: 'transparent' },
  btnConfirmado: { backgroundColor: '#10B981', borderColor: '#10B981' },
  btnAusente: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  actionBtnText: { color: '#888', fontWeight: 'bold', fontSize: 12 },

  sectionLabelSmall: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  secondEventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A26', borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  secondDateBox: { alignItems: 'center', justifyContent: 'center', width: 40, backgroundColor: '#0B0F19', borderRadius: 8, paddingVertical: 6 },
  secondDateDay: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  secondDateMonth: { fontSize: 9, fontWeight: 'bold', color: '#666' },
  secondTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  secondSubtitle: { fontSize: 11, color: '#666' },

  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  musicCard: { backgroundColor: '#151A26', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  musicIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(212, 140, 112, 0.1)', justifyContent: 'center', alignItems: 'center' },
  musicTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  musicSubtitle: { fontSize: 12, color: '#666' },
  emptyState: { backgroundColor: '#151A26', borderRadius: 16, padding: 24, alignItems: 'center', gap: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  emptyText: { color: '#666' }
});