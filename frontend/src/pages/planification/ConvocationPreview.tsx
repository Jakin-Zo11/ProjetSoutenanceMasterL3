import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getConvocation,
  diffuserConvocation,
  ConvocationResponse,
  ResultatDiffusion,
} from '../../services/api/convocationApi';

const ConvocationPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ConvocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffusing, setDiffusing] = useState(false);
  const [diffMsg, setDiffMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Vérification stricte de l'ID
    if (!id || id === 'NaN' || isNaN(Number(id))) {
      setError("Identifiant de soutenance invalide ou manquant.");
      setLoading(false);
      return;
    }

    getConvocation(Number(id))
      .then((res) => {
        if (res.success) {
          setData(res);
        } else {
          setError(res.message ?? 'Erreur de chargement.');
        }
      })
      .catch((e) => setError(e?.message ?? 'Impossible de charger la convocation.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDiffuser = async (renvoyer = false) => {
    if (!id) return;
    setDiffusing(true);
    setDiffMsg(null);
    try {
      const r: ResultatDiffusion = await diffuserConvocation(Number(id), renvoyer);
      if (r.deja_diffusee) {
        setDiffMsg({ type: 'success', text: 'Cette convocation a deja ete diffusee. Utilisez « Renvoyer » pour l\'envoyer a nouveau.' });
      } else {
        const probleme = r.erreurs.length > 0 ? ` — ${r.erreurs.join(' ; ')}` : '';
        setDiffMsg({
          type: r.erreurs.length > 0 ? 'error' : 'success',
          text: `Convocation diffusee : ${r.notifications} notification(s) etudiant, ${r.mails_envoyes} e-mail(s) envoye(s)${probleme}`,
        });
      }
      const maj = await getConvocation(Number(id));
      if (maj.success) setData(maj);
    } catch (e: any) {
      setDiffMsg({ type: 'error', text: e?.message ?? 'Echec de la diffusion.' });
    } finally {
      setDiffusing(false);
    }
  };

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

      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <div className="no-print" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '0.375rem',
          }}
        >
          Imprimer
        </button>

        {data.diffusee ? (
          <>
            <span style={{ color: '#16a34a' }}>
              ✓ Diffusée le {data.convocation?.diffusee_le ? new Date(data.convocation.diffusee_le).toLocaleString('fr-FR') : ''}
            </span>
            <button
              onClick={() => handleDiffuser(true)}
              disabled={diffusing}
              style={{ padding: '0.5rem 1rem', border: '1px solid #94a3b8', borderRadius: '0.375rem' }}
            >
              {diffusing ? 'Envoi...' : 'Renvoyer'}
            </button>
          </>
        ) : (
          <button
            onClick={() => handleDiffuser(false)}
            disabled={diffusing}
            style={{
              padding: '0.5rem 1rem',
              background: '#16a34a',
              color: 'white',
              borderRadius: '0.375rem',
            }}
          >
            {diffusing ? 'Envoi...' : 'Diffuser la convocation'}
          </button>
        )}
      </div>

      {diffMsg && (
        <p
          className="no-print"
          style={{ marginTop: '0.75rem', color: diffMsg.type === 'error' ? '#ef4444' : '#16a34a' }}
        >
          {diffMsg.text}
        </p>
      )}
    </div>
  );
};

export default ConvocationPreview;