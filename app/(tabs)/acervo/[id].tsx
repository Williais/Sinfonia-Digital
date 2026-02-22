import Slider from "@react-native-community/slider";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ChevronLeft,
  Download,
  FileText,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { acervoService, Musica } from "../../../services/acervo.service";
import { playerService } from "../../../services/player.service";
import { profileService } from "../../../services/profile.service";

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [musica, setMusica] = useState<Musica | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        playerService.stop();
        setIsPlaying(false);
      };
    }, []),
  );

  async function loadDetails() {
    try {
      const profile = await profileService.getUserProfile();
      const isPowerUser =
        ["admin", "maestro"].includes(profile.role) || profile.is_spalla;
      setCanEdit(isPowerUser);

      const encontrada = await acervoService.getMusicaById(id as string);
      if (encontrada) setMusica(encontrada);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayPause() {
    if (!musica?.audioUrl) return Alert.alert("Ops", "Sem áudio disponível.");

    if (position > 0 && position < duration) {
      const playing = await playerService.togglePlay();
      setIsPlaying(playing);
    } else {
      await playerService.play(musica.audioUrl, (status: any) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 1);
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);

          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
      setIsPlaying(true);
    }
  }

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? "0" : "") + seconds;
  };

  async function handleDelete() {
    Alert.alert(
      "Excluir Música",
      "Tem certeza? Isso removerá a música e todos os seus arquivos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await acervoService.deleteMusica(
                id as string,
                musica?.audioPath,
                musica?.partiturasPaths,
              );
              Alert.alert("Sucesso", "Música removida.");
              router.back();
            } catch (error) {
              console.error("Erro na tela de apagar:", error);
              Alert.alert("Erro", "Falha ao excluir.");
            }
          },
        },
      ],
    );
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#D48C70" />
      </View>
    );
  if (!musica)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#FFF" }}>Música não encontrada</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#FFF" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        {canEdit && (
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.playerSection}>
        <View style={styles.albumCover}>
          <Text style={styles.albumInitial}>
            {musica.title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{musica.title}</Text>

        <Text style={styles.arranger}>
          {musica.arranger ? `Arr: ${musica.arranger}` : "Arranjo desconhecido"}
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#D48C70"
            maximumTrackTintColor="#555"
            thumbTintColor="#D48C70"
            onSlidingComplete={async (value) => {
              await playerService.seekTo(value);
            }}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          {isPlaying ? (
            <PauseCircle size={80} color="#D48C70" />
          ) : (
            <PlayCircle size={80} color="#D48C70" />
          )}
        </TouchableOpacity>

        <Text style={styles.statusText}>
          {musica.audioUrl
            ? isPlaying
              ? "Tocando..."
              : "Toque para ouvir"
            : "Áudio indisponível"}
        </Text>
      </View>

      <View style={styles.filesSection}>
        <Text style={styles.sectionTitle}>PARTITURAS DISPONÍVEIS</Text>

        {musica.partiturasUrls &&
        Object.keys(musica.partiturasUrls).length > 0 ? (
          Object.entries(musica.partiturasUrls).map(([instrumento, url]) => (
            <TouchableOpacity
              key={instrumento}
              style={styles.fileCard}
              onPress={() => Linking.openURL(url)}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View style={styles.fileIcon}>
                  <FileText size={20} color="#FFF" />
                </View>
                <Text style={styles.fileName}>{instrumento}</Text>
              </View>
              <Download size={20} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyFiles}>
            <AlertCircle size={24} color="#444" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#666" }}>Nenhuma partitura cadastrada.</Text>
          </View>
        )}
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19", padding: 20 },
  center: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 8 },
  playerSection: { alignItems: "center", marginBottom: 40 },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#D48C70",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  albumInitial: { fontSize: 80, color: "#333", fontWeight: "bold" },
  title: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  arranger: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 24,
  },
  playButton: { marginBottom: 12 },
  statusText: { color: "#666", fontSize: 12 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
    gap: 10,
  },
  timeText: { color: "#888", fontSize: 12, width: 40, textAlign: "center" },
  filesSection: { flex: 1 },
  sectionTitle: {
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 1,
  },
  fileCard: {
    backgroundColor: "#151A26",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#D48C70",
    justifyContent: "center",
    alignItems: "center",
  },

  fileName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },

  emptyFiles: {
    padding: 30,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
  },
});
