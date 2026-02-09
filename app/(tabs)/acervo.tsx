import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Search, Music, PlayCircle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  { 
    id: 1, 
    name: 'Violinos', 
    count: 120, 
    colors: ['#3B82F6', '#1E40AF'] as const,
    icon: Music 
  },
  { 
    id: 2, 
    name: 'Violas', 
    count: 45, 
    colors: ['#8B5CF6', '#5B21B6'] as const,
    icon: Music 
  },
  { 
    id: 3, 
    name: 'Cellos', 
    count: 38, 
    colors: ['#EC4899', '#9D174D'] as const,
    icon: Music 
  },
  { 
    id: 4, 
    name: 'Sopros', 
    count: 62, 
    colors: ['#10B981', '#047857'] as const,
    icon: Music 
  },
];

const RECENT_ADDED = [
  { id: 1, title: 'Time', composer: 'Hans Zimmer' },
  { id: 2, title: 'Bachianas Nº 5', composer: 'Villa-Lobos' },
  { id: 3, title: 'O Guarani', composer: 'Carlos Gomes' },
  { id: 4, title: 'Sinfonia Nº 9', composer: 'Beethoven' },
];

export default function AcervoScreen() {
    return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Acervo Digital</Text>
        </View>

        {/* 2. Barra de Busca */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput 
            placeholder="Buscar obras, compositores..." 
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>

        {/* 3. Grid de Categorias (Degradê) */}
        <View style={styles.gridContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.gridItem}>
              <LinearGradient
                colors={cat.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <View style={styles.iconBox}>
                  <cat.icon size={20} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catCount}>{cat.count} obras</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Lista Recentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ADICIONADOS RECENTEMENTE</Text>
        </View>

        <View style={styles.listContainer}>
          {RECENT_ADDED.map((item) => (
            <TouchableOpacity key={item.id} style={styles.musicCard}>
              <View style={styles.playButton}>
                <PlayCircle size={24} color={Colors.dark.textSecondary} />
              </View>
              
              <View style={styles.musicInfo}>
                <Text style={styles.musicTitle}>{item.title}</Text>
                <Text style={styles.musicComposer}>{item.composer}</Text>
              </View>
              
              <ChevronRight size={20} color="#444" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Espaço extra no fim */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  // BUSCA
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: '100%',
  },
  // GRID
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: '48%', // Quase metade da tela para criar 2 colunas
    height: 120,
    borderRadius: 20,
    // Sombra para dar destaque
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  catCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  // RECENTES
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContainer: {
    gap: 12,
  },
  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A1E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  musicComposer: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
});
