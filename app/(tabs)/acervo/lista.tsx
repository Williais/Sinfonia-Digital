import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, Modal, ScrollView, Alert, RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'; 
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../../lib/supabase';
import { profileService } from '../../../services/profile.service';
import { acervoService, Musica } from '../../../services/acervo.service';
import { Search, Music, FileText, PlayCircle, ChevronLeft, Plus, X, Save, FileAudio, Trash2 } from 'lucide-react-native';

export default function AcervoListaScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [filteredMusicas, setFilteredMusicas] = useState<Musica[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Admin Tools
  const [canCreate, setCanCreate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoArranjador, setNovoArranjador] = useState('');
  const [audioFile, setAudioFile] = useState<any>(null);
  const [pdfFiles, setPdfFiles] = useState<any[]>([]);

  const pageTitle = category && category !== 'all' ? category.toString().charAt(0).toUpperCase() + category.toString().slice(1) : 'Acervo Completo';

  useFocusEffect(
    useCallback(() => {
      carregarAcervo();
    }, [category])
  );

  async function carregarAcervo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const profile = await profileService.getUserProfile();
         const isPowerUser = ['admin', 'maestro'].includes(profile.role) || profile.is_spalla;
         setCanCreate(isPowerUser);
      }

      const dados = await acervoService.getAllMusicas();
      setMusicas(dados);

      if (category && category !== 'all') {
        const cat = category.toString().toLowerCase();
        setFilteredMusicas(dados.filter(m => verificarCategoria(m, cat)));
      } else {
        setFilteredMusicas(dados);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function verificarCategoria(musica: Musica, cat: string): boolean {
    if (!musica.partiturasPaths) return false;
    const instrumentos = Object.keys(musica.partiturasPaths).map(i => i.toLowerCase());
    if (cat === 'cordas') return instrumentos.some(i => i.includes('violino') || i.includes('viola') || i.includes('cello') || i.includes('baixo') || i.includes('contrabaixo'));
    if (cat === 'sopros') return instrumentos.some(i => i.includes('flauta') || i.includes('clarinete') || i.includes('oboé') || i.includes('fagote') || i.includes('trompa') || i.includes('trompete') || i.includes('trombone') || i.includes('tuba') || i.includes('sax'));
    if (cat === 'percussão') return instrumentos.some(i => i.includes('tímpano') || i.includes('caixa') || i.includes('prato') || i.includes('bateria') || i.includes('percussão'));
    return true;
  }

  function handleSearch(text: string) {
    setSearchText(text);
    const baseList = (category && category !== 'all') ? musicas.filter(m => verificarCategoria(m, category.toString().toLowerCase())) : musicas;

    if (text === '') {
      setFilteredMusicas(baseList);
    } else {
      const filtrado = baseList.filter(m => m.title.toLowerCase().includes(text.toLowerCase()) || m.arranger?.toLowerCase().includes(text.toLowerCase()));
      setFilteredMusicas(filtrado);
    }
  }

  async function pickAudio() {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (!result.canceled && result.assets) setAudioFile(result.assets[0]);
    } catch (e) { console.error(e); }
  }

  async function pickPDFs() {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: true, copyToCacheDirectory: true });
        if (!result.canceled && result.assets) setPdfFiles(prev => [...prev, ...result.assets]);
    } catch (e) { console.error(e); }
  }

  async function handleCreateMusic() {
    if (!novoTitulo) return Alert.alert("Aviso", "Preencha o Título da obra.");
    setSaving(true);
    try {
      await acervoService.addMusica({ title: novoTitulo, arranger: novoArranjador }, audioFile, pdfFiles);
      Alert.alert("Sucesso", "Música adicionada!");
      setModalVisible(false);
      limparForm();
      carregarAcervo();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Erro", "Falha no envio.");
    } finally {
      setSaving(false);
    }
  }

  function limparForm() {
    setNovoTitulo('');
    setNovoArranjador('');
    setAudioFile(null);
    setPdfFiles([]);
  }

  const renderItem = ({ item }: { item: Musica }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/acervo/${item.id}`)}>
      <View style={styles.cardIcon}>
        <Music size={24} color="#D48C70" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardArranger}>{item.arranger || 'Arranjo desconhecido'}</Text>
        
        <View style={styles.badgesRow}>
          {item.audioPath && (
            <View style={styles.badge}><PlayCircle size={10} color="#666" /><Text style={styles.badgeText}>Áudio</Text></View>
          )}
          {item.partiturasPaths && Object.keys(item.partiturasPaths).length > 0 && (
            <View style={styles.badge}><FileText size={10} color="#666" /><Text style={styles.badgeText}>{Object.keys(item.partiturasPaths).length} Parts.</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <ChevronLeft size={24} color="#FFF" />
           <Text style={styles.pageTitle}>{pageTitle}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput} placeholder="Buscar nesta lista..." placeholderTextColor="#666"
          value={searchText} onChangeText={handleSearch}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarAcervo(); }} tintColor="#D48C70" />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>Nenhuma obra encontrada.</Text></View>}
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
              <TextInput style={styles.input} placeholder="Título da Obra" placeholderTextColor="#666" value={novoTitulo} onChangeText={setNovoTitulo} />
              <TextInput style={styles.input} placeholder="Arranjador (Opcional)" placeholderTextColor="#666" value={novoArranjador} onChangeText={setNovoArranjador} />

              <Text style={styles.label}>Arquivos</Text>
              <TouchableOpacity style={styles.fileBtn} onPress={pickAudio}>
                <FileAudio size={20} color="#D48C70" /><Text style={styles.fileBtnText}>{audioFile ? audioFile.name : "Selecionar Áudio (MP3)"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fileBtn} onPress={pickPDFs}>
                <FileText size={20} color="#D48C70" /><Text style={styles.fileBtnText}>Adicionar Partituras (PDF)</Text>
              </TouchableOpacity>

              {pdfFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => setPdfFiles(prev => prev.filter((_, i) => i !== index))}><Trash2 size={16} color="#EF4444" /></TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateMusic} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <><Save size={20} color="#FFF" /><Text style={styles.saveButtonText}>Salvar e Enviar</Text></>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: -8 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A26', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 24, borderWidth: 1, borderColor: '#222' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#151A26', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(212, 140, 112, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  cardArranger: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  badgeText: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#666', fontSize: 14 },
  
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