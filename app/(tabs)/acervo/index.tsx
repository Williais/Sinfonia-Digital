import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Modal, ScrollView, Alert, RefreshControl 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../../lib/supabase';
import { acervoService, Musica } from '../../../services/acervo.service';
import { profileService } from '../../../services/profile.service';
import { Search, Music, BookOpen, ChevronRight, Plus, X, Save, FileAudio, FileText, Trash2 } from 'lucide-react-native';

export default function AcervoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [filteredMusicas, setFilteredMusicas] = useState<Musica[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [canCreate, setCanCreate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoCompositor, setNovoCompositor] = useState('');
  const [novoArranjador, setNovoArranjador] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<string>('popular');

  const [audioFile, setAudioFile] = useState<any>(null);
  const [pdfFiles, setPdfFiles] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarAcervo();
    }, [])
  );

  useEffect(() => {
    filtrar();
  }, [searchText, musicas]);

  async function carregarAcervo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await profileService.getUserProfile();
      const isPowerUser = ['admin', 'maestro'].includes(profile.role) || profile.is_spalla;
      setCanCreate(isPowerUser);

      const dados = await acervoService.getAllMusicas();
      setMusicas(dados);
      setFilteredMusicas(dados);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function filtrar() {
    let lista = musicas;
    if (searchText) {
      const lower = searchText.toLowerCase();
      lista = lista.filter(m => m.title.toLowerCase().includes(lower) || m.composer.toLowerCase().includes(lower));
    }
    setFilteredMusicas(lista);
  }

  async function pickAudio() {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (!result.canceled) setAudioFile(result.assets[0]);
    } catch (e) { Alert.alert("Erro", "Não foi possível selecionar o áudio"); }
  }

  async function pickPDFs() {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: true, copyToCacheDirectory: true });
        if (!result.canceled) setPdfFiles(prev => [...prev, ...result.assets]);
    } catch (e) { Alert.alert("Erro", "Não foi possível selecionar os PDFs"); }
  }

  async function handleCreateMusic() {
    if (!novoTitulo || !novoCompositor) return Alert.alert("Erro", "Título e Compositor são obrigatórios.");

    setSaving(true);
    try {
      await acervoService.addMusica(
        { title: novoTitulo, composer: novoCompositor, arranger: novoArranjador, category: novaCategoria },
        audioFile,
        pdfFiles
      );

      Alert.alert("Sucesso", "Música enviada para o acervo!");
      setModalVisible(false);
      limparForm();
      carregarAcervo();
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Falha ao enviar arquivos. Verifique sua conexão.");
    } finally {
      setSaving(false);
    }
  }

  function limparForm() {
    setNovoTitulo('');
    setNovoCompositor('');
    setNovoArranjador('');
    setAudioFile(null);
    setPdfFiles([]);
  }

  const renderItem = ({ item }: { item: Musica }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/acervo/${item.id}`)}>
      <View style={styles.cardIcon}><Music size={24} color="#D48C70" /></View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.composer}</Text>
      </View>
      <ChevronRight size={20} color="#333" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Acervo Digital</Text>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput style={styles.searchInput} placeholder="Buscar..." placeholderTextColor="#666" value={searchText} onChangeText={setSearchText} />
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#D48C70" style={{marginTop: 20}} /> : (
        <FlatList
          data={filteredMusicas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarAcervo(); }} tintColor="#D48C70" />}
        />
      )}

      {canCreate && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}><Plus size={32} color="#FFF" /></TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Música</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Dados da Obra</Text>
              <TextInput style={styles.input} placeholder="Título" placeholderTextColor="#666" value={novoTitulo} onChangeText={setNovoTitulo} />
              <TextInput style={styles.input} placeholder="Compositor" placeholderTextColor="#666" value={novoCompositor} onChangeText={setNovoCompositor} />
              <TextInput style={styles.input} placeholder="Arranjador (Opcional)" placeholderTextColor="#666" value={novoArranjador} onChangeText={setNovoArranjador} />

              <Text style={styles.label}>Arquivos</Text>
              
              <TouchableOpacity style={styles.fileBtn} onPress={pickAudio}>
                <FileAudio size={20} color="#D48C70" />
                <Text style={styles.fileBtnText}>{audioFile ? audioFile.name : "Selecionar Áudio (MP3)"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.fileBtn} onPress={pickPDFs}>
                <FileText size={20} color="#D48C70" />
                <Text style={styles.fileBtnText}>Adicionar Partituras (PDF)</Text>
              </TouchableOpacity>

              {pdfFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => setPdfFiles(prev => prev.filter((_, i) => i !== index))}>
                        <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateMusic} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Save size={20} color="#FFF" />
                    <Text style={styles.saveButtonText}>Salvar e Enviar</Text>
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
  header: { padding: 20, paddingTop: 60, backgroundColor: '#0B0F19' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A26', borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A26', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(212, 140, 112, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  cardSubtitle: { fontSize: 12, color: '#888' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: '#D48C70', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#151A26', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  modalForm: { paddingBottom: 40 },
  label: { color: '#D48C70', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#0B0F19', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', fontSize: 16, marginBottom: 10 },
  fileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0F19', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#333', gap: 10, marginBottom: 10 },
  fileBtnText: { color: '#CCC', fontSize: 14 },
  fileItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 4 },
  fileName: { color: '#FFF', fontSize: 12, flex: 1 },
  saveButton: { backgroundColor: '#D48C70', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, marginTop: 32, gap: 8 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});