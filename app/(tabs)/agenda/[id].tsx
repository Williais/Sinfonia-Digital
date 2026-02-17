import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { agendaService, Evento } from '../../../services/agenda.service';
import { supabase } from '../../../lib/supabase';
import { MapPin, Clock, ChevronLeft, CheckCircle, XCircle, Users } from 'lucide-react-native';

export default function EventoDetalhesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [stats, setStats] = useState({ confirmados: 0, ausentes: 0 });
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setMyId(user?.id || null);

      // 1. Busca o Evento (Reutilizamos a lista de próximos para pegar 1, ou criamos um getById)
      // Como não criamos getById no service, vamos buscar todos e filtrar (rápido para poucos eventos)
      // O ideal seria criar um getEventById(id) no service.
      const eventos = await agendaService.getProximosEventos(user?.id || '');
      const ev = eventos.find(e => e.id === id);
      setEvento(ev || null);

      // 2. Busca Participantes
      const parts = await agendaService.getParticipantes(id as string);
      setParticipantes(parts);

      // 3. Calcula Stats
      const confirmados = parts.filter(p => p.status === 'confirmado').length;
      const ausentes = parts.filter(p => p.status === 'ausente').length;
      setStats({ confirmados, ausentes });

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePresenca(status: 'confirmado' | 'ausente') {
    if (!evento || !myId) return;

    // Atualiza Visualmente (Otimista)
    setEvento(prev => prev ? { ...prev, my_status: status } : null);
    
    try {
      await agendaService.confirmarPresenca(evento.id, myId, status);
      carregarDados(); // Recarrega para atualizar a lista de nomes
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  }

  // Agrupar por Instrumento
  const getAgrupados = () => {
    const grupos: Record<string, any[]> = {};
    participantes.forEach(p => {
      if (p.status === 'confirmado') {
        const inst = p.instrument || 'Outros';
        if (!grupos[inst]) grupos[inst] = [];
        grupos[inst].push(p);
      }
    });
    return grupos;
  };

  const grupos = getAgrupados();

  if (loading) return <View style={styles.center}><ActivityIndicator color="#D48C70" /></View>;
  if (!evento) return <View style={styles.center}><Text style={{color:'#666'}}>Evento não encontrado</Text></View>;

  const data = new Date(evento.date);

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Header com Voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Título e Info */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>{evento.title}</Text>
        <Text style={styles.typeBadge}>{evento.type.toUpperCase()}</Text>
        
        <View style={styles.infoRow}>
          <Clock size={16} color="#D48C70" />
          <Text style={styles.infoText}>
            {data.toLocaleDateString('pt-BR')} às {data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}h
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#D48C70" />
          <Text style={styles.infoText}>{evento.location}</Text>
        </View>

        {evento.description && (
          <Text style={styles.description}>{evento.description}</Text>
        )}
      </View>

      {/* MEU STATUS (Botões Grandes) */}
      <Text style={styles.sectionTitle}>SUA PARTICIPAÇÃO</Text>
      <View style={styles.myStatusRow}>
        <TouchableOpacity 
          style={[styles.statusBtn, evento.my_status === 'confirmado' ? styles.btnConfirmado : styles.btnOutline]}
          onPress={() => handlePresenca('confirmado')}
        >
          <CheckCircle size={20} color={evento.my_status === 'confirmado' ? "#FFF" : "#10B981"} />
          <Text style={[styles.btnText, evento.my_status === 'confirmado' && {color:'#FFF'}]}>Confirmar Presença</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusBtn, evento.my_status === 'ausente' ? styles.btnAusente : styles.btnOutline]}
          onPress={() => handlePresenca('ausente')}
        >
          <XCircle size={20} color={evento.my_status === 'ausente' ? "#FFF" : "#EF4444"} />
          <Text style={[styles.btnText, evento.my_status === 'ausente' && {color:'#FFF'}]}>Não Vou</Text>
        </TouchableOpacity>
      </View>

      {/* RESUMO (DASHBOARD) */}
      <Text style={styles.sectionTitle}>RESUMO DA ORQUESTRA</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: '#10B981'}]}>{stats.confirmados}</Text>
          <Text style={styles.statLabel}>Confirmados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: '#EF4444'}]}>{stats.ausentes}</Text>
          <Text style={styles.statLabel}>Ausentes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: '#F59E0B'}]}>?</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* LISTA DE PRESENÇA POR NAIPE */}
      <Text style={styles.sectionTitle}>LISTA DE PRESENÇA</Text>
      
      {Object.keys(grupos).length > 0 ? (
        Object.entries(grupos).map(([instrumento, pessoas]) => (
          <View key={instrumento} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Users size={16} color="#D48C70" />
              <Text style={styles.groupTitle}>{instrumento} ({pessoas.length})</Text>
            </View>
            
            {pessoas.map((p, index) => (
              <View key={p.id} style={[styles.personRow, index !== pessoas.length - 1 && styles.borderBottom]}>
                <Image source={{ uri: p.avatar || 'https://github.com/shadcn.png' }} style={styles.avatar} />
                <Text style={styles.personName}>{p.name}</Text>
                <CheckCircle size={14} color="#10B981" />
              </View>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Ninguém confirmou ainda. Seja o primeiro!</Text>
      )}

      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  center: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' },
  
  header: { marginTop: 40, marginBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 16, marginLeft: 8 },

  titleSection: { marginBottom: 30 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  typeBadge: { color: '#D48C70', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { color: '#CCC', fontSize: 16 },
  description: { color: '#888', fontSize: 14, marginTop: 16, lineHeight: 22, fontStyle: 'italic' },

  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 10 },

  // My Status
  myStatusRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  btnOutline: { borderColor: '#333', backgroundColor: 'transparent' },
  btnConfirmado: { backgroundColor: '#10B981', borderColor: '#10B981' },
  btnAusente: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  btnText: { color: '#888', fontWeight: 'bold' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#151A26', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#666', fontSize: 12 },

  // List Groups
  groupCard: { backgroundColor: '#151A26', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  groupTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  personName: { color: '#DDD', flex: 1, fontSize: 14 },
  
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});