import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, RefreshControl, TouchableOpacity
} from 'react-native';
import { agendaService, Evento } from '../../../services/agenda.service';
import { MapPin, Clock, CheckCircle, Filter } from 'lucide-react-native';

export default function AgendaScreen() {
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<Evento[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filtro, setFiltro] = useState<'todos' | 'ensaio' | 'concerto' | 'apresentacao'>('todos');
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    carregarAgenda();
  }, []);

  useEffect(() => {
    if (filtro === 'todos') {
      setEventosFiltrados(eventos);
    } else {
      setEventosFiltrados(eventos.filter(e => e.type === filtro));
    }
  }, [filtro, eventos]);

  async function carregarAgenda() {
    const dados = await agendaService.getProximosEventos();
    setEventos(dados);
    setLoading(false);
    setRefreshing(false);
  }

  const togglePresenca = (id: string) => {
    setPresencas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatarData = (isoString: string) => {
    const data = new Date(isoString);
    const dia = data.getDate().toString().padStart(2, '0');
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mes = meses[data.getMonth()];
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][data.getDay()];
    return { dia, mes, hora, diaSemana };
  };

  const FilterChip = ({ label, type }: { label: string, type: typeof filtro }) => (
    <TouchableOpacity 
      style={[styles.chip, filtro === type && styles.chipActive]} 
      onPress={() => setFiltro(type)}
    >
      <Text style={[styles.chipText, filtro === type && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: Evento, index: number }) => {
    const { dia, mes, hora, diaSemana } = formatarData(item.date);
    const confirmado = presencas[item.id];
    const isLast = index === eventosFiltrados.length - 1;

    const isConcerto = item.type === 'concerto';
    const isApresentacao = item.type === 'apresentacao';

    let typeColor = '#666';
    let typeLabel = 'ENSAIO';

    if (isConcerto) {
      typeColor = '#D48C70';
      typeLabel = '♫ CONCERTO';
    } else if (isApresentacao) {
      typeColor = '#A855F7';
      typeLabel = '★ APRESENTAÇÃO';
    }

    return (
      <View style={styles.timelineRow}>
        <View style={styles.leftCol}>
          <Text style={styles.dateDay}>{dia}</Text>
          <Text style={styles.dateMonth}>{mes}</Text>
        </View>

        <View style={styles.timelineCol}>

          <View style={[
            styles.dot, 
            isConcerto && styles.dotConcerto,
            isApresentacao && styles.dotApresentacao
          ]} />
          {!isLast && <View style={styles.line} />}
        </View>

        <View style={styles.rightCol}>
          <View style={[
            styles.card,
            isConcerto && styles.cardConcerto,
            isApresentacao && styles.cardApresentacao
          ]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.typeText, { color: typeColor }]}>
                {typeLabel} • {diaSemana}
              </Text>
              {confirmado && <CheckCircle size={14} color="#10B981" />}
            </View>

            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.detailsRow}>
              <View style={styles.infoTag}>
                <Clock size={12} color="#9CA3AF" />
                <Text style={styles.infoText}>{hora}</Text>
              </View>
              <View style={styles.infoTag}>
                <MapPin size={12} color="#9CA3AF" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
            </View>

            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.checkInButton, confirmado && styles.checkInActive]}
                onPress={() => togglePresenca(item.id)}
              >
                <Text style={[styles.checkInText, confirmado && { color: '#FFF' }]}>
                  {confirmado ? 'Presença Confirmada' : 'Confirmar Presença'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Agenda</Text>
        <Text style={styles.pageSubtitle}>Próximos eventos da orquestra</Text>
      </View>

      <View style={{height: 50}}>
        <FlatList 
          horizontal
          data={['todos', 'ensaio', 'apresentacao', 'concerto']}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const labels: any = { todos: 'Todos', ensaio: 'Ensaios', apresentacao: 'Apresentações', concerto: 'Concertos' };
            return <FilterChip label={labels[item]} type={item as any} />;
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D48C70" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={eventosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarAgenda(); }} tintColor="#D48C70" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Filter size={48} color="#333" />
              <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#151A26',
    borderWidth: 1,
    borderColor: '#333',
    height: 36,
  },
  chipActive: {
    backgroundColor: 'rgba(212, 140, 112, 0.2)',
    borderColor: '#D48C70',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chipTextActive: {
    color: '#D48C70',
  },

  // TIMELINE
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0, 
  },
  leftCol: {
    width: 50,
    alignItems: 'center',
    paddingTop: 10,
  },
  dateDay: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  dateMonth: { fontSize: 12, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  
  timelineCol: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    marginTop: 18, 
    borderWidth: 2,
    borderColor: '#0B0F19',
    zIndex: 2,
  },
  dotConcerto: {
    backgroundColor: '#D48C70',
    width: 14, height: 14, borderRadius: 7,
  },
  dotApresentacao: {
    backgroundColor: '#A855F7',
    width: 14, height: 14, borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#1F2937',
    marginTop: -2,
    marginBottom: -18,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 24, 
  },

  card: {
    backgroundColor: '#151A26',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardConcerto: {
    borderColor: 'rgba(212, 140, 112, 0.4)',
    backgroundColor: 'rgba(212, 140, 112, 0.05)',
  },
  cardApresentacao: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  typeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: '#9CA3AF', fontSize: 12 },
  description: { color: '#555', fontSize: 12, fontStyle: 'italic', marginBottom: 12, lineHeight: 18 },
  
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  checkInButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: '#333',
  },
  checkInActive: {
    backgroundColor: '#10B981', 
    borderColor: '#10B981',
  },
  checkInText: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#666', fontSize: 16 }
});