import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  Image,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { User, Music, Calendar, Instagram, AlignLeft, CheckCircle, Award, Star } from "lucide-react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); 
  const [instrument, setInstrument] = useState("");
  const [section, setSection] = useState("");
  const [yearJoined, setYearJoined] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");

  const [isSectionLeader, setIsSectionLeader] = useState(false);
  const [isSpalla, setIsSpalla] = useState(false);
  const [isInstrumentOwn, setIsInstrumentOwn] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);

        setFullName(user.user_metadata.full_name || "");
        setAvatarUrl(user.user_metadata.avatar_url || ""); 
        setNickname(user.user_metadata.full_name?.split(' ')[0] || "");
      } else {
        router.replace("/(auth)/login" as any);
      }
    });
  }, []);

  async function handleSaveProfile() {

    if (!fullName || !nickname || !instrument || !section || !yearJoined) {
      return Alert.alert("Campos Obrigatórios", "Por favor, preencha Nome, Apelido, Instrumento, Naipe e Ano de Entrada.");
    }

    setLoading(true);

    try {

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          nickname: nickname,
          avatar_url: avatarUrl,
          instrument: instrument,
          section: section,
          year_joined: yearJoined,
          instagram_handle: instagram.replace('@', ''),
          bio: bio,
          is_section_leader: isSectionLeader,
          is_spalla: isSpalla,
          instrument_ownership: isInstrumentOwn ? 'proprio' : 'cefec',
          role: 'musico',
          status: 'ativo',
          updated_at: new Date(),
        });

      if (error) throw error;

      router.replace('/(tabs)/index' as any);

    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Complete seu perfil de Músico</Text>
        </View>

        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#666" />
            </View>
          )}
          <Text style={styles.avatarText}>Foto importada do Google</Text>
        </View>

        <View style={styles.formCard}>

          <Text style={styles.sectionTitle}>QUEM É VOCÊ</Text>
          
          <View style={styles.inputGroup}>
            <User size={20} color="#666" style={styles.icon} />
            <TextInput 
              placeholder="Nome Completo"
              placeholderTextColor="#666"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <User size={20} color="#666" style={styles.icon} />
            <TextInput 
              placeholder="Apelido (Como quer ser chamado)"
              placeholderTextColor="#666"
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          <View style={styles.inputGroup}>
            <Instagram size={20} color="#666" style={styles.icon} />
            <TextInput 
              placeholder="Instagram (ex: @willian_violin)"
              placeholderTextColor="#666"
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <AlignLeft size={20} color="#666" style={styles.icon} />
            <TextInput 
              placeholder="Bio / Status (Uma frase)"
              placeholderTextColor="#666"
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              maxLength={100}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>VIDA NA ORQUESTRA</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
              <Music size={20} color="#666" style={styles.icon} />
              <TextInput 
                placeholder="Instrumento"
                placeholderTextColor="#666"
                style={styles.input}
                value={instrument}
                onChangeText={setInstrument}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Calendar size={20} color="#666" style={styles.icon} />
              <TextInput 
                placeholder="Ano"
                placeholderTextColor="#666"
                style={styles.input}
                value={yearJoined}
                onChangeText={setYearJoined}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              placeholder="Naipe (Ex: Violas, Metais, Percussão)"
              placeholderTextColor="#666"
              style={[styles.input, { paddingLeft: 10 }]}
              value={section}
              onChangeText={setSection}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>O instrumento é próprio?</Text>
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleText, !isInstrumentOwn && styles.activeToggle]}>CEFEC</Text>
              <Switch 
                value={isInstrumentOwn} 
                onValueChange={setIsInstrumentOwn}
                trackColor={{ false: "#333", true: Colors.dark.primary }}
                thumbColor={"#FFF"}
              />
              <Text style={[styles.toggleText, isInstrumentOwn && styles.activeToggle]}>MEU</Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Award size={18} color={Colors.dark.primary} style={{ marginRight: 8 }} />
              <Text style={styles.switchLabel}>Sou Chefe de Naipe</Text>
            </View>
            <Switch 
              value={isSectionLeader} 
              onValueChange={setIsSectionLeader}
              trackColor={{ false: "#333", true: Colors.dark.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={18} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.switchLabel}>Sou Spalla</Text>
            </View>
            <Switch 
              value={isSpalla} 
              onValueChange={setIsSpalla}
              trackColor={{ false: "#333", true: "#FFD700" }}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Confirmar Cadastro</Text>
                <CheckCircle size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  avatarText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  sectionTitle: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    marginBottom: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    color: '#DDD',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  activeToggle: {
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  submitButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});