import React, { useState } from 'react';
import { planifierSoutenance } from '../../services/api/soutenanceApi';

interface ReplanificationModalProps {
  soutenanceId: number;
  isOpen: boolean;
  onClose: () => void;
  onReplanified: () => void;
}

const ReplanificationModal: React.FC<ReplanificationModalProps> = ({
  soutenanceId,
  isOpen,
  onClose,
  onReplanified,
}) => {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!date) return;
    setLoading(true);
    setError(null);

    const result = await planifierSoutenance(soutenanceId, date);

    setLoading(false);

    if (result.success) {
      onReplanified();
      onClose();
    } else {
      setError(result.message ?? 'Aucun creneau disponible pour cette date.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '400px' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Replanifier la soutenance</h2>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nouvelle date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!date || loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem',
            }}
          >
            {loading ? 'Replanification...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplanificationModal;