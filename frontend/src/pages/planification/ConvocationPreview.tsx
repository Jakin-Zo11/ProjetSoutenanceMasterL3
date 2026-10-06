import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConvocation, ConvocationResponse } from '../../services/api/convocationApi';

const ConvocationPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ConvocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getConvocation(Number(id))
      .then((res) => {
        if (res.success) {
          setData(res);
        } else {
          setError(res.message ?? 'Erreur de chargement.');
        }
      })
      .catch(() => setError('Impossible de charger la convocation.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: '1.5rem' }}>Chargement...</p>;
  if (error) return <p style={{ padding: '1.5rem', color: '#ef4444' }}>{error}</p>;
  if (!data?.soutenance) return null;

  const { soutenance } = data;
  const jurys = soutenance.affectations_jury ?? [];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '650px' }}>
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '2rem',
          background: 'white',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem' }}>
          CONVOCATION A LA SOUTENANCE
        </h1>

        <p><strong>Etudiant :</strong> {soutenance.etudiant?.name ?? `#${soutenance.etudiant_id}`}</p>
        <p><strong>Theme :</strong> {soutenance.theme ?? 'Non defini'}</p>
        <p>
          <strong>Date :</strong>{' '}
          {soutenance.date_debut ? new Date(soutenance.date_debut).toLocaleString('fr-FR') : '—'}
        </p>
        <p><strong>Salle :</strong> {soutenance.salle?.name ?? 'Non assignee'}</p>

        <h2 style={{ marginTop: '1.5rem', fontWeight: 600 }}>Membres du jury</h2>
        {jurys.length === 0 ? (
          <p style={{ color: '#64748b' }}>Jury non encore complet.</p>
        ) : (
          <ul>
            {jurys.map((j, idx) => (
              <li key={idx}>
                {j.role} — {j.enseignant?.name}
              </li>
            ))}
          </ul>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
          Merci de vous presenter 15 minutes avant l'heure indiquee.
        </p>
      </div>

      <button
        onClick={() => window.print()}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '0.375rem',
        }}
      >
        Imprimer
      </button>
    </div>
  );
};

export default ConvocationPreview;