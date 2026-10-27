import React, { useEffect, useState } from 'react';
import { getParametres, updateParametres } from '../../services/api/parametresApi';

const ParametresPlanificationPage: React.FC = () => {
  const [heureDebut, setHeureDebut] = useState('08:30');
  const [heureFin, setHeureFin] = useState('17:00');
  const [duree, setDuree] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getParametres()
      .then((p) => {
        setHeureDebut(p.heure_debut_journee.slice(0, 5));
        setHeureFin(p.heure_fin_journee.slice(0, 5));
        setDuree(p.duree_minutes);
      })
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les parametres.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);

    if (heureFin <= heureDebut) {
      setMessage({ type: 'error', text: "L'heure de fin doit etre apres l'heure de debut." });
      return;
    }
    if (duree < 15 || duree > 240) {
      setMessage({ type: 'error', text: 'La duree doit etre comprise entre 15 et 240 minutes.' });
      return;
    }

    setSaving(true);
    try {
      const result = await updateParametres({
        heure_debut_journee: heureDebut,
        heure_fin_journee: heureFin,
        duree_minutes: duree,
      });
      setMessage(
        result.success
          ? { type: 'success', text: 'Parametres enregistres.' }
          : { type: 'error', text: "Echec de l'enregistrement." }
      );
    } catch {
      setMessage({ type: 'error', text: "Echec de l'enregistrement (donnees invalides ou serveur indisponible)." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: '1.5rem' }}>Chargement...</p>;

  const fieldStyle = { width: '100%', padding: '0.5rem', marginBottom: '1rem' } as const;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '420px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Contraintes horaires
      </h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Ces valeurs sont utilisees par l'algorithme de planification pour generer les creneaux de chaque journee.
      </p>

      <label style={{ display: 'block', marginBottom: '0.25rem' }}>Debut de journee</label>
      <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} style={fieldStyle} />

      <label style={{ display: 'block', marginBottom: '0.25rem' }}>Fin de journee</label>
      <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} style={fieldStyle} />

      <label style={{ display: 'block', marginBottom: '0.25rem' }}>Duree d'une soutenance (minutes)</label>
      <input
        type="number"
        min={15}
        max={240}
        step={5}
        value={duree}
        onChange={(e) => setDuree(Number(e.target.value))}
        style={fieldStyle}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.375rem' }}
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>

      {message && (
        <p style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#22c55e' }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ParametresPlanificationPage;