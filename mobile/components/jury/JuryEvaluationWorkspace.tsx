
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import evaluationApi, {
  type JurySession,
  type SimpleEvaluation,
  updateJuryNote,
  logout,
} from '../../services/evaluationApi';

interface JuryEvaluationWorkspaceProps {
  session: JurySession;
  onExit: () => void;
}

const JuryEvaluationWorkspace: React.FC<JuryEvaluationWorkspaceProps> = ({
  session,
  onExit,
}) => {
  const [evaluations, setEvaluations] = useState<SimpleEvaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<SimpleEvaluation | null>(null);
  const [note, setNote] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshEvaluations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await evaluationApi.listAssignedEvaluations(session.token);
      setEvaluations(result);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de charger les évaluations.',
      );
    } finally {
      setLoading(false);
    }
  }, [session.token]);

  useEffect(() => {
    void refreshEvaluations();
  }, [refreshEvaluations]);

  const openEvaluation = (evaluation: SimpleEvaluation) => {
    setSelectedEvaluation(evaluation);
    setNote(
      evaluation.note_generale !== null &&
      evaluation.note_generale !== undefined
        ? String(evaluation.note_generale)
        : '',
    );
    setComment(evaluation.commentary ?? '');
    setError('');
    setNotice('');
  };

  const handleSave = async () => {
    if (!selectedEvaluation || busy) return;

    const parsedNote = Number(note.replace(',', '.'));

    if (
      note.trim() === '' ||
      !Number.isFinite(parsedNote) ||
      parsedNote < 0 ||
      parsedNote > 20
    ) {
      setError('La note doit être comprise entre 0 et 20.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const updated = await updateJuryNote(
        session.token,
        selectedEvaluation.id,
        parsedNote,
        comment.trim() || null,
      );

      const nextEvaluation: SimpleEvaluation = {
        ...selectedEvaluation,
        ...updated,
        note_generale: parsedNote,
        commentary: comment.trim() || null,
      };

      setSelectedEvaluation(nextEvaluation);
      setEvaluations((current) =>
        current.map((item) =>
          item.id === nextEvaluation.id ? nextEvaluation : item,
        ),
      );
      setNotice('Note globale enregistrée.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible d’enregistrer la note.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);

    try {
      await logout(session.token);
    } catch (e) {
      Alert.alert(
        'Déconnexion',
        e instanceof Error ? e.message : 'Erreur de déconnexion.',
      );
    } finally {
      setBusy(false);
      onExit();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ESPACE JURY</Text>
          <Text style={styles.title}>
            {selectedEvaluation ? 'Évaluation' : 'Mes évaluations'}
          </Text>
          <Text style={styles.subtitle}>{session.user.name}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
          onPress={() => void handleLogout()}
          disabled={busy}
          style={styles.iconButton}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={Colors.light.primary}
          />
        </Pressable>
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {selectedEvaluation ? (
          <View style={styles.card}>
            <Pressable
              onPress={() => {
                setSelectedEvaluation(null);
                setError('');
                setNotice('');
              }}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={Colors.light.primary}
              />
              <Text style={styles.backText}>Toutes les évaluations</Text>
            </Pressable>

            <Text style={styles.heading}>
              {selectedEvaluation.student_name}
            </Text>
            <Text style={styles.meta}>{selectedEvaluation.theme}</Text>
            <Text style={styles.meta}>
              Date : {selectedEvaluation.date}
            </Text>
            <Text style={styles.meta}>
              Heure : {selectedEvaluation.heure}
            </Text>
            <Text style={styles.meta}>
              Salle : {selectedEvaluation.salle}
            </Text>

            <Text style={styles.label}>Note globale sur 20</Text>
            <TextInput
              accessibilityLabel="Note globale sur 20"
              editable={!busy}
              keyboardType="decimal-pad"
              value={note}
              onChangeText={(value) =>
                setNote(value.replace(',', '.'))
              }
              placeholder="Exemple : 15.5"
              style={styles.input}
            />

            <Text style={styles.label}>Commentaire général</Text>
            <TextInput
              accessibilityLabel="Commentaire général"
              editable={!busy}
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Commentaire facultatif"
              style={[styles.input, styles.commentInput]}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => void handleSave()}
              disabled={busy}
              style={[styles.button, busy && styles.disabled]}
            >
              <Text style={styles.buttonText}>
                {busy ? 'Enregistrement…' : 'Enregistrer la note'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => void refreshEvaluations()}
              disabled={loading}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Chargement…' : 'Actualiser'}
              </Text>
            </Pressable>

            {loading ? (
              <ActivityIndicator
                color={Colors.light.primary}
                style={styles.loader}
              />
            ) : evaluations.length > 0 ? (
              evaluations.map((evaluation) => (
                <Pressable
                  key={evaluation.id}
                  onPress={() => openEvaluation(evaluation)}
                  style={styles.card}
                >
                  <Text style={styles.heading}>
                    {evaluation.student_name}
                  </Text>
                  <Text style={styles.meta}>{evaluation.theme}</Text>
                  <Text style={styles.meta}>
                    Date : {evaluation.date}
                  </Text>
                  <Text style={styles.meta}>
                    Note : {evaluation.note_generale ?? 'Non notée'} / 20
                  </Text>
                  <Text style={styles.openLink}>
                    Ouvrir l’évaluation ›
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.empty}>
                Aucune évaluation commencée pour ce compte.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderBottomColor: Colors.light.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  eyebrow: {
    color: Colors.light.sky,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: Colors.light.navy,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 3,
  },
  subtitle: {
    color: Colors.light.muted,
    fontSize: 13,
    marginTop: 2,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderColor: Colors.light.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    fontSize: 14,
    margin: 16,
    padding: 12,
  },
  notice: {
    backgroundColor: '#ECFDF5',
    color: '#166534',
    fontSize: 14,
    margin: 16,
    padding: 12,
  },
  empty: {
    color: Colors.light.muted,
    padding: 18,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 16,
  },
  backText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  heading: {
    color: Colors.light.navy,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: Colors.light.muted,
    fontSize: 13,
    marginTop: 6,
  },
  label: {
    color: Colors.light.navy,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
  },
  input: {
    backgroundColor: Colors.light.white,
    borderColor: Colors.light.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.light.navy,
    fontSize: 15,
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  commentInput: {
    minHeight: 90,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  openLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
});

export default JuryEvaluationWorkspace;
