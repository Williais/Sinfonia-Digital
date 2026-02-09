import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Bell, Clock, MapPin, MoreVertical, PlayCircle, ChevronRight, User, BookOpen } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bem-vindo de volta</Text>
          <Text style={styles.userName}>Willbacht</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton}>
          <User size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>

        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A1E2E', opacity: 0.5 }]} />
        
        <View style={styles.heroHeader}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>HOJE</Text>
          </View>
          <MoreVertical size={20} color={Colors.dark.textSecondary} />
        </View>

        <Text style={styles.eventTitle}>12º Concerto</Text>
        <Text style={styles.eventSubtitle}>Repertório Trilhas Sonoras</Text>

        <View style={styles.heroFooter}>
          <View style={styles.infoBadge}>
            <Clock size={14} color={Colors.dark.primary} />
            <Text style={styles.infoText}>19:00</Text>
          </View>
          <View style={styles.infoBadge}>
            <MapPin size={14} color={Colors.dark.primary} />
            <Text style={styles.infoText}>Quadra do CEFEC</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Clock size={20} color="#60A5FA" />
          </View>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Frequência</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <BookOpen size={20} color="#A855F7" />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Novas Partituras</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COMUNICADOS RECENTES</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.announcementCard}>
        <View style={styles.activeBar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.announcementTitle}>Alteração de Pauta</Text>
          <Text style={styles.announcementDesc} numberOfLines={1}>
            Adicionada a obra O Guarani para o próximo...
          </Text>
        </View>
        <Text style={styles.timeText}>30 min</Text>
      </View>

      <View style={styles.announcementCard}>
        <View style={[styles.activeBar, { backgroundColor: Colors.dark.danger }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.announcementTitle}>Ensaio Cancelado</Text>
          <Text style={styles.announcementDesc} numberOfLines={1}>
            O ensaio de naipe de hoje foi suspenso devido...
          </Text>
        </View>
        <Text style={styles.timeText}>2h</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  userName: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },

  heroCard: {
    backgroundColor: '#131620',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A303C',
    overflow: 'hidden',
    position: 'relative',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(212, 140, 112, 0.1)', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 140, 112, 0.3)',
  },
  tagText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
  heroFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  infoText: {
    color: '#DDD',
    fontSize: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  seeAll: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  activeBar: {
    width: 4,
    height: 30,
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
    marginRight: 16,
  },
  announcementTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  announcementDesc: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  timeText: {
    color: '#555',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});