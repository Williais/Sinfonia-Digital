import { useRouter } from "expo-router";
import { ChevronLeft, Search, Shield, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { supabase } from "../lib/supabase";

export default function MusicosScreen() {
  const router = useRouter();
  const [musicos, setMusicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetchMusicos();
  }, []);

  async function fetchMusicos() {
    try {

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, nickname, instrument, avatar_url, role")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setMusicos(data || []);
    } catch (error) {
      console.error("Erro ao buscar músicos:", error);
    } finally {
      setLoading(false);
    }
  }

  const musicosFiltrados = musicos.filter((m) => {
    const termo = busca.toLowerCase();
    return (
      (m.full_name && m.full_name.toLowerCase().includes(termo)) ||
      (m.nickname && m.nickname.toLowerCase().includes(termo)) ||
      (m.instrument && m.instrument.toLowerCase().includes(termo))
    );
  });

  const renderMusico = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/perfil/${item.id}` as any)}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color="#666" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name || item.nickname}</Text>
        <Text style={styles.instrument}>
          {item.instrument || "Sem instrumento"}
        </Text>
      </View>


      {(item.role === "admin" || item.role === "maestro") && (
        <Shield
          size={18}
          color={Colors.dark.primary}
          style={{ marginRight: 10 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Músicos</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou naipe..."
          placeholderTextColor="#666"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.dark.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={musicosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderMusico}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum músico encontrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
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
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  info: { flex: 1, marginLeft: 16 },
  name: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  instrument: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
});
