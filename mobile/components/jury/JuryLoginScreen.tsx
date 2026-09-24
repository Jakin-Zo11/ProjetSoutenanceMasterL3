import React, { useState } from 'react';
import {
  Colors } from '../../constants/theme';
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
// TODO: reconnecter à login une fois l'API backend prête
// import { login } from '../../services/api';

interface JuryLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

const JuryLoginScreen: React.FC<JuryLoginScreenProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    // TODO: reconnecter à login une fois l'API backend prête
    setTimeout(() => {
      // Mock login - accepte n'importe quel email/password pour la démo
      onSuccess();
      setIsLoading(false);
    }, 800)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <View style={styles.content}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]} accessibilityLabel="Retour">
          <Ionicons name="arrow-back" size={24} color={Colors.light.white} />
        </Pressable>
        {/* Logo EMIT */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Logo-emit.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Jury Badge */}
        <View style={styles.juryBadge}>
          <View style={styles.juryBadgeContent}>
            <Ionicons name="school-outline" size={18} color={Colors.light.white} />
            <Text style={styles.juryBadgeText}>Portail Évaluateur</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion Évaluateur</Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email universitaire</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nom@emit.mg"
              placeholderTextColor={Colors.light.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                placeholderTextColor={Colors.light.placeholder}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={({ pressed }) => [styles.eyeButton, pressed && { opacity: 0.8 }]}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.light.muted} />
              </Pressable>
            </View>
          </View>

          {/* Bouton connexion */}
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <Pressable onPress={handleLogin} disabled={isLoading} style={({ pressed }) => [styles.loginButton, isLoading && styles.loginButtonDisabled, pressed && { opacity: 0.8 }]}>
            <Text style={styles.loginButtonText}>{isLoading ? 'Connexion...' : 'Se connecter'}</Text>
          </Pressable>

          {/* Mot de passe oublié */}
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
    backgroundColor: Colors.light.navy,
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
  },
  backIcon: {
    color: Colors.light.white,
    fontSize: 28,
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
    backgroundColor: Colors.light.sky,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 32,
  },
  juryBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
  },
  juryBadgeContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: 24,
    padding: 24,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.navy,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.navy,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.navy,
    fontFamily: 'Inter-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.navy,
    fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  errorMessage: {
    color: Colors.light.error,
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
    color: Colors.light.sky,
    fontFamily: 'Inter-Regular',
  },
});

export default JuryLoginScreen;
