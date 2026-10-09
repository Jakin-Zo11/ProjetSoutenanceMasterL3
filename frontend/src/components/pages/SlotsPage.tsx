import React, { useState } from 'react';
import { CalendarDays, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '../admin';
import { useAdminData, type TimeSlot } from '../../context/AdminDataContext';

const formatTime = (value: string) => value.replace(':', 'h');

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatRange = (timeSlot: TimeSlot) => `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`;

const formatDuration = (timeSlot: TimeSlot) => {
  const diff = toMinutes(timeSlot.endTime) - toMinutes(timeSlot.startTime);
  if (diff <= 0) return '—';
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`;
};

const SlotsPage: React.FC = () => {
  const { session, timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useAdminData();
  const [form, setForm] = useState({ startTime: '08:00', endTime: '10:00' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const submitTimeSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (toMinutes(form.endTime) <= toMinutes(form.startTime)) {
      setFeedback('L’heure de fin doit être postérieure à l’heure de début.');
      return;
    }
    setSaving(true);
    setFeedback('');
    try {
      if (editingId !== null) {
        await updateTimeSlot(editingId, form);
        setFeedback('Créneau mis à jour.');
      } else {
        await addTimeSlot(form);
        setFeedback('Créneau ajouté aux plages horaires de référence.');
      }
      setForm({ startTime: '08:00', endTime: '10:00' });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (timeSlot: TimeSlot) => {
    setEditingId(timeSlot.id);
    setFeedback('');
    setForm({ startTime: timeSlot.startTime, endTime: timeSlot.endTime });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ startTime: '08:00', endTime: '10:00' });
  };

  const removeTimeSlot = async (timeSlot: TimeSlot) => {
    await deleteTimeSlot(timeSlot.id);
    setFeedback(`Créneau ${formatRange(timeSlot)} supprimé.`);
    if (editingId === timeSlot.id) cancelEdit();
  };

  const sortedTimeSlots = [...timeSlots].sort((first, second) => toMinutes(first.startTime) - toMinutes(second.startTime));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="flex items-center justify-between rounded-xl border border-[#DDEAF7] bg-white p-5">
          <div>
            <p className="text-sm text-[#637799]">Période fixe</p>
            <p className="mt-1 font-bold text-[#0A192F]">{session.startDate} – {session.endDate}</p>
          </div>
          <CalendarDays className="text-[#3B82F6]" aria-hidden="true" />
        </article>
        <article className="flex items-center justify-between rounded-xl border border-[#DDEAF7] bg-white p-5">
          <div>
            <p className="text-sm text-[#637799]">Plages horaires de référence</p>
            <p className="mt-1 text-2xl font-bold text-[#0A192F]">{timeSlots.length}</p>
          </div>
          <Clock className="text-[#3B82F6]" aria-hidden="true" />
        </article>
      </section>

      <p className="text-sm text-[#637799]">
        Définissez les blocs horaires types de l’établissement. Ces plages seront proposées lors de la planification des soutenances.
      </p>

      <form onSubmit={submitTimeSlot} className="grid gap-3 rounded-xl border border-[#DDEAF7] bg-white p-5 sm:grid-cols-3">
        <h2 className="flex items-center gap-2 font-bold text-[#0A192F] sm:col-span-3">
          <Plus size={18} aria-hidden="true" />
          {editingId !== null ? 'Modifier un créneau' : 'Ajouter un créneau'}
        </h2>
        <label className="text-sm font-medium text-[#334155]">
          Heure de début
          <input
            required
            type="time"
            value={form.startTime}
            onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
          />
        </label>
        <label className="text-sm font-medium text-[#334155]">
          Heure de fin
          <input
            required
            type="time"
            value={form.endTime}
            onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
          />
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <button disabled={saving} className="rounded-lg bg-[#1E3A8A] px-4 py-2.5 font-semibold text-white disabled:opacity-60">
            {saving ? 'Enregistrement...' : editingId !== null ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit} className="rounded-lg border border-[#DDEAF7] px-4 py-2.5 font-semibold text-[#334155]">
              Annuler
            </button>
          )}
        </div>
        {feedback && <p role="status" className="text-sm text-[#1E3A8A] sm:col-span-3">{feedback}</p>}
      </form>

      <DataTable columns={[
        { key: 'range', label: 'Créneau', render: (_value: unknown, row: TimeSlot) => <span className="font-semibold text-[#0A192F]">{formatRange(row)}</span> },
        { key: 'duration', label: 'Durée', render: (_value: unknown, row: TimeSlot) => formatDuration(row) },
        {
          key: 'actions',
          label: 'Actions',
          render: (_value: unknown, row: TimeSlot) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#3B82F6] px-2.5 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#EAF4FF]"
              >
                <Pencil size={14} aria-hidden="true" /> Modifier
              </button>
              <button
                type="button"
                onClick={() => void removeTimeSlot(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E11D48] px-2.5 py-1.5 text-xs font-semibold text-[#E11D48] hover:bg-[#FFF1F2]"
              >
                <Trash2 size={14} aria-hidden="true" /> Supprimer
              </button>
            </div>
          ),
        },
      ]} data={sortedTimeSlots} />
    </div>
  );
};

export default SlotsPage;
