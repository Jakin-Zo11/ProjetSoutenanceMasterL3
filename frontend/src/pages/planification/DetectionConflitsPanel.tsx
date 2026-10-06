import React, { useEffect, useState } from 'react';
import { getConflits, Conflit } from '../../services/api/convocationApi';

const DetectionConflitsPanel: React.FC = () => {
  const [conflits, setConflits] = useState<Conflit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConflits()
      .then((data) => setConflits(Array.isArray(data) ? data : []))
      .catch(() => setError('Impossible de verifier les conflits.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '1.5rem' }}>Verification des conflits...</p>;
  if (error) return <p style={{ padding: '1.5rem', color: '#ef4444' }}>{error}</p>;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Detection de conflits
      </h1>

      {conflits.length === 0 ? (
        <p style={{ color: '#22c55e' }}>Aucun conflit detecte dans le planning actuel.</p>
      ) : (
        <ul>
          {conflits.map((c, idx) => (
            <li
              key={idx}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                borderLeft: '4px solid #ef4444',
                background: '#fef2f2',
              }}
            >
              <strong>{c.type === 'salle' ? 'Conflit de salle' : 'Conflit de jury'}</strong>
              <p>{c.detail}</p>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Soutenances #{c.soutenance_a} et #{c.soutenance_b}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DetectionConflitsPanel;