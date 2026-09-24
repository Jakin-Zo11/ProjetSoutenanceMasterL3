import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  StatusBar,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export interface StudentProfile {
  name: string;
  matricule: string;
  formation: string;
  promotion: string;
  email: string;
  status: string;
}

interface StudentLoginScreenProps {
  onSuccess: (student: StudentProfile) => void;
  onBack: () => void;
}

function findStudentByMatricule(matricule: string): StudentProfile | null {
  const match = /^(\d{3})([A-Z])(\d{2})$/.exec(matricule);
  if (!match) return null;

  const [, number, parcoursCode, year] = match;
  const formation = parcoursCode === 'I' ? 'Informatique de Gestion' : `Parcours ${parcoursCode}`;
  const fullYear = `20${year}`;
  return {
    name: `Étudiant ${number}`,
    matricule,
    formation,
    promotion: `Promotion ${year} · ${fullYear}-${Number(fullYear) + 1}`,
    email: `matricule.${matricule.toLowerCase()}@emit.mg`,
    status: 'Actif',
  };
}

const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({ onSuccess, onBack }) => {
  const [matricule, setMatricule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const normalizedMatricule = matricule.trim().toUpperCase();
    if (!normalizedMatricule) {
      setErrorMessage('Veuillez renseigner votre matricule.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const student = findStudentByMatricule(normalizedMatricule);
      if (!student) {
        setErrorMessage('Format invalide. Exemple attendu : 000I24 ou 001I23.');
        return;
      }
      onSuccess(student);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <View style={styles.content}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]} accessibilityLabel="Retour">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        {/* Logo EMIT */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Logo-emit.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Accès étudiant</Text>
          <Text style={styles.formSubtitle}>Entrez votre matricule pour consulter votre parcours.</Text>

          {/* Matricule */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Matricule</Text>
            <TextInput
              style={styles.input}
              value={matricule}
              onChangeText={setMatricule}
              placeholder="Ex : 000I24"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <Pressable onPress={handleLogin} disabled={isLoading} style={({ pressed }) => [styles.loginButton, isLoading && styles.loginButtonDisabled, pressed && { opacity: 0.8 }]}>
            <Text style={styles.loginButtonText}>{isLoading ? 'Recherche...' : 'Voir mon espace'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1F4E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1F4E',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  formSubtitle: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    left: 16,
    padding: 8,
    position: 'absolute',
    top: 16,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1F4E',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#EAF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0D1F4E',
    fontFamily: 'Inter-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0D1F4E',
    fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: '#1A4BA8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 2px 8px rgba(26,75,168,0.3)',
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  errorMessage: {
    color: '#B42318',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2D84E0',
    fontFamily: 'Inter-Regular',
  },
});

export default StudentLoginScreen;
