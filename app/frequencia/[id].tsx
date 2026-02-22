import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  ChevronLeft,
  Save,
  Users,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { agendaService } from "../../services/agenda.service";

export default function ChamadaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [listaPresenca, setListaPresenca] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const { data: ev } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      setEvento(ev);

      const todosMusicos = await agendaService.getAllMusicians();
      const registros = await agendaService.getEventAttendanceOnly(
        id as string,
      );

      const combinados = todosMusicos.map((musico: any) => {
        const registroExistente = registros.find(
          (r: any) => r.user_id === musico.id,
        );
        const statusAtual =
          registroExistente && registroExistente.status === "ausente"
            ? "ausente"
            : "confirmado";

        return {
          ...musico,
          status: statusAtual,
        };
      });

      setListaPresenca(combinados);
    } catch (e) {
      Alert.alert("Erro", "Falha ao carregar lista de presença.");
    } finally {
      setLoading(false);
    }
  }

  function toggleStatus(userId: string) {
    setListaPresenca((prev) =>
      prev.map((m) => {
        if (m.id === userId) {
          return {
            ...m,
            status: m.status === "confirmado" ? "ausente" : "confirmado",
          };
        }
        return m;
      }),
    );
  }

  async function handleSalvar() {
    setSaving(true);
    try {
      const payload = listaPresenca.map((item) => ({
        event_id: id as string,
        user_id: item.id,
        status: item.status,
      }));

      await agendaService.saveBulkAttendance(payload);
      Alert.alert("Sucesso", "Frequência salva com sucesso!");
      router.back();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a frequência.");
    } finally {
      setSaving(false);
    }
  }

  const agrupados = listaPresenca.reduce(
    (acc, user) => {
      const inst = user.instrument || "Outros";
      if (!acc[inst]) acc[inst] = [];
      acc[inst].push(user);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#D48C70" />
      </View>
    );

  const totalConfirmados = listaPresenca.filter(
    (m) => m.status === "confirmado",
  ).length;
  const totalAusentes = listaPresenca.filter(
    (m) => m.status === "ausente",
  ).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
          <View>
            <Text style={styles.pageTitle}>Fazer Chamada</Text>
            <Text style={styles.subtitle}>{evento?.title}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {totalConfirmados}
          </Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>
            {totalAusentes}
          </Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.instruction}>
          Todos os músicos já estão marcados como PRESENTES por padrão.
          Desmarque apenas quem faltou.
        </Text>

        {Object.keys(agrupados).map((inst) => (
          <View key={inst} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Users size={16} color="#D48C70" />
              <Text style={styles.groupTitle}>{inst}</Text>
            </View>

            {agrupados[inst].map((musico: any) => (
              <TouchableOpacity
                key={musico.id}
                style={styles.personRow}
                onPress={() => toggleStatus(musico.id)}
              >
                <Text
                  style={[
                    styles.personName,
                    musico.status === "ausente" && styles.personAusenteText,
                  ]}
                >
                  {musico.nickname}
                </Text>

                {musico.status === "confirmado" ? (
                  <View style={styles.checkBtn}>
                    <CheckCircle size={20} color="#10B981" />
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 12,
                        fontWeight: "bold",
                        marginLeft: 4,
                      }}
                    >
                      Presente
                    </Text>
                  </View>
                ) : (
                  <View style={styles.crossBtn}>
                    <XCircle size={20} color="#EF4444" />
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 12,
                        fontWeight: "bold",
                        marginLeft: 4,
                      }}
                    >
                      Faltou
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSalvar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" />
              <Text style={styles.saveText}>Salvar Frequência</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  center: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    alignItems: "center",
  },
  header: { marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", marginLeft: -8 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  subtitle: { color: "#9CA3AF", fontSize: 14, marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#151A26",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#666", fontSize: 12 },

  instruction: {
    color: "#D48C70",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
    paddingHorizontal: 20,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  groupCard: {
    backgroundColor: "#151A26",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  groupTitle: { color: "#FFF", fontWeight: "bold", fontSize: 14 },

  personRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.02)",
  },
  personName: { color: "#FFF", fontSize: 16, flex: 1 },
  personAusenteText: { color: "#666", textDecorationLine: "line-through" },

  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  crossBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0B0F19",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  saveBtn: {
    backgroundColor: "#D48C70",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  saveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
