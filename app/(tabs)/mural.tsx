import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Bell, AlertCircle, Info, ChevronRight } from 'lucide-react-native';

const NOTICES = [
  {
    id: 1,
    title: 'Ensaio Cancelado',
    date: 'Há 2 horas',
    content: 'O ensaio de naipe de hoje foi suspenso devido à falta de energia no teatro.',
    type: 'URGENT',
    author: 'Maestro Sadraque'
  },
  {
    id: 2,
    title: 'Alteração de Pauta',
    date: 'Ontem, 14:00',
    content: 'Adicionada a obra "O Guarani" para o próximo concerto. Favor imprimir as partituras.',
    type: 'WARNING',
    author: 'Willian'
  },
  {
    id: 3,
    title: 'Novo Fardamento',
    date: '10 Nov',
    content: 'As medidas para o novo fardamento serão tiradas no próximo ensaio geral.',
    type: 'INFO',
    author: 'Coordenação'
  }
];

export default function MuralScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mural de Avisos</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={20} color={Colors.dark.textSecondary} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {NOTICES.map((notice) => {

          let borderColor = '#2A303C';
          let icon = <Info size={20} color="#666" />;
          let highlight = 'transparent';

          if (notice.type === 'URGENT') {
            borderColor = 'rgba(239, 68, 68, 0.5)';
            icon = <AlertCircle size={20} color="#EF4444" />;
            highlight = '#EF4444';
          } else if (notice.type === 'WARNING') {
            borderColor = 'rgba(212, 140, 112, 0.5)';
            icon = <AlertCircle size={20} color={Colors.dark.primary} />;
            highlight = Colors.dark.primary;
          }

          return (
            <TouchableOpacity key={notice.id} style={[styles.card, { borderColor }]}>
              {notice.type !== 'INFO' && (
                <View style={[styles.highlightBar, { backgroundColor: highlight }]} />
              )}
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    {icon}
                    <Text style={styles.cardTitle}>{notice.title}</Text>
                  </View>
                  <Text style={styles.date}>{notice.date}</Text>
                </View>
                
                <Text style={styles.textContent}>{notice.content}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.author}>Por: {notice.author}</Text>
                  <View style={styles.readMore}>
                    <Text style={styles.readMoreText}>Ler completo</Text>
                    <ChevronRight size={14} color={Colors.dark.textSecondary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  highlightBar: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  textContent: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  author: {
    color: '#555',
    fontSize: 12,
    fontWeight: 'bold',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
});