import React, { useState } from 'react';
import { optimiserPlanning, ResultatOptimisation } from '../../services/api/optimisationApi';

interface Props {
  onApplied: () => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const OptimisationPanel: React.FC<Props> = ({ onApplied }) => {
  const [resultat, setResultat] = useState<ResultatOptimisation | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lancer = async (appliquer: boolean) => {
    setLoading(true);
    setErreur(null);
    try {
      const r = await optimiserPlanning(appliquer);
      setResultat(r);
      if (appliquer && r.appliquee) onApplied();
    } catch (e: any) {
      setErreur(e?.message ?? "Echec de l'optimisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <strong>Optimisation du planning</strong>
          <p style={{ margin: 0, color: '#64748b' }}>
            Regroupe les soutenances sur moins de jours, en commençant chaque journée à l'heure d'ouverture (voir Paramètres), le plus tôt possible et sans créer de conflit.
            Les soutenances déjà validées ne sont pas déplacées.
          </p>
        </div>
        <button
          onClick={() => lancer(false)}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', background: '#7c3aed', color: 'white', borderRadius: '0.375rem' }}
        >
          {loading ? 'Analyse...' : 'Proposer une optimisation'}
        </button>
      </div>

      {erreur && <p style={{ color: '#ef4444', marginTop: '0.75rem' }}>{erreur}</p>}

      {resultat && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ margin: 0, color: resultat.appliquee ? '#16a34a' : '#0f172a' }}>{resultat.message}</p>

          <p style={{ margin: '0.5rem 0', color: '#334155' }}>
            Jours utilisés : <strong>{resultat.avant.jours} → {resultat.apres.jours}</strong>
            {' · '}Temps inoccupé : <strong>{resultat.avant.minutes_inactives} → {resultat.apres.minutes_inactives} min</strong>
            {' · '}Conflits : <strong>{resultat.avant.conflits} → {resultat.apres.conflits}</strong>
            {resultat.figees > 0 && <> {' · '}{resultat.figees} soutenance(s) validée(s) conservée(s)</>}
          </p>

          {resultat.deplacements.length > 0 && (
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
              {resultat.deplacements.map((d) => (
                <li key={d.soutenance_id}>
                  {d.etudiant}
                  {d.theme ? ` (${d.theme})` : ''} : {fmt(d.de.date_debut)} → <strong>{fmt(d.vers.date_debut)}</strong>
                  {d.de.salle_id !== d.vers.salle_id ? ` · salle #${d.de.salle_id} → #${d.vers.salle_id}` : ''}
                </li>
              ))}
            </ul>
          )}

          {!resultat.appliquee && resultat.deplacements.length > 0 && (
            <button
              onClick={() => lancer(true)}
              disabled={loading}
              style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', borderRadius: '0.375rem' }}
            >
              {loading ? 'Application...' : "Appliquer l'optimisation"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimisationPanel;
