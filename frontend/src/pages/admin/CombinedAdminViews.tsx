import React, { useState } from 'react';
import { DataTable } from '../../components/admin';
import GroupedAdminPage from '../../components/admin/GroupedAdminPage';
import { useAdminData } from '../../context/AdminDataContext';

const TeachersView: React.FC = () => {
  const { teachers, addTeacher } = useAdminData();
  const [form, setForm] = useState({ nom: '', prenom: '', specialite: '', grade: '' });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const submitTeacher = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await addTeacher({
        ...form,
        email: '',
        telephone: '',
        status: 'Actif',
        isAvailable: true,
      });
      setForm({ nom: '', prenom: '', specialite: '', grade: '' });
      setFeedback('Enseignant ajouté aux données locales.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’ajouter cet enseignant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submitTeacher} className="grid gap-3 rounded-xl border border-[#DDEAF7] bg-white p-5 md:grid-cols-2">
        <h2 className="font-bold text-[#0A192F] md:col-span-2">Ajouter un enseignant</h2>
        {([
          ['prenom', 'Prénom'],
          ['nom', 'Nom'],
          ['specialite', 'Spécialité'],
          ['grade', 'Grade'],
        ] as const).map(([key, label]) => (
          <label key={key} className="text-sm font-medium text-[#334155]">
            {label}
            <input required value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3" />
          </label>
        ))}
        <button disabled={saving} className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-60 md:col-span-2">
          {saving ? 'Enregistrement...' : 'Ajouter'}
        </button>
        {feedback && <p role="status" className="text-sm text-[#1E3A8A] md:col-span-2">{feedback}</p>}
      </form>
      <DataTable columns={[
        { key: 'prenom', label: 'Prénom' },
        { key: 'nom', label: 'Nom' },
        { key: 'specialite', label: 'Spécialité' },
        { key: 'grade', label: 'Grade' },
        { key: 'status', label: 'Statut' },
        { key: 'isAvailable', label: 'Disponibilité', render: (available: boolean) => available ? 'Disponible' : 'Indisponible' },
      ]} data={teachers} />
    </div>
  );
};

const JuriesView: React.FC = () => {
  const { defenseSlots } = useAdminData();
  const juryRows = defenseSlots.flatMap((slot) => slot.jury.map((member) => ({
    id: `${slot.id}-${member.id}`,
    student: slot.studentName,
    teacher: member.teacherName,
    role: member.role,
    date: slot.date,
    time: slot.timeStart,
  })));
  return <DataTable columns={[
    { key: 'student', label: 'Étudiant' },
    { key: 'teacher', label: 'Enseignant' },
    { key: 'role', label: 'Rôle' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' },
  ]} data={juryRows} />;
};

const DefensesView: React.FC = () => {
  const { defenseSlots } = useAdminData();
  return <DataTable columns={[
    { key: 'studentName', label: 'Étudiant' },
    { key: 'studentMatricule', label: 'Matricule' },
    { key: 'themeTitle', label: 'Thème' },
    { key: 'date', label: 'Date' },
    { key: 'timeStart', label: 'Heure' },
    { key: 'room', label: 'Salle' },
    { key: 'status', label: 'Statut' },
  ]} data={defenseSlots} />;
};

const RoomsView: React.FC = () => {
  const { rooms, addRoom } = useAdminData();
  const [form, setForm] = useState({ nom: '', capacite: '30', batiment: '', equipements: '' });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const submitRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await addRoom({
        nom: form.nom,
        capacite: Number(form.capacite),
        batiment: form.batiment,
        equipements: form.equipements.split(',').map((item) => item.trim()).filter(Boolean),
        disponible: true,
      });
      setForm({ nom: '', capacite: '30', batiment: '', equipements: '' });
      setFeedback('Salle ajoutée aux données locales.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’ajouter cette salle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submitRoom} className="grid gap-3 rounded-xl border border-[#DDEAF7] bg-white p-5 md:grid-cols-2">
        <h2 className="font-bold text-[#0A192F] md:col-span-2">Ajouter une salle</h2>
        {([
          ['nom', 'Nom de salle'],
          ['capacite', 'Capacité'],
          ['batiment', 'Bâtiment'],
          ['equipements', 'Équipements (séparés par des virgules)'],
        ] as const).map(([key, label]) => (
          <label key={key} className="text-sm font-medium text-[#334155]">
            {label}
            <input required value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3" />
          </label>
        ))}
        <button disabled={saving} className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-60 md:col-span-2">
          {saving ? 'Enregistrement...' : 'Ajouter la salle'}
        </button>
        {feedback && <p role="status" className="text-sm text-[#1E3A8A] md:col-span-2">{feedback}</p>}
      </form>
      <DataTable columns={[
        { key: 'nom', label: 'Salle' },
        { key: 'batiment', label: 'Bâtiment' },
        { key: 'capacite', label: 'Capacité' },
        { key: 'equipements', label: 'Équipements', render: (items: string[]) => items.join(', ') },
        { key: 'disponible', label: 'Disponibilité', render: (available: boolean) => available ? 'Disponible' : 'Indisponible' },
      ]} data={rooms} />
    </div>
  );
};

export const TeachersAndJuriesPage: React.FC = () => (
  <GroupedAdminPage tabs={[
    { id: 'teachers', label: 'Enseignants', content: <TeachersView /> },
    { id: 'juries', label: 'Jurys affectés', content: <JuriesView /> },
  ]} />
);

export const DefensesAndRoomsPage: React.FC = () => (
  <GroupedAdminPage tabs={[
    { id: 'defenses', label: 'Soutenances', content: <DefensesView /> },
    { id: 'rooms', label: 'Salles', content: <RoomsView /> },
  ]} />
);
