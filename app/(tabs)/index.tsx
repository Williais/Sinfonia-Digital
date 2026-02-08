import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo ao Sinfonia Digital!</Text>
      <Text style={styles.subtext}>Você está logado.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    color: Colors.dark.textSecondary,
    marginTop: 10,
  }
});