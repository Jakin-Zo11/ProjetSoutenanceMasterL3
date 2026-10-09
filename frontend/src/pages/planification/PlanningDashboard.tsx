import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getPlanning, planifierSoutenance, Soutenance } from '../../services/api/soutenanceApi';
import ReplanificationModal from './ReplanificationModal';

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#94a3b8',
  planifiee: '#3b82f6',
  en_cours: '#f59e0b',
  terminee: '#22c55e',
  annulee: '#ef4444',
};

const PlanningDashboard: React.FC = () => {
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Soutenance | null>(null);
  const [replanifierId, setReplanifierId] = useState<number | null>(null);
  const [dateChoisie, setDateChoisie] = useState<Record<number, string>>({});
  const [planifMessage, setPlanifMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [planifLoading, setPlanifLoading] = useState<number | null>(null);

  useEffect(() => {
    chargerPlanning();
  }, []);

  const chargerPlanning = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanning();
      setSoutenances(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de charger le planning des soutenances.");
    } finally {
      setLoading(false);
    }
  };

  const enAttente = soutenances.filter((s) => s.statut === 'en_attente');

  const handlePlanifier = async (soutenanceId: number) => {
    const date = dateChoisie[soutenanceId];
    const dateValide = /^\d{4}-\d{2}-\d{2}$/.test(date ?? '');
    if (!dateValide) {
      setPlanifMessage({ type: 'error', text: 'Date invalide — utilise le selecteur calendrier.' });
      return;
    }

    setPlanifLoading(soutenanceId);
    setPlanifMessage(null);

    const result = await planifierSoutenance(soutenanceId, date);

    setPlanifLoading(null);

    if (result.success) {
      setPlanifMessage({ type: 'success', text: 'Soutenance planifiee avec succes.' });
      chargerPlanning();
    } else {
      setPlanifMessage({ type: 'error', text: result.message ?? 'Aucun creneau disponible pour cette date.' });
    }
  };

  const events = soutenances
    .filter((s) => s.date_debut && s.date_fin)
    .map((s) => ({
      id: String(s.id),
      title: s.theme ?? `Soutenance #${s.id}`,
      start: s.date_debut as string,
      end: s.date_fin as string,
      backgroundColor: STATUT_COLORS[s.statut] ?? '#94a3b8',
      borderColor: STATUT_COLORS[s.statut] ?? '#94a3b8',
      extendedProps: { soutenance: s },
    }));

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Planning des soutenances
      </h1>

      {loading && <p>Chargement du planning...</p>}
      {error && (
        <p style={{ color: '#ef4444' }}>
          {error}{' '}
          <button onClick={chargerPlanning} style={{ textDecoration: 'underline' }}>
            Reessayer
          </button>
        </p>
      )}

      {!loading && !error && (
        <>
          {enAttente.length > 0 && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: '#f8fafc',
              }}
            >
              <h2 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                Soutenances en attente de planification ({enAttente.length})
              </h2>
              {enAttente.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ flex: 1 }}>{s.theme ?? `Soutenance #${s.id}`}</span>
                  <input
                    type="date"
                    value={dateChoisie[s.id] ?? ''}
                    onChange={(e) =>
                      setDateChoisie((cur) => ({ ...cur, [s.id]: e.target.value }))
                    }
                    style={{ padding: '0.35rem' }}
                  />
                  <button
                    onClick={() => handlePlanifier(s.id)}
                    disabled={planifLoading === s.id}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {planifLoading === s.id ? 'Planification...' : 'Planifier'}
                  </button>
                </div>
              ))}
              {planifMessage && (
                <p
                  style={{
                    marginTop: '0.75rem',
                    color: planifMessage.type === 'error' ? '#ef4444' : '#22c55e',
                  }}
                >
                  {planifMessage.text}
                </p>
              )}
            </div>
          )}

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            locale="fr"
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            events={events}
            eventClick={(info) => {
              setSelected(info.event.extendedProps.soutenance as Soutenance);
            }}
            height="auto"
          />
        </>
      )}

      {selected && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            background: '#f8fafc',
          }}
        >
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {selected.theme ?? `Soutenance #${selected.id}`}
          </h2>
          <p>Statut : {selected.statut}</p>
          <p>Salle : {selected.salle_id ?? 'Non assignee'}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={() => setReplanifierId(selected.id)}>
              Replanifier
            </button>
            <button onClick={() => setSelected(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <ReplanificationModal
        soutenanceId={replanifierId ?? 0}
        isOpen={replanifierId !== null}
        onClose={() => setReplanifierId(null)}
        onReplanified={() => {
          chargerPlanning();
          setSelected(null);
        }}
      />
    </div>
  );
};

export default PlanningDashboard;