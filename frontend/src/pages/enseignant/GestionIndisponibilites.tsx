import React, { useState, useEffect } from 'react';

interface Indisponibilite {
  id: number;
  enseignant_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  motif?: string;
}

interface Props {
  enseignantId: number; // Identifiant de l'enseignant connecté
}

export const GestionIndisponibilites: React.FC<Props> = ({ enseignantId }) => {
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Formulaire
  const [date, setDate] = useState<string>('');
  const [heureDebut, setHeureDebut] = useState<string>('08:00');
  const [heureFin, setHeureFin] = useState<string>('12:00');
  const [motif, setMotif] = useState<string>('');

  const API_URL = 'http://localhost:8000/api';

  // Charger la liste des indisponibilités
  const fetchIndisponibilites = async () => {
    try {
      const res = await fetch(`${API_URL}/enseignants/${enseignantId}/indisponibilites`);
      if (res.ok) {
        const data = await res.json();
        setIndisponibilites(data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des indisponibilités:', err);
    }
  };

  useEffect(() => {
    if (enseignantId) {
      fetchIndisponibilites();
    }
  }, [enseignantId]);

  // Ajouter une indisponibilité
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !heureDebut || !heureFin) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/indisponibilites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          enseignant_id: enseignantId,
          date,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          motif,
        }),
      });

      if (res.ok) {
        setDate('');
        setMotif('');
        await fetchIndisponibilites();
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.message || 'Impossible d\'ajouter l\'indisponibilité'}`);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une indisponibilité
  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return;

    try {
      const res = await fetch(`${API_URL}/indisponibilites/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setIndisponibilites(indisponibilites.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Gestion de mes Indisponibilités</h2>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Déclarer une absence / indisponibilité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label>Motif (optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Cours, Réunion, Conflit personnel..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label>Heure de début *</label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label>Heure de fin *</label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Enregistrement...' : 'Ajouter le créneau'}
        </button>
      </form>

      {/* Liste des créneaux */}
      <h3>Créneaux enregistrés</h3>
      {indisponibilites.length === 0 ? (
        <p>Aucune indisponibilité enregistrée pour le moment.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Horaires</th>
              <th style={{ padding: '10px' }}>Motif</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {indisponibilites.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{item.date}</td>
                <td style={{ padding: '10px' }}>{item.heure_debut} - {item.heure_fin}</td>
                <td style={{ padding: '10px' }}>{item.motif || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ color: 'red', border: '1px solid red', background: 'transparent', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};