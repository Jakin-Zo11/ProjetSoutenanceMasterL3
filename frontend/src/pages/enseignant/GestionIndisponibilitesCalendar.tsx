import React, { useState, useEffect } from 'react';

interface Indisponibilite {
  id?: number;
  date_debut: string;
  date_fin: string;
  motif?: string;
}

interface Props {
  enseignantId: number;
}

export const GestionIndisponibilitesCalendar: React.FC<Props> = ({ enseignantId }) => {
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les indisponibilités depuis le backend Laravel
  const fetchIndisponibilites = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/enseignants/${enseignantId}/indisponibilites`);
      if (response.ok) {
        const data = await response.json();
        setIndisponibilites(data);
      }
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  useEffect(() => {
    fetchIndisponibilites();
  }, [enseignantId]);

  // Ajouter une indisponibilité
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !dateFin) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/enseignants/${enseignantId}/indisponibilites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_debut: dateDebut,
          date_fin: dateFin,
          motif: motif
        }),
      });

      if (response.ok) {
        setDateDebut('');
        setDateFin('');
        setMotif('');
        fetchIndisponibilites();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error("Erreur d'envoi :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Gestion des Indisponibilités (Enseignant #{enseignantId})</h2>

      {/* Formulaire de saisie rapide */}
      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Ajouter une plage d'indisponibilité</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <div>
            <label>Début : </label>
            <input 
              type="datetime-local" 
              value={dateDebut} 
              onChange={(e) => setDateDebut(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Fin : </label>
            <input 
              type="datetime-local" 
              value={dateFin} 
              onChange={(e) => setDateFin(e.target.value)} 
              required 
            />
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
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Enregistrement...' : 'Enregistrer la plage'}
        </button>
      </form>

      {/* Liste des indisponibilités enregistrées */}
      <h3>Plages déclarées</h3>
      {indisponibilites.length === 0 ? (
        <p>Aucune indisponibilité enregistrée pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {indisponibilites.map((item, index) => (
            <li key={item.id || index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Du :</strong> {new Date(item.date_debut).toLocaleString('fr-FR')} <br />
                <strong>Au :</strong> {new Date(item.date_fin).toLocaleString('fr-FR')}
                {item.motif && <div><em>Motif : {item.motif}</em></div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};