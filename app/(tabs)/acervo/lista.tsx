import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // <--- useLocalSearchParams é importante
import { acervoService, Musica } from '../../../services/acervo.service';
import { Search, Music, FileText, PlayCircle, ChevronLeft } from 'lucide-react-native';

export default function AcervoScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams(); // Recebe: "Cordas", "Sopros", etc.

  const [loading, setLoading] = useState(true);
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [filteredMusicas, setFilteredMusicas] = useState<Musica[]>([]);
  const [searchText, setSearchText] = useState('');

  // Título da página muda conforme o filtro
  const pageTitle = category && category !== 'all' ? category.toString() : 'Acervo Completo';

  useEffect(() => {
    carregarAcervo();
  }, [category]); // Recarrega se a categoria mudar

  async function carregarAcervo() {
    setLoading(true);
    const dados = await acervoService.getAllMusicas();
    setMusicas(dados);
    
    // APLICAR O FILTRO DE CATEGORIA AQUI
    if (category && category !== 'all') {
      const cat = category.toString().toLowerCase();
      const filtradosPorCat = dados.filter(m => verificarCategoria(m, cat));
      setFilteredMusicas(filtradosPorCat);
    } else {
      setFilteredMusicas(dados);
    }
    
    setLoading(false);
  }

  // Lógica inteligente: Verifica se a música tem instrumentos daquela família
  function verificarCategoria(musica: Musica, categoria: string): boolean {
    // Se não tem partituras, não entra na categoria específica
    if (!musica.partiturasPaths) return false;

    // Pega a lista de instrumentos cadastrados (chaves do objeto)
    // Ex: ["Violino I", "Cello", "Flauta"]
    const instrumentos = Object.keys(musica.partiturasPaths).map(i => i.toLowerCase());
    const titulo = musica.title.toLowerCase();

    if (categoria === 'cordas') {
      return instrumentos.some(i => i.includes('violino') || i.includes('viola') || i.includes('cello') || i.includes('baixo') || i.includes('contrabaixo'));
    }
    if (categoria === 'sopros') {
      return instrumentos.some(i => i.includes('flauta') || i.includes('clarinete') || i.includes('oboé') || i.includes('fagote') || i.includes('trompa') || i.includes('trompete') || i.includes('trombone') || i.includes('tuba') || i.includes('sax'));
    }
    if (categoria === 'percussão') {
      return instrumentos.some(i => i.includes('tímpano') || i.includes('caixa') || i.includes('prato') || i.includes('bateria') || i.includes('percussão'));
    }
    
    return true;
  }

  function handleSearch(text: string) {
    setSearchText(text);
    // Filtra sobre a lista original COMPLETA (ignorando categoria para busca global)
    // OU filtra sobre a lista da categoria atual. Aqui faremos sobre a categoria atual:
    const baseList = (category && category !== 'all') 
      ? musicas.filter(m => verificarCategoria(m, category.toString().toLowerCase())) 
      : musicas;

    if (text === '') {
      setFilteredMusicas(baseList);
    } else {
      const filtrado = baseList.filter(m => 
        m.title.toLowerCase().includes(text.toLowerCase()) || 
        m.arranger.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMusicas(filtrado);
    }
  }

  const renderItem = ({ item }: { item: Musica }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/acervo/${item.id}`)}>
      <View style={styles.cardIcon}>
        <Music size={24} color="#D48C70" />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardArranger}>{item.arranger}</Text>
        
        <View style={styles.badgesRow}>
          {item.audioPath && (
            <View style={styles.badge}>
              <PlayCircle size={10} color="#666" />
              <Text style={styles.badgeText}>Áudio</Text>
            </View>
          )}
          {item.partiturasPaths && (
            <View style={styles.badge}>
              <FileText size={10} color="#666" />
              <Text style={styles.badgeText}>{Object.keys(item.partiturasPaths).length} Parts.</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        {/* Botão Voltar (aparece se tiver filtro) */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <ChevronLeft size={24} color="#FFF" />
           <Text style={styles.pageTitle}>{pageTitle}</Text>
        </TouchableOpacity>
        <Text style={styles.pageSubtitle}>Biblioteca da Orquestra Filarmônica</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar nesta lista..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D48C70" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredMusicas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma obra encontrada nesta categoria.</Text>
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
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: -8, // Ajuste para alinhar o ícone
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
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151A26',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#151A26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 140, 112, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardArranger: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  }
});