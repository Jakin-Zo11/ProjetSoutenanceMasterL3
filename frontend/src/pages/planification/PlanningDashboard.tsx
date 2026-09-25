import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getPlanning, Soutenance } from '../../services/api/soutenanceApi';

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

  useEffect(() => {
    chargerPlanning();
  }, []);

  const chargerPlanning = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanning();
      setSoutenances(data);
    } catch (e) {
      setError("Impossible de charger le planning des soutenances.");
    } finally {
      setLoading(false);
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
          <button onClick={() => setSelected(null)} style={{ marginTop: '0.5rem' }}>
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanningDashboard;