/**
 * View — Écran de connexion étudiant (MVVM).
 * Toute la logique est déléguée à useStudentLoginViewModel.
 * Ce composant ne contient que du JSX et des styles.
 *
 * L'export de StudentProfile est conservé ici pour la compatibilité
 * des imports existants (App.tsx, etc.) — il re-exporte depuis types/.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudentLoginViewModel } from '../../hooks/useStudentLoginViewModel';
import type { StudentProfile } from '../../types/etudiant';

// Re-export pour les écrans qui utilisent le profil étudiant.
export type { StudentProfile } from '../../types/etudiant';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudentLoginScreenProps {
  onSuccess: (student: StudentProfile) => void;
  onBack: () => void;
}

// ─── View ─────────────────────────────────────────────────────────────────────

const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({ onSuccess, onBack }) => {
  const vm = useStudentLoginViewModel(onSuccess);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />
      <View style={styles.content}>

        {/* Bouton retour */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Logo-emit.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Accès étudiant</Text>
          <Text style={styles.formSubtitle}>
            Entrez votre matricule pour accéder à votre espace étudiant.
          </Text>

          {/* Champ matricule */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Numéro matricule</Text>
              <Text style={styles.formatHint}>Mode démo · matricule libre</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                vm.showError  && styles.inputError,
                vm.isValid    && styles.inputValid,
              ]}
              value={vm.matricule}
              onChangeText={vm.handleChangeText}
              onBlur={vm.handleBlur}
              placeholder="001I24"
              placeholderTextColor="#9CA3AF"
              keyboardType="default"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              editable={!vm.isLoading}
            />
          </View>

          {/* Aide contextuelle */}
          {!vm.showError && !vm.errorMessage && (
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
              <Text style={styles.hintText}>
                En mode démo, tout matricule non vide est accepté.
              </Text>
            </View>
          )}

          {/* Erreur */}
          {(vm.showError || !!vm.errorMessage) && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#1E3A8A" />
              <Text style={styles.errorText}>
                {vm.errorMessage || 'Format incorrect — exemple valide : 001I24'}
              </Text>
            </View>
          )}

          {/* Bouton connexion */}
          <Pressable
            onPress={vm.handleLogin}
            disabled={vm.isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              vm.isLoading  && styles.loginButtonDisabled,
              pressed && !vm.isLoading && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Accéder à mon espace"
          >
            <Text style={styles.loginButtonText}>
              {vm.isLoading ? 'Connexion en cours…' : 'Accéder à mon espace'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#0A192F',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  formSubtitle: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A192F',
    fontFamily: 'Inter-SemiBold',
  },
  formatHint: {
    fontSize: 12,
    color: '#1E3A8A',
    fontFamily: 'Inter-SemiBold',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  input: {
    backgroundColor: '#EAF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#0A192F',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 5,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  inputValid: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  loginButtonDisabled: {
    opacity: 0.55,
  },
});

export default StudentLoginScreen;
