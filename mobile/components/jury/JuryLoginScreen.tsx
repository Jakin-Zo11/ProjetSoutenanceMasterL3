import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import evaluationApi, { loginJury } from '../../services/evaluationApi';
import { storage } from '../../utils/storage';

interface JuryLoginScreenProps {
  onSuccess: (teacherName: string) => void;
  onBack: () => void;
}

const JuryLoginScreen: React.FC<JuryLoginScreenProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const existingToken = await storage.getItemAsync('emit_jury_sanctum_token');
        const savedName = await storage.getItemAsync('emit_jury_teacher_name');

        if (existingToken && savedName) {
          // Session locale trouvée — pas d'endpoint /me disponible côté API
          onSuccess(savedName);
          return;
        }

        if (existingToken && !savedName) {
          // Token sans nom : on garde le token, l'utilisateur se reconnecte pour le nom
          await storage.removeItemAsync('emit_jury_sanctum_token');
        }
      } catch (e) {
        console.error('Impossible de restaurer la session:', e);
      } finally {
        setRestoring(false);
      }
    };

    void restoreSession();
  }, [onSuccess]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const session = await loginJury(normalizedEmail, password);

            if (!session?.success || !session.token) {
        setErrorMessage(
          session?.message || 'Identifiants incorrects ou réponse serveur invalide.'
        );
        return;
      }

      const teacherName =
        session.user?.name?.trim() ||
        normalizedEmail.split('@')[0] ||
        'Évaluateur';

      await storage.setItemAsync('emit_jury_sanctum_token', session.token);
      await storage.setItemAsync('emit_jury_teacher_name', teacherName);

      onSuccess(teacherName);
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);
      const message =
        error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (restoring) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.restoringText}>Vérification de la session…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light?.navy ?? '#0A192F'} />
      <View style={styles.content}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Logo-emit.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.juryBadge}>
          <View style={styles.juryBadgeContent}>
            <Ionicons name="school-outline" size={18} color="#FFFFFF" />
            <Text style={styles.juryBadgeText}>Portail Évaluateur</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion Évaluateur</Text>
          <Text style={styles.demoHint}>
            Comptes de test : scolarite@emit.mg / password123
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email universitaire</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nom@emit.mg"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={({ pressed }) => [styles.eyeButton, pressed && { opacity: 0.8 }]}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </Pressable>

          <Pressable style={({ pressed }) => [styles.forgotPassword, pressed && { opacity: 0.8 }]}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light?.navy ?? '#0A192F',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoringText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    left: 16,
    padding: 8,
    position: 'absolute',
    top: 16,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  juryBadge: {
    backgroundColor: Colors.light?.sky ?? '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 32,
  },
  juryBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  juryBadgeContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light?.navy ?? '#0A192F',
    textAlign: 'center',
    marginBottom: 12,
  },
  demoHint: {
    color: Colors.light?.primary ?? '#3B82F6',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light?.navy ?? '#0A192F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light?.surface ?? '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light?.navy ?? '#0A192F',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light?.surface ?? '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light?.navy ?? '#0A192F',
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: Colors.light?.primary ?? '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  errorMessage: {
    color: '#DC2626',
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
    color: Colors.light?.sky ?? '#3B82F6',
  },
});

export default JuryLoginScreen;