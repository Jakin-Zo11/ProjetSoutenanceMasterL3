import React, { useState } from 'react';
import { Pencil, Smartphone, Trash2, UserPlus } from 'lucide-react';
import { DataTable } from '../../components/admin';
import GroupedAdminPage from '../../components/admin/GroupedAdminPage';
import { useAdminData, type EvaluatorRole, type Teacher } from '../../context/AdminDataContext';

const EVALUATOR_ROLES: { role: EvaluatorRole; label: string }[] = [
  { role: 'PRESIDENT', label: 'Président' },
  { role: 'RAPPORTEUR', label: 'Rapporteur' },
  { role: 'EXAMINER', label: 'Examinateur' },
  { role: 'ENCADREUR', label: 'Encadreur' },
];

const roleLabel = (role?: EvaluatorRole) =>
  EVALUATOR_ROLES.find((entry) => entry.role === role)?.label ?? 'Non attribué';

const emptyEvaluatorForm = {
  prenom: '',
  nom: '',
  specialite: '',
  grade: '',
  email: '',
  telephone: '',
  role: 'EXAMINER' as EvaluatorRole,
};

const EvaluatorsView: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useAdminData();
  const [form, setForm] = useState(emptyEvaluatorForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const submitEvaluator = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      if (editingId !== null) {
        await updateTeacher(editingId, form);
        setFeedback(`Évaluateur ${form.prenom} ${form.nom} mis à jour.`);
      } else {
        await addTeacher({ ...form, status: 'Actif', isAvailable: true });
        setFeedback(`Évaluateur ${form.prenom} ${form.nom} ajouté aux données locales.`);
      }
      setForm(emptyEvaluatorForm);
      setEditingId(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’enregistrer cet évaluateur.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFeedback('');
    setForm({
      prenom: teacher.prenom,
      nom: teacher.nom,
      specialite: teacher.specialite,
      grade: teacher.grade,
      email: teacher.email,
      telephone: teacher.telephone,
      role: teacher.role ?? 'EXAMINER',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyEvaluatorForm);
  };

  const removeEvaluator = async (teacher: Teacher) => {
    await deleteTeacher(teacher.id);
    setFeedback(`Évaluateur ${teacher.prenom} ${teacher.nom} supprimé.`);
    if (editingId === teacher.id) cancelEdit();
  };

  const changeRole = (teacher: Teacher, role: EvaluatorRole) => {
    void updateTeacher(teacher.id, { role });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-[#BAE6FD] bg-[#EAF4FF] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
          <Smartphone size={18} aria-hidden="true" />
        </span>
        <p className="text-sm text-[#1E3A8A]">
          Les comptes évaluateurs disposent également d’un accès à l’application mobile EMIT
          (planning des soutenances, saisie des notes et gestion des remplacements).
        </p>
      </div>

      <form onSubmit={submitEvaluator} className="grid gap-3 rounded-xl border border-[#DDEAF7] bg-white p-5 md:grid-cols-2">
        <h2 className="flex items-center gap-2 font-bold text-[#0A192F] md:col-span-2">
          <UserPlus size={18} aria-hidden="true" />
          {editingId !== null ? 'Modifier un évaluateur' : 'Ajouter un évaluateur'}
        </h2>
        {([
          ['prenom', 'Prénom'],
          ['nom', 'Nom'],
          ['specialite', 'Spécialité'],
          ['grade', 'Grade'],
          ['email', 'E-mail'],
          ['telephone', 'Téléphone'],
        ] as const).map(([key, label]) => (
          <label key={key} className="text-sm font-medium text-[#334155]">
            {label}
            <input
              required={key === 'prenom' || key === 'nom'}
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
            />
          </label>
        ))}
        <label className="text-sm font-medium text-[#334155]">
          Rôle de soutenance
          <select
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as EvaluatorRole }))}
            className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
          >
            {EVALUATOR_ROLES.map(({ role, label }) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button disabled={saving} className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-60">
            {saving ? 'Enregistrement...' : editingId !== null ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit} className="rounded-lg border border-[#DDEAF7] px-4 py-2 font-semibold text-[#334155]">
              Annuler
            </button>
          )}
        </div>
        {feedback && <p role="status" className="text-sm text-[#1E3A8A] md:col-span-2">{feedback}</p>}
      </form>

      <DataTable columns={[
        { key: 'prenom', label: 'Prénom' },
        { key: 'nom', label: 'Nom' },
        { key: 'specialite', label: 'Spécialité' },
        { key: 'grade', label: 'Grade' },
        { key: 'status', label: 'Statut' },
        { key: 'isAvailable', label: 'Disponibilité', render: (available: boolean) => available ? 'Disponible' : 'Indisponible' },
        {
          key: 'role',
          label: 'Rôle de soutenance',
          render: (_value: EvaluatorRole | undefined, row: Teacher) => (
            <select
              value={row.role ?? 'EXAMINER'}
              onChange={(event) => changeRole(row, event.target.value as EvaluatorRole)}
              className="rounded-lg border border-[#DDEAF7] px-2 py-1.5 text-sm"
            >
              {EVALUATOR_ROLES.map(({ role, label }) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          ),
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (_value: unknown, row: Teacher) => (
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
                onClick={() => void removeEvaluator(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E11D48] px-2.5 py-1.5 text-xs font-semibold text-[#E11D48] hover:bg-[#FFF1F2]"
              >
                <Trash2 size={14} aria-hidden="true" /> Supprimer
              </button>
            </div>
          ),
        },
      ]} data={teachers} />

      <RolesView />
    </div>
  );
};

const RolesView: React.FC = () => {
  const { defenseSlots } = useAdminData();
  const evaluatorRows = defenseSlots.flatMap((slot) => slot.jury.map((member) => ({
    id: `${slot.id}-${member.id}`,
    student: slot.studentName,
    evaluator: member.teacherName,
    role: roleLabel(member.role as EvaluatorRole),
    date: slot.date,
    time: slot.timeStart,
  })));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-bold text-[#0A192F]">Rôles attribués aux soutenances</h2>
        <p className="mt-1 text-sm text-[#637799]">Répartition des évaluateurs par rôle sur les créneaux planifiés.</p>
      </div>
      <DataTable columns={[
        { key: 'student', label: 'Étudiant' },
        { key: 'evaluator', label: 'Évaluateur' },
        { key: 'role', label: 'Rôle' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Heure' },
      ]} data={evaluatorRows} />
    </div>
  );
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

export const EvaluatorsPage: React.FC = () => <EvaluatorsView />;

export const DefensesAndRoomsPage: React.FC = () => (
  <GroupedAdminPage tabs={[
    { id: 'defenses', label: 'Soutenances', content: <DefensesView /> },
    { id: 'rooms', label: 'Salles', content: <RoomsView /> },
  ]} />
);
