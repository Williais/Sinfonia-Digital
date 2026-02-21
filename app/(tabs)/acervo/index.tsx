import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { acervoService, Musica } from '../../../services/acervo.service';
import { PlayCircle, ChevronRight, Library, Music, Wind } from 'lucide-react-native';

export default function AcervoDashboard() {
  const router = useRouter();
  const [recentes, setRecentes] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);
    try {
      const todas = await acervoService.getAllMusicas();

      const ultimas = todas.sort((a, b) => b.id - a.id).slice(0, 5);
      setRecentes(ultimas);
    } catch (error) {
      console.log("Erro ao carregar recentes:", error);
    } finally {
      setLoading(false);
    }
  }

  const CategoryCard = ({ title, count, color, icon: Icon, filter }: any) => (
    <TouchableOpacity 
      style={[styles.catCard, { backgroundColor: color }]}
      onPress={() => router.push({ pathname: '/acervo/lista', params: { category: filter } })}
    >
      <View style={styles.catIconBox}>
        <Icon size={24} color="#FFF" />
      </View>
      <View>
        <Text style={styles.catTitle}>{title}</Text>
        <Text style={styles.catCount}>{count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Acervo Digital</Text>
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push({ pathname: '/acervo/lista', params: { category: 'all' } })}>
           <Text style={styles.searchText}>Buscar obras, arranjadores...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <CategoryCard 
          title="Cordas" 
          count="Violinos, Cellos..." 
          color="rgba(59, 130, 246, 0.15)"
          icon={Music} 
          filter="cordas"
        />
        <CategoryCard 
          title="Sopros" 
          count="Flautas, Metais..." 
          color="rgba(16, 185, 129, 0.15)"
          icon={Wind} 
          filter="sopros"
        />
        <CategoryCard 
          title="Percussão" 
          count="Bateria, Tímpanos..." 
          color="rgba(239, 68, 68, 0.15)"
          icon={Music} 
          filter="percussão"
        />
        <CategoryCard 
          title="Acervo Completo" 
          count="Ver tudo" 
          color="rgba(212, 140, 112, 0.15)"
          icon={Library} 
          filter="all"
        />
      </View>

      <Text style={styles.sectionTitle}>ADICIONADOS RECENTEMENTE</Text>
      
      {loading ? (
        <ActivityIndicator color="#D48C70" style={{marginTop: 20}} />
      ) : (
        <View style={styles.recentList}>
          {recentes.length > 0 ? (
            recentes.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recentItem}
                onPress={() => router.push(`/acervo/${item.id}`)}
              >
                <View style={styles.recentLeft}>
                   <View style={styles.playIconContainer}>
                     <PlayCircle size={20} color="#9CA3AF" />
                   </View>
                   <View>
                     <Text style={styles.recentTitle}>{item.title}</Text>
                     <Text style={styles.recentSubtitle}>{item.arranger || 'Arranjo desconhecido'}</Text>
                   </View>
                </View>
                <ChevronRight size={16} color="#4B5563" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Nenhuma música no acervo ainda.</Text>
          )}
        </View>
      )}

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  
  searchBar: {
    backgroundColor: '#151A26', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#222'
  },
  searchText: { color: '#666', fontSize: 16 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  catCard: {
    width: '48%', padding: 16, borderRadius: 16,
    height: 110, justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  catIconBox: { width: 32, height: 32 },
  catTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  catCount: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 },
  recentList: { gap: 12 },
  recentItem: {
    backgroundColor: '#151A26', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playIconContainer: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: '#1E2433',
    justifyContent: 'center', alignItems: 'center'
  },
  recentTitle: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  recentSubtitle: { color: '#6B7280', fontSize: 12 }
});