import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { profileService } from '../../../services/profile.service';
import { AlertCircle, Plus, X, Save, Trash2, Edit, Bell, BellOff } from 'lucide-react-native';

export default function MuralScreen() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta'>('baixa');
  const [notify, setNotify] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    try {
      const profile = await profileService.getUserProfile();
      setIsAdmin(['admin', 'maestro'].includes(profile.role));

      const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      setAvisos(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  function openModal(aviso?: any) {
    if (aviso) {
      setEditId(aviso.id);
      setTitulo(aviso.title);
      setConteudo(aviso.content);
      setPrioridade(aviso.priority);
      setNotify(false);
    } else {
      setEditId(null);
      setTitulo('');
      setConteudo('');
      setPrioridade('baixa');
      setNotify(true);
    }
    setModalVisible(true);
  }

  async function handleSave() {
    if (!titulo || !conteudo) return Alert.alert("Erro", "Preencha título e conteúdo.");
    setSaving(true);
    try {
      let recordId = editId;

      if (editId) {
        await supabase.from('notices').update({ title: titulo, content: conteudo, priority: prioridade }).eq('id', editId);
      } else {
        const { data } = await supabase.from('notices').insert({ title: titulo, content: conteudo, priority: prioridade }).select().single();
        if (data) recordId = data.id;
      }
      
      if (notify) {
        console.log("FASE 3: Disparar notificação para o aviso ID", recordId);
      }

      setModalVisible(false);
      carregarDados();
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar aviso.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert("Excluir", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
          try {
            await supabase.from('notices').delete().eq('id', id);
            carregarDados();
          } catch (e) {
            Alert.alert("Erro", "Falha ao excluir.");
          }
      }}
    ]);
  }

  const renderItem = ({ item }: { item: any }) => {
    let borderColor = '#333';
    let iconColor = '#666';
    if (item.priority === 'alta') { borderColor = '#EF4444'; iconColor = '#EF4444'; }
    if (item.priority === 'media') { borderColor = '#F59E0B'; iconColor = '#F59E0B'; }
    
    return (
      <View style={[styles.card, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <AlertCircle size={18} color={iconColor} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          {isAdmin && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => openModal(item)} style={{marginRight: 12}}>
                <Edit size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.cardContent}>{item.content}</Text>
        <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Mural de Avisos</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#D48C70" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={avisos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum aviso no momento.</Text>}
        />
      )}

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <Plus size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Aviso' : 'Novo Aviso'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#666" /></TouchableOpacity>
            </View>

            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.optBtn, prioridade === 'baixa' && styles.optBaixa]} onPress={() => setPrioridade('baixa')}><Text style={styles.optText}>Baixa</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.optBtn, prioridade === 'media' && styles.optMedia]} onPress={() => setPrioridade('media')}><Text style={styles.optText}>Média</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.optBtn, prioridade === 'alta' && styles.optAlta]} onPress={() => setPrioridade('alta')}><Text style={styles.optText}>Alta</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>Conteúdo</Text>
            <TextInput style={[styles.input, styles.textArea]} value={conteudo} onChangeText={setConteudo} multiline />

            <TouchableOpacity 
              style={[styles.notifyToggle, notify && styles.notifyToggleActive]} 
              onPress={() => setNotify(!notify)}
            >
              {notify ? <Bell size={20} color="#D48C70" /> : <BellOff size={20} color="#666" />}
              <Text style={[styles.notifyText, notify && styles.notifyTextActive]}>
                Enviar notificação aos músicos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <><Save size={20} color="#FFF" /><Text style={styles.saveText}>Salvar Aviso</Text></>}
            </TouchableOpacity>
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
  card: { backgroundColor: '#151A26', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  cardContent: { color: '#CCC', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  cardDate: { color: '#666', fontSize: 10, textAlign: 'right' },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: '#D48C70', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#151A26', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  label: { color: '#D48C70', fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#0B0F19', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8 },
  optBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  optBaixa: { backgroundColor: '#10B981', borderColor: '#10B981' },
  optMedia: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  optAlta: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  optText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  notifyToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, padding: 12, borderRadius: 8, backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#333' },
  notifyToggleActive: { borderColor: 'rgba(212, 140, 112, 0.4)', backgroundColor: 'rgba(212, 140, 112, 0.1)' },
  notifyText: { color: '#666', fontSize: 14, fontWeight: '500' },
  notifyTextActive: { color: '#D48C70' },
  saveBtn: { backgroundColor: '#D48C70', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});