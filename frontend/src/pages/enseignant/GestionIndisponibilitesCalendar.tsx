import React, { useState, useEffect } from 'react';
import {
  Indisponibilite,
  getIndisponibilites,
  createIndisponibilite,
  deleteIndisponibilite,
} from '../../services/api/indisponibiliteApi';

interface Props {
  enseignantId: number;
}

export const GestionIndisponibilitesCalendar: React.FC<Props> = ({ enseignantId }) => {
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  const [date, setDate] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = async () => {
    try {
      setIndisponibilites(await getIndisponibilites(enseignantId));
    } catch (e: any) {
      setErreur(e?.message ?? 'Erreur de chargement.');
    }
  };

  useEffect(() => {
    charger();
  }, [enseignantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !heureDebut || !heureFin) return;

    setLoading(true);
    setErreur(null);
    try {
      await createIndisponibilite({
        enseignant_id: enseignantId,
        date,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        motif: motif || undefined,
      });
      setDate('');
      setHeureDebut('');
      setHeureFin('');
      setMotif('');
      await charger();
    } catch (err: any) {
      setErreur(err?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setErreur(null);
    try {
      await deleteIndisponibilite(id);
      setIndisponibilites((liste) => liste.filter((i) => i.id !== id));
    } catch (err: any) {
      setErreur(err?.message ?? 'Suppression impossible.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Gestion des Indisponibilités (Enseignant #{enseignantId})</h2>

      {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}

      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Ajouter une plage d'indisponibilité</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <div>
            <label>Date : </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>De : </label>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} required />
          </div>
          <div>
            <label>À : </label>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} required />
          </div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Motif (ex: Conférence, Congé...)"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la plage'}
        </button>
      </form>

      <h3>Plages déclarées</h3>
      {indisponibilites.length === 0 ? (
        <p>Aucune indisponibilité enregistrée pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {indisponibilites.map((item) => (
            <li
              key={item.id}
              style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong>Le :</strong> {new Date(item.date).toLocaleDateString('fr-FR')} &nbsp;
                <strong>de</strong> {item.heure_debut.slice(0, 5)} <strong>à</strong> {item.heure_fin.slice(0, 5)}
                {item.motif && <div><em>Motif : {item.motif}</em></div>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                style={{ padding: '4px 10px', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
