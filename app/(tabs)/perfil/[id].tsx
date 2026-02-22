import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChevronLeft,
    Music,
    Save,
    Shield,
    Star,
    User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { supabase } from "../../../lib/supabase";

export default function MusicoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [musico, setMusico] = useState<any>(null);

  const [role, setRole] = useState("musico");
  const [isSpalla, setIsSpalla] = useState(false);
  const [isSectionLeader, setIsSectionLeader] = useState(false);

  useEffect(() => {
    if (id) fetchMusicoDetails();
  }, [id]);

  async function fetchMusicoDetails() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setMusico(data);
      setRole(data.role || "musico");
      setIsSpalla(data.is_spalla || false);
      setIsSectionLeader(data.is_section_leader || false);
    } catch (error) {
      console.error("Erro ao carregar músico:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados deste músico.");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePermissions() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: role,
          is_spalla: isSpalla,
          is_section_leader: isSectionLeader,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      Alert.alert("Sucesso", "Permissões atualizadas com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Integrante</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          {musico?.avatar_url ? (
            <Image source={{ uri: musico.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#666" />
            </View>
          )}
          <Text style={styles.name}>{musico?.full_name}</Text>
          <Text style={styles.nickname}>{musico?.nickname}</Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Music size={14} color={Colors.dark.primary} />
              <Text style={styles.tagText}>{musico?.instrument}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {musico?.section || "Sem naipe"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>NÍVEL DE ACESSO NO APP</Text>
        <View style={styles.card}>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "musico" && styles.roleActive,
              ]}
              onPress={() => setRole("musico")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "musico" && styles.roleTextActive,
                ]}
              >
                Músico
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "maestro" && styles.roleActive,
              ]}
              onPress={() => setRole("maestro")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "maestro" && styles.roleTextActive,
                ]}
              >
                Maestro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === "admin" && styles.roleActive]}
              onPress={() => setRole("admin")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "admin" && styles.roleTextActive,
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>
            Admins e Maestros podem criar ensaios, gerar QR Codes e gerenciar
            membros.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>PATENTES NA ORQUESTRA</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Shield
                size={20}
                color={isSectionLeader ? Colors.dark.primary : "#666"}
              />
              <Text style={styles.switchLabel}>Chefe de Naipe</Text>
            </View>
            <Switch
              value={isSectionLeader}
              onValueChange={setIsSectionLeader}
              trackColor={{ false: "#333", true: Colors.dark.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Star size={20} color={isSpalla ? "#FFD700" : "#666"} />
              <Text style={styles.switchLabel}>Spalla da Orquestra</Text>
            </View>
            <Switch
              value={isSpalla}
              onValueChange={setIsSpalla}
              trackColor={{ false: "#333", true: Colors.dark.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePermissions}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  content: { padding: 20 },
  profileHeader: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#333",
    marginBottom: 12,
  },
  name: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  nickname: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 12,
  },
  tagContainer: { flexDirection: "row", gap: 10 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    gap: 6,
  },
  tagText: {
    color: "#DDD",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: "row",
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  roleActive: { backgroundColor: Colors.dark.primary },
  roleText: { color: "#888", fontSize: 14, fontWeight: "bold" },
  roleTextActive: { color: "#FFF" },
  hintText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchLabel: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#222", marginVertical: 8 },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
