import React, { useEffect, useState } from 'react';
import { getSoutenancesEnAttente, Soutenance } from '../../services/api/soutenanceApi';
import { getEnseignants, Enseignant } from '../../services/api/enseignantApi';
import {
  getAffectations,
  affecterJury,
  retirerAffectation,
  AffectationJury,
} from '../../services/api/affectationJuryApi';

const ROLES: { value: AffectationJury['role']; label: string }[] = [
  { value: 'president', label: 'President' },
  { value: 'rapporteur', label: 'Rapporteur' },
  { value: 'examinateur', label: 'Examinateur' },
];

const AffectationJurysPage: React.FC = () => {
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedSoutenanceId, setSelectedSoutenanceId] = useState<number | null>(null);
  const [affectations, setAffectations] = useState<AffectationJury[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<AffectationJury['role']>('president');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSoutenancesEnAttente(), getEnseignants()])
      .then(([s, e]) => {
        setSoutenances(s);
        setEnseignants(e);
      })
      .catch(() => setMessage({ type: 'error', text: 'Erreur de chargement des donnees.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSoutenanceId) {
      getAffectations(selectedSoutenanceId).then(setAffectations);
    } else {
      setAffectations([]);
    }
  }, [selectedSoutenanceId]);

  const rolesRestants = ROLES.filter(
    (r) => !affectations.some((a) => a.role === r.value)
  );

  const handleAffecter = async () => {
    if (!selectedSoutenanceId || !selectedEnseignant) return;
    setMessage(null);

    const result = await affecterJury(selectedSoutenanceId, Number(selectedEnseignant), selectedRole);

    if (result.success) {
      setMessage({ type: 'success', text: 'Enseignant affecte avec succes.' });
      setSelectedEnseignant('');
      const updated = await getAffectations(selectedSoutenanceId);
      setAffectations(updated);
    } else {
      setMessage({ type: 'error', text: result.message ?? 'Erreur lors de l\'affectation.' });
    }
  };

  const handleRetirer = async (affectationId: number) => {
    await retirerAffectation(affectationId);
    if (selectedSoutenanceId) {
      const updated = await getAffectations(selectedSoutenanceId);
      setAffectations(updated);
    }
  };

  if (loading) return <p style={{ padding: '1.5rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Affectation des jurys
      </h1>

      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
        Soutenance
      </label>
      <select
        value={selectedSoutenanceId ?? ''}
        onChange={(e) => setSelectedSoutenanceId(e.target.value ? Number(e.target.value) : null)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1.5rem' }}
      >
        <option value="">-- Choisir une soutenance en attente --</option>
        {soutenances.map((s) => (
          <option key={s.id} value={s.id}>
            {s.theme ?? `Soutenance #${s.id}`}
          </option>
        ))}
      </select>

      {selectedSoutenanceId && (
        <>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Jurys affectes</h2>
          {affectations.length === 0 && <p style={{ color: '#64748b' }}>Aucun jury affecte pour l'instant.</p>}
          <ul style={{ marginBottom: '1.5rem' }}>
            {affectations.map((a) => (
              <li
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <span>
                  <strong>{ROLES.find((r) => r.value === a.role)?.label}</strong> —{' '}
                  {a.enseignant?.nom ?? `Enseignant #${a.enseignant_id}`}
                </span>
                <button onClick={() => handleRetirer(a.id)} style={{ color: '#ef4444' }}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>

          {rolesRestants.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Enseignant</label>
                <select
                  value={selectedEnseignant}
                  onChange={(e) => setSelectedEnseignant(e.target.value ? Number(e.target.value) : '')}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">-- Choisir --</option>
                  {enseignants.map((en) => (
                    <option key={en.id} value={en.id}>
                      {en.nom} {en.prenom ?? ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AffectationJury['role'])}
                  style={{ padding: '0.5rem' }}
                >
                  {rolesRestants.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAffecter}
                disabled={!selectedEnseignant}
                style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.375rem' }}
              >
                Affecter
              </button>
            </div>
          ) : (
            <p style={{ color: '#22c55e' }}>Les 3 roles sont deja attribues.</p>
          )}
        </>
      )}

      {message && (
        <p style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#22c55e' }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default AffectationJurysPage;