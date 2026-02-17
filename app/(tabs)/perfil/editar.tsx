import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../../services/profile.service';
import { ChevronLeft, Save, Camera, Instagram } from 'lucide-react-native';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [nickname, setNickname] = useState('');
  const [fullName, setFullName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [instrumentOwnership, setInstrumentOwnership] = useState<'proprio' | 'cefec'>('proprio');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const profile = await profileService.getUserProfile();
      setNickname(profile.nickname || '');
      setFullName(profile.full_name || '');
      setInstrument(profile.instrument || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birth_date || '');
      setBio(profile.bio || '');
      setInstagram(profile.instagram || '');
      setInstrumentOwnership(profile.instrument_ownership || 'proprio');
      setAvatarUrl(profile.avatar_url || '');
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!nickname.trim() || !instrument.trim()) {
      return Alert.alert("Atenção", "Apelido e Instrumento são obrigatórios.");
    }

    setSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;

      if (newAvatarUri) {
        finalAvatarUrl = await profileService.uploadAvatar(newAvatarUri);
      }

      await profileService.updateProfile({
        nickname,
        full_name: fullName,
        instrument,
        phone,
        birth_date: birthDate,
        bio,
        instagram,
        instrument_ownership: instrumentOwnership,
        avatar_url: finalAvatarUrl
      });
      
      Alert.alert("Sucesso", "Perfil atualizado!");
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#D48C70" /></View>;

  const displayImage = newAvatarUri || avatarUrl || 'https://github.com/shadcn.png';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
          <Text style={styles.backText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#D48C70" /> : <Save size={24} color="#D48C70" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayImage }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Camera size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>INFORMAÇÕES BÁSICAS</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apelido</Text>
          <TextInput 
            style={styles.input} 
            value={nickname} onChangeText={setNickname}
            placeholder="Ex: Willian" placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input} 
            value={fullName} onChangeText={setFullName}
            placeholder="Nome para certificados" placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram</Text>
          <View style={styles.iconInputContainer}>
            <Instagram size={20} color="#666" style={{marginRight: 10}} />
            <TextInput 
              style={styles.iconInput} 
              value={instagram} onChangeText={setInstagram}
              placeholder="@seu.perfil" placeholderTextColor="#666"
              autoCapitalize="none"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>DADOS DO INSTRUMENTO</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instrumento Principal</Text>
          <TextInput 
            style={styles.input} 
            value={instrument} onChangeText={setInstrument}
            placeholder="Ex: Violino" placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Propriedade do Instrumento</Text>
          <View style={styles.switchContainer}>
            <TouchableOpacity 
              style={[styles.switchOption, instrumentOwnership === 'proprio' && styles.switchActive]}
              onPress={() => setInstrumentOwnership('proprio')}
            >
              <Text style={[styles.switchText, instrumentOwnership === 'proprio' && styles.switchTextActive]}>Próprio</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.switchOption, instrumentOwnership === 'cefec' && styles.switchActive]}
              onPress={() => setInstrumentOwnership('cefec')}
            >
              <Text style={[styles.switchText, instrumentOwnership === 'cefec' && styles.switchTextActive]}>Do CEFEC</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>CONTATO E DETALHES</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone / WhatsApp</Text>
          <TextInput 
            style={styles.input} 
            value={phone} onChangeText={setPhone}
            placeholder="(00) 00000-0000" placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput 
            style={styles.input} 
            value={birthDate} onChangeText={setBirthDate}
            placeholder="AAAA-MM-DD" placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio / Sobre Mim</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={bio} onChangeText={setBio}
            placeholder="Conte um pouco sobre sua trajetória musical..." 
            placeholderTextColor="#666"
            multiline numberOfLines={4}
          />
        </View>

        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222'
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', marginLeft: 8, fontSize: 16 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  scrollContent: { padding: 20 },

  avatarContainer: { alignSelf: 'center', marginBottom: 30, position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#D48C70' },
  cameraBtn: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: '#D48C70', padding: 10, borderRadius: 25,
    borderWidth: 3, borderColor: '#0B0F19'
  },
  
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16, marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#D48C70', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#151A26', color: '#FFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', fontSize: 16
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  iconInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A26',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16
  },
  iconInput: {
    flex: 1, color: '#FFF', paddingVertical: 16, fontSize: 16
  },

  switchContainer: {
    flexDirection: 'row', backgroundColor: '#151A26', borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  switchOption: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8
  },
  switchActive: {
    backgroundColor: '#D48C70'
  },
  switchText: {
    color: '#666', fontWeight: 'bold'
  },
  switchTextActive: {
    color: '#FFF'
  }
});