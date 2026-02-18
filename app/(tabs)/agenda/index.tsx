import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker'; // Novo import
import { supabase } from '../../../lib/supabase';
import { agendaService, Evento } from '../../../services/agenda.service';
import { profileService } from '../../../services/profile.service';
import { MapPin, Clock, CheckCircle, Plus, X, Save, Ban, AlertTriangle } from 'lucide-react-native';

export default function AgendaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<Evento[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTipo, setNovoTipo] = useState<'ensaio' | 'concerto' | 'apresentacao'>('ensaio');
  const [novoLocal, setNovoLocal] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [filtro, setFiltro] = useState<'todos' | 'ensaio' | 'concerto' | 'apresentacao'>('todos');

  useFocusEffect(
    useCallback(() => {
      carregarAgenda();
    }, [])
  );

  async function carregarAgenda() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await profileService.getUserProfile();
      const allowedRoles = ['admin', 'maestro'];
      const isPowerUser = allowedRoles.includes(profile.role) || profile.is_spalla || profile.is_section_leader;
      setCanCreate(isPowerUser);

      const dados = await agendaService.getProximosEventos(user.id);
      setEventos(dados);
      aplicarFiltro(dados, filtro);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function aplicarFiltro(lista: Evento[], tipo: string) {
    if (tipo === 'todos') {
      setEventosFiltrados(lista);
    } else {
      setEventosFiltrados(lista.filter(e => e.type === tipo));
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {

      const currentDate = new Date(date);
      currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(currentDate);
      if (Platform.OS === 'android') setShowTimePicker(true);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(date);
      currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(currentDate);
    }
  };

  async function handleCreateEvent() {
    if (!novoTitulo || !novoLocal) {
      return Alert.alert("Erro", "Preencha título e local.");
    }

    setSaving(true);
    try {
  
      const isoDate = date.toISOString();

      await agendaService.createEvent({
        title: novoTitulo,
        type: novoTipo,
        date: isoDate,
        location: novoLocal,
        description: novaDescricao,
        status: 'ativo'
      });

      Alert.alert("Sucesso", "Evento criado!");
      setModalVisible(false);
      limparFormulario();
      carregarAgenda(); 
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Falha ao criar evento.");
    } finally {
      setSaving(false);
    }
  }

  function limparFormulario() {
    setNovoTitulo('');
    setNovoLocal('');
    setNovaDescricao('');
    setNovoTipo('ensaio');
    setDate(new Date());
  }

  const formatarDataRender = (isoString: string) => {
    const d = new Date(isoString);
    const dia = d.getDate().toString().padStart(2, '0');
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mes = meses[d.getMonth()];
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()];
    return { dia, mes, hora, diaSemana };
  };

  const FilterChip = ({ label, type }: { label: string, type: typeof filtro }) => (
    <TouchableOpacity 
      style={[styles.chip, filtro === type && styles.chipActive]} 
      onPress={() => { setFiltro(type); aplicarFiltro(eventos, type); }}
    >
      <Text style={[styles.chipText, filtro === type && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const TypeOption = ({ label, value }: { label: string, value: typeof novoTipo }) => (
    <TouchableOpacity 
      style={[styles.typeOption, novoTipo === value && styles.typeOptionActive]}
      onPress={() => setNovoTipo(value)}
    >
      <Text style={[styles.typeTextOption, novoTipo === value && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: Evento, index: number }) => {
    const { dia, mes, hora, diaSemana } = formatarDataRender(item.date);
    const confirmado = item.my_status === 'confirmado'; 
    const isLast = index === eventosFiltrados.length - 1;

    const isConcerto = item.type === 'concerto';
    const isApresentacao = item.type === 'apresentacao';
    
    // Status visual
    const isCancelado = item.status === 'cancelado';
    const isAdiado = item.status === 'adiado';

    let typeColor = '#666';
    let typeLabel = 'ENSAIO';
    if (isConcerto) { typeColor = '#D48C70'; typeLabel = '♫ CONCERTO'; }
    else if (isApresentacao) { typeColor = '#A855F7'; typeLabel = '★ APRESENTAÇÃO'; }

    return (
      <View style={[styles.timelineRow, isCancelado && { opacity: 0.6 }]}>
        <View style={styles.leftCol}>
          <Text style={[styles.dateDay, isCancelado && { color: '#EF4444', textDecorationLine: 'line-through' }]}>{dia}</Text>
          <Text style={styles.dateMonth}>{mes}</Text>
        </View>

        <View style={styles.timelineCol}>
          <View style={[
            styles.dot, 
            isConcerto && styles.dotConcerto, 
            isApresentacao && styles.dotApresentacao,
            isCancelado && styles.dotCancelado, 
            isAdiado && styles.dotAdiado     
          ]} />
          {!isLast && <View style={styles.line} />}
        </View>

        <View style={styles.rightCol}>
          <TouchableOpacity 
            style={[
              styles.card, 
              isConcerto && styles.cardConcerto, 
              isApresentacao && styles.cardApresentacao,
              isCancelado && styles.cardCancelado, 
              isAdiado && styles.cardAdiado       
            ]}
            onPress={() => router.push(`/agenda/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={{flexDirection:'row', alignItems:'center', gap: 8, flex: 1}}>
                {isCancelado ? (
                   <View style={styles.badgeCancelado}><Ban size={12} color="#FFF"/><Text style={styles.badgeText}>CANCELADO</Text></View>
                ) : isAdiado ? (
                   <View style={styles.badgeAdiado}><AlertTriangle size={12} color="#000"/><Text style={styles.badgeTextDark}>ADIADO</Text></View>
                ) : (
                   <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel} • {diaSemana}</Text>
                )}
              </View>

              {confirmado && !isCancelado && <CheckCircle size={16} color="#10B981" />}
            </View>

            <Text style={[styles.title, isCancelado && { textDecorationLine: 'line-through', color: '#888' }]}>
              {item.title}
            </Text>

            <View style={styles.detailsRow}>
              <View style={styles.infoTag}><Clock size={12} color="#9CA3AF" /><Text style={styles.infoText}>{hora}</Text></View>
              <View style={styles.infoTag}><MapPin size={12} color="#9CA3AF" /><Text style={styles.infoText}>{item.location}</Text></View>
            </View>
          </TouchableOpacity>
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
        />
      )}

      {canCreate && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Plus size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* MODAL DE CRIAÇÃO */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Evento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} placeholder="Ex: Ensaio de Naipe" placeholderTextColor="#666" value={novoTitulo} onChangeText={setNovoTitulo} />

              <Text style={styles.label}>Tipo de Evento</Text>
              <View style={styles.typeRow}>
                <TypeOption label="Ensaio" value="ensaio" />
                <TypeOption label="Apres." value="apresentacao" />
                <TypeOption label="Concerto" value="concerto" />
              </View>

       
              <Text style={styles.label}>Data e Hora</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Clock size={20} color="#D48C70" />
                <Text style={styles.dateBtnText}>
                  {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}

              <Text style={styles.label}>Local</Text>
              <TextInput style={styles.input} placeholder="Ex: Sala 03" placeholderTextColor="#666" value={novoLocal} onChangeText={setNovoLocal} />

              <Text style={styles.label}>Descrição (Opcional)</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Detalhes, repertório..." placeholderTextColor="#666" multiline numberOfLines={3} value={novaDescricao} onChangeText={setNovaDescricao} />

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateEvent} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Save size={20} color="#FFF" />
                    <Text style={styles.saveButtonText}>Criar Evento</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: { marginTop: 60, marginBottom: 20, paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#151A26', borderWidth: 1, borderColor: '#333', height: 36 },
  chipActive: { backgroundColor: 'rgba(212, 140, 112, 0.2)', borderColor: '#D48C70' },
  chipText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  chipTextActive: { color: '#D48C70' },

  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  leftCol: { width: 50, alignItems: 'center', paddingTop: 10 },
  dateDay: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  dateMonth: { fontSize: 12, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  timelineCol: { width: 20, alignItems: 'center', marginRight: 10 },
  
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#333', marginTop: 18, borderWidth: 2, borderColor: '#0B0F19', zIndex: 2 },
  dotConcerto: { backgroundColor: '#D48C70', width: 14, height: 14, borderRadius: 7 },
  dotApresentacao: { backgroundColor: '#A855F7', width: 14, height: 14, borderRadius: 7 },
  dotCancelado: { backgroundColor: '#EF4444' }, // Vermelho
  dotAdiado: { backgroundColor: '#F59E0B' }, // Amarelo

  line: { width: 2, flex: 1, backgroundColor: '#1F2937', marginTop: -2, marginBottom: -18 },
  rightCol: { flex: 1, paddingBottom: 24 },
  
  card: { backgroundColor: '#151A26', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardConcerto: { borderColor: 'rgba(212, 140, 112, 0.4)', backgroundColor: 'rgba(212, 140, 112, 0.05)' },
  cardApresentacao: { borderColor: 'rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' },
  
  cardCancelado: { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1 },
  cardAdiado: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  typeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  
  badgeCancelado: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeAdiado: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  badgeTextDark: { fontSize: 10, color: '#000', fontWeight: 'bold' },

  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: '#9CA3AF', fontSize: 12 },

  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#D48C70',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#151A26', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  modalForm: { paddingBottom: 40 },
  label: { color: '#D48C70', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#0B0F19', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeOption: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#0B0F19', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  typeOptionActive: { backgroundColor: '#D48C70', borderColor: '#D48C70' },
  typeTextOption: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  
  // Estilo do Botão de Data
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0F19', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#333', gap: 10 },
  dateBtnText: { color: '#FFF', fontSize: 16 },

  saveButton: { backgroundColor: '#D48C70', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, marginTop: 32, gap: 8 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});