import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
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
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Retour">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
          <Text style={styles.juryBadgeText}>🎓 Portail Jury</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion Jury</Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email universitaire</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nom@emit.mg"
              placeholderTextColor="#9CA3AF"
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
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton connexion */}
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}>
            <Text style={styles.loginButtonText}>{isLoading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>

          {/* Mot de passe oublié */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  juryBadge: {
    backgroundColor: '#2D84E0',
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
    fontFamily: 'Inter-SemiBold',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
    shadowColor: '#1A4BA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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

export default JuryLoginScreen;
