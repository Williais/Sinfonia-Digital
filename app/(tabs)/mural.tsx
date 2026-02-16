import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, RefreshControl 
} from 'react-native';
import { agendaService, Aviso } from '../../services/agenda.service';
import { Megaphone, AlertTriangle, Info, Calendar } from 'lucide-react-native';

export default function MuralScreen() {
  const [loading, setLoading] = useState(true);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarMural();
  }, []);

  async function carregarMural() {
    const dados = await agendaService.getAvisos();
    setAvisos(dados);
    setLoading(false);
    setRefreshing(false);
  }

  const formatarDataRelativa = (isoString: string) => {
    const data = new Date(isoString);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - data.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
  };

  const renderItem = ({ item }: { item: Aviso }) => {
    const isUrgent = item.priority === 'alta';
    
    return (
      <View style={[styles.card, isUrgent && styles.cardUrgent]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, isUrgent ? styles.badgeUrgent : styles.badgeNormal]}>
            {isUrgent ? <AlertTriangle size={12} color="#FFF" /> : <Info size={12} color="#FFF" />}
            <Text style={styles.badgeText}>
              {isUrgent ? 'IMPORTANTE' : 'INFORMATIVO'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatarDataRelativa(item.created_at)}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Mural</Text>
        <Text style={styles.pageSubtitle}>Comunicados da diretoria</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D48C70" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={avisos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarMural(); }} tintColor="#D48C70" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Megaphone size={48} color="#333" />
              <Text style={styles.emptyText}>Nenhum comunicado recente.</Text>
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
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
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
  
  card: {
    backgroundColor: '#151A26',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  badgeNormal: {
    backgroundColor: '#1F2937',
  },
  badgeUrgent: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dateText: {
    color: '#666',
    fontSize: 12,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  }
});