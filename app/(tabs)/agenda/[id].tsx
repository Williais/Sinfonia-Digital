import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Alert, Modal, TextInput 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { agendaService, Evento } from '../../../services/agenda.service';
import { profileService } from '../../../services/profile.service';
import { supabase } from '../../../lib/supabase';
import { MapPin, Clock, ChevronLeft, CheckCircle, XCircle, Users, Trash2, Edit, AlertOctagon } from 'lucide-react-native';

export default function EventoDetalhesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [stats, setStats] = useState({ confirmados: 0, ausentes: 0 });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const [editStatus, setEditStatus] = useState<'ativo' | 'cancelado' | 'adiado'>('ativo');
  const [editDescricao, setEditDescricao] = useState('');

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const profile = await profileService.getUserProfile();
      const allowedRoles = ['admin', 'maestro'];
      const isPowerUser = allowedRoles.includes(profile.role) || profile.is_spalla;
      setIsAdmin(isPowerUser);

      const eventos = await agendaService.getProximosEventos(user?.id || '');
      const ev = eventos.find(e => e.id === id);
      setEvento(ev || null);
      
      if (ev) {
          setEditStatus(ev.status);
          setEditDescricao(ev.description || '');
      }

      const parts = await agendaService.getParticipantes(id as string);
      setParticipantes(parts);

      const confirmados = parts.filter(p => p.status === 'confirmado').length;
      const ausentes = parts.filter(p => p.status === 'ausente').length;
      setStats({ confirmados, ausentes });

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      "Excluir Evento",
      "Tem certeza? Isso apagará todas as presenças confirmadas.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await agendaService.deleteEvent(id as string);
              router.back();
            } catch (e) {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          }
        }
      ]
    );
  }

  async function handleUpdate() {
    try {
      await agendaService.updateEvent(id as string, {
        status: editStatus,
        description: editDescricao
      });
      setEditModalVisible(false);
      carregarDados();
      Alert.alert("Sucesso", "Evento atualizado.");
    } catch (e) {
      Alert.alert("Erro", "Falha ao atualizar.");
    }
  }

  async function handlePresenca(status: 'confirmado' | 'ausente') {
      if (!evento) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEvento(prev => prev ? { ...prev, my_status: status } : null);
      try { await agendaService.confirmarPresenca(evento.id, user.id, status); carregarDados(); } catch (e) { Alert.alert("Erro"); }
  }
  
  const getAgrupados = () => {
      const grupos: Record<string, any[]> = {};
      participantes.forEach(p => { if (p.status === 'confirmado') { const inst = p.instrument || 'Outros'; if (!grupos[inst]) grupos[inst] = []; grupos[inst].push(p); } });
      return grupos;
  };
  const grupos = getAgrupados();

  if (loading) return <View style={styles.center}><ActivityIndicator color="#D48C70" /></View>;
  if (!evento) return <View style={styles.center}><Text style={{color:'#666'}}>Evento não encontrado</Text></View>;

  const data = new Date(evento.date);
  const isCancelado = evento.status === 'cancelado';

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        
        {isAdmin && (
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <Edit size={24} color="#D48C70" />
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleSection}>
        {isCancelado && (
            <View style={styles.canceladoBadge}>
                <AlertOctagon size={16} color="#FFF" />
                <Text style={styles.canceladoText}>EVENTO CANCELADO</Text>
            </View>
        )}
        
        <Text style={[styles.pageTitle, isCancelado && {textDecorationLine: 'line-through', color: '#666'}]}>
            {evento.title}
        </Text>
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

      {!isCancelado && (
          <>
            <Text style={styles.sectionTitle}>SUA PARTICIPAÇÃO</Text>
            <View style={styles.myStatusRow}>
                <TouchableOpacity style={[styles.statusBtn, evento.my_status === 'confirmado' ? styles.btnConfirmado : styles.btnOutline]} onPress={() => handlePresenca('confirmado')}>
                <CheckCircle size={20} color={evento.my_status === 'confirmado' ? "#FFF" : "#10B981"} />
                <Text style={[styles.btnText, evento.my_status === 'confirmado' && {color:'#FFF'}]}>Vou</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.statusBtn, evento.my_status === 'ausente' ? styles.btnAusente : styles.btnOutline]} onPress={() => handlePresenca('ausente')}>
                <XCircle size={20} color={evento.my_status === 'ausente' ? "#FFF" : "#EF4444"} />
                <Text style={[styles.btnText, evento.my_status === 'ausente' && {color:'#FFF'}]}>Não Vou</Text>
                </TouchableOpacity>
            </View>
          </>
      )}

      <Text style={styles.sectionTitle}>RESUMO</Text>
      <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={[styles.statNumber, {color:'#10B981'}]}>{stats.confirmados}</Text><Text style={styles.statLabel}>Confirmados</Text></View>
          <View style={styles.statCard}><Text style={[styles.statNumber, {color:'#EF4444'}]}>{stats.ausentes}</Text><Text style={styles.statLabel}>Ausentes</Text></View>
      </View>

      <Text style={styles.sectionTitle}>LISTA DE PRESENÇA</Text>
      {Object.keys(grupos).length > 0 ? Object.entries(grupos).map(([inst, pessoas]) => (
          <View key={inst} style={styles.groupCard}>
              <View style={styles.groupHeader}><Users size={16} color="#D48C70" /><Text style={styles.groupTitle}>{inst} ({pessoas.length})</Text></View>
              {pessoas.map((p, i) => (<View key={p.id} style={styles.personRow}><Text style={styles.personName}>{p.name}</Text><CheckCircle size={14} color="#10B981" /></View>))}
          </View>
      )) : <Text style={styles.emptyText}>Ninguém confirmado.</Text>}

      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Gerenciar Evento</Text>
                
                <Text style={styles.label}>Status do Evento</Text>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => setEditStatus('ativo')} style={[styles.optBtn, editStatus === 'ativo' && styles.optBtnActive]}><Text style={styles.optText}>Ativo</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditStatus('cancelado')} style={[styles.optBtn, editStatus === 'cancelado' && styles.optBtnCancel]}><Text style={styles.optText}>Cancelado</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditStatus('adiado')} style={[styles.optBtn, editStatus === 'adiado' && styles.optBtnAdiado]}><Text style={styles.optText}>Adiado</Text></TouchableOpacity>
                </View>

                <Text style={styles.label}>Descrição / Avisos</Text>
                <TextInput style={styles.input} value={editDescricao} onChangeText={setEditDescricao} multiline />

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                    <Text style={styles.saveText}>Salvar Alterações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Trash2 size={20} color="#EF4444" />
                    <Text style={styles.deleteText}>Excluir Evento</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.closeBtn} onPress={() => setEditModalVisible(false)}>
                    <Text style={{color: '#666'}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  center: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 16, marginLeft: 8 },
  titleSection: { marginBottom: 30 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  typeBadge: { color: '#D48C70', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { color: '#CCC', fontSize: 16 },
  description: { color: '#888', fontSize: 14, marginTop: 16, lineHeight: 22, fontStyle: 'italic' },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  myStatusRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  btnOutline: { borderColor: '#333', backgroundColor: 'transparent' },
  btnConfirmado: { backgroundColor: '#10B981', borderColor: '#10B981' },
  btnAusente: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  btnText: { color: '#888', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#151A26', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#666', fontSize: 12 },
  groupCard: { backgroundColor: '#151A26', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  groupTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  personRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  personName: { color: '#DDD', fontSize: 14 },
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  
  canceladoBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EF4444', padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  canceladoText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#151A26', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  label: { color: '#D48C70', marginBottom: 8, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  optBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  optBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  optBtnCancel: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  optBtnAdiado: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  optText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#0B0F19', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  saveBtn: { backgroundColor: '#D48C70', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
  deleteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444', marginBottom: 12 },
  deleteText: { color: '#EF4444', fontWeight: 'bold' },
  closeBtn: { alignItems: 'center', padding: 10 }
});