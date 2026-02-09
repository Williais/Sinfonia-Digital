import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList 
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { MapPin, Clock, Filter } from 'lucide-react-native';

const DAYS = [
  { day: '10', month: 'NOV', week: 'Seg' },
  { day: '11', month: 'NOV', week: 'Ter' },
  { day: '12', month: 'NOV', week: 'Qua' },
  { day: '13', month: 'NOV', week: 'Qui' },
  { day: '14', month: 'NOV', week: 'Sex' },
  { day: '15', month: 'NOV', week: 'Sáb' },
  { day: '16', month: 'NOV', week: 'Dom' },
];

const EVENTS = [
  {
    id: '1',
    type: 'ENSAIO',
    title: 'Sinfonia No. 5',
    composer: 'Beethoven',
    time: '19:00',
    location: 'Teatro CEFEC',
    isNext: true,
  },
  {
    id: '2',
    type: 'CONCERTO',
    title: 'Concerto de Primavera',
    composer: 'Vivaldi',
    time: '20:00',
    location: 'Igreja Matriz',
    isNext: false,
  },
  {
    id: '3',
    type: 'ENSAIO',
    title: 'Ensaio de Naipe',
    composer: 'Cordas',
    time: '14:00',
    location: 'Sala 3',
    isNext: false,
  }
];

export default function AgendaScreen() {
  const [selectedDay, setSelectedDay] = useState('12');

  return (
    <View style={styles.container}>
      

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.calendarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {DAYS.map((item, index) => {
              const isSelected = item.day === selectedDay;
              return (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedDay(item.day)}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardActive
                  ]}
                >
                  <Text style={[styles.monthText, isSelected && styles.textActive]}>
                    {item.month}
                  </Text>
                  <Text style={[styles.dayText, isSelected && styles.textActive]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.timelineContainer}>
          {EVENTS.map((event, index) => {
            const isLast = index === EVENTS.length - 1;
            const isConcert = event.type === 'CONCERTO';

            return (
              <View key={event.id} style={styles.timelineItem}>

                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.dot, 
                    isConcert ? styles.dotConcert : styles.dotRehearsal 
                  ]} />
                  {!isLast && <View style={styles.line} />}
                </View>

                <View style={styles.cardContainer}>
                  <View style={styles.eventCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.eventType}>{event.type}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                    
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.composer}>{event.composer}</Text>
                    
                    <View style={styles.locationRow}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.locationText}>{event.location}</Text>
                    </View>
                  </View>
                </View>

              </View>
            );
          })}
        </View>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  calendarContainer: {
    marginBottom: 30,
  },
  calendarScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateCard: {
    width: 60,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  dateCardActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  monthText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  textActive: {
    color: '#FFF',
  },

  timelineContainer: {
    paddingHorizontal: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.background,
    zIndex: 2,
    marginTop: 24,
  },
  dotRehearsal: {
    backgroundColor: Colors.dark.primary,
  },
  dotConcert: {
    backgroundColor: '#A855F7',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#2A303C',
    marginVertical: -4,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  eventCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: 12,
    color: '#888',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  composer: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
});