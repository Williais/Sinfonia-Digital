import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

export default function GoogleAuth() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.dark.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#D48C70" />
      <Text style={{ color: "#D48C70", marginTop: 16, fontWeight: "bold" }}>
        Autenticando...
      </Text>
    </View>
  );
}
