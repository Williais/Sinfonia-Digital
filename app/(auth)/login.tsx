import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowRight, Chrome, Music } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  }, []);

  const createSessionFromUrl = async (url: string) => {
    try {
      const params = url.split("#")[1] || url.split("?")[1];
      if (!params) return;

      const searchParams = new URLSearchParams(params);
      const access_token = searchParams.get("access_token");
      const refresh_token = searchParams.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.log("Erro ao processar URL:", error);
      return false;
    }
    return false;
  };

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL("/google-auth");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        if (result.type === "success" && result.url) {
          const sessionCreated = await createSessionFromUrl(result.url);

          if (sessionCreated) {
            checkProfileAndRedirect();
          } else {
            checkProfileAndRedirect();
          }
        }
      }
    } catch (error: any) {
      if (error.message !== "User cancelled")
        Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkProfileAndRedirect() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setTimeout(checkProfileAndRedirect, 1000);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, instrument")
      .eq("id", session.user.id)
      .single();

    if (profile && profile.full_name && profile.instrument) {
      router.replace("/(tabs)/index" as any);
    } else {
      router.replace("/(auth)/onboarding" as any);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.iconCircle,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <Music size={40} color={Colors.dark.text} />
        </Animated.View>
        <Text style={styles.brandTitle}>OFC</Text>
        <Text style={styles.brandSubtitle}>PORTAL DA ORQUESTRA</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ACESSO RESTRITO</Text>
        <Text style={styles.description}>
          Entre com sua conta Google para acessar o sistema.
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Chrome size={20} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Entrar com Google</Text>
              <ArrowRight
                size={20}
                color="#FFF"
                style={{ marginLeft: 10, opacity: 0.6 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Problemas? Fale com algum ADM</Text>
        <Text style={styles.version}>v1.0.0 • Primeira Edição</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#1A1A1A",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: Colors.dark.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  brandTitle: {
    fontSize: 32,
    color: "#FFF",
    fontWeight: "300",
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "bold",
    letterSpacing: 4,
    marginTop: 5,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#111",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222",
    width: "100%",
  },
  label: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  description: {
    color: "#888",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  version: {
    textAlign: "center",
    color: "#333",
    fontSize: 10,
    marginTop: 20,
  },
});
