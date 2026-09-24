import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import TopBar from '../common/TopBar';

interface StudentThemeScreenProps {
  onBack: () => void;
  onSubmit: (theme: string) => void;
}

const StudentThemeScreen: React.FC<StudentThemeScreenProps> = ({ onBack, onSubmit }) => {
  const [theme, setTheme] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Déposer mon thème" showBackButton onBackPress={onBack} showNotification={false} />
      <View style={styles.content}>
        <Text style={styles.title}>Thème de stage / mémoire</Text>
        <Text style={styles.description}>
          Saisissez le thème que vous souhaitez présenter. Il sera validé immédiatement et transmis à l’administration.
        </Text>
        <TextInput
          value={theme}
          onChangeText={setTheme}
          placeholder="Ex : Application mobile de gestion des soutenances"
          placeholderTextColor="#8A97A8"
          style={styles.input}
          multiline
          textAlignVertical="top"
        />
        <Pressable
          style={({ pressed }) => [styles.button, !theme.trim() && styles.buttonDisabled, pressed && { opacity: 0.8 }]}
          disabled={!theme.trim()}
          onPress={() => onSubmit(theme.trim())}
        >
          <Text style={styles.buttonText}>Valider mon thème</Text>
        </Pressable>
        <Text style={styles.note}>Après validation, la convocation et les détails de soutenance seront disponibles prochainement.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  content: { padding: 20 },
  title: { color: '#0D1F4E', fontSize: 24, fontWeight: '800', marginTop: 18 },
  description: { color: '#667085', fontSize: 14, lineHeight: 21, marginTop: 10 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#DDEAF7', borderRadius: 14, borderWidth: 1, color: '#0D1F4E', fontSize: 15, minHeight: 140, marginTop: 24, padding: 14 },
  button: { alignItems: 'center', backgroundColor: '#E5B45F', borderRadius: 12, marginTop: 16, paddingVertical: 14 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#0D1F4E', fontSize: 15, fontWeight: '800' },
  note: { color: '#55703A', fontSize: 13, lineHeight: 19, marginTop: 16 },
});

export default StudentThemeScreen;