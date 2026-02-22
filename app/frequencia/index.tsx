import { useRouter } from "expo-router";
import { Calendar, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Evento } from "../../services/agenda.service";

export default function FrequenciaScreen() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      setEventos(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: Evento }) => {
    const dataObj = new Date(item.date);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({ pathname: "/frequencia/[id]", params: { id: item.id } })
        }
      >
        <View style={styles.iconBox}>
          <Calendar size={24} color="#D48C70" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            {dataObj.toLocaleDateString("pt-BR")} - {item.type.toUpperCase()}
          </Text>
        </View>
        <ChevronLeft
          size={20}
          color="#666"
          style={{ transform: [{ rotate: "180deg" }] }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
          <Text style={styles.pageTitle}>Gestão de Frequência</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Selecione um evento para realizar a chamada
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#D48C70" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(e) => e.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19", paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
    marginBottom: 8,
  },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  subtitle: { color: "#666", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151A26",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(212,140,112,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: { flex: 1 },
  title: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  date: { color: "#9CA3AF", fontSize: 12 },
});
