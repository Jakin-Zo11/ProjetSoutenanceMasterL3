import React, { useMemo, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Send, X } from 'lucide-react';
import { DataTable } from '../../components/admin';
import { useAdminData, type DefenseSlot, type EvaluatorRole, type JuryMember } from '../../context/AdminDataContext';

const EVALUATOR_ROLES: { role: EvaluatorRole; label: string }[] = [
  { role: 'PRESIDENT', label: 'Président' },
  { role: 'RAPPORTEUR', label: 'Rapporteur' },
  { role: 'EXAMINER', label: 'Examinateur' },
  { role: 'ENCADREUR', label: 'Encadreur' },
];

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiée',
  COMPLETED: 'Terminée',
  PENDING_SUBMISSION: 'En attente de dépôt',
  SUBMITTED: 'Déposée',
};

const roleLabel = (role: EvaluatorRole) => EVALUATOR_ROLES.find((entry) => entry.role === role)?.label ?? role;

const formatTime = (value: string) => value.replace(':', 'h');

const formatEvaluators = (evaluators: JuryMember[]) =>
  evaluators.length
    ? evaluators.map((member) => `${member.teacherName} (${roleLabel(member.role)})`).join(', ')
    : 'Non affectés';

const emptyForm = {
  studentId: '',
  date: '',
  timeSlotId: '',
  room: '',
  PRESIDENT: '',
  RAPPORTEUR: '',
  EXAMINER: '',
  ENCADREUR: '',
};

const PlanificationPage: React.FC = () => {
  const {
    students,
    teachers,
    defenseSlots,
    timeSlots,
    rooms,
    addDefenseSlot,
    updateDefenseSlot,
    sendConvocations,
  } = useAdminData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const activeTeachers = teachers.filter((teacher) => teacher.status === 'Actif');
  const availableRooms = rooms.filter((room) => room.disponible || room.nom === form.room);

  const plannedDefenses = useMemo(
    () => [...defenseSlots].sort((first, second) =>
      `${first.date}T${first.timeStart}`.localeCompare(`${second.date}T${second.timeStart}`),
    ),
    [defenseSlots],
  );

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEdit = (slot: DefenseSlot) => {
    const matchedTimeSlot = timeSlots.find((entry) => entry.startTime === slot.timeStart && entry.endTime === slot.timeEnd);
    const evaluatorId = (role: EvaluatorRole) => String(slot.jury.find((member) => member.role === role)?.id ?? '');
    setForm({
      studentId: String(slot.studentId),
      date: slot.date,
      timeSlotId: matchedTimeSlot ? String(matchedTimeSlot.id) : '',
      room: slot.room,
      PRESIDENT: evaluatorId('PRESIDENT'),
      RAPPORTEUR: evaluatorId('RAPPORTEUR'),
      EXAMINER: evaluatorId('EXAMINER'),
      ENCADREUR: evaluatorId('ENCADREUR'),
    });
    setEditingId(slot.id);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setModalError('');
  };

  const buildEvaluators = (): JuryMember[] => EVALUATOR_ROLES.map(({ role }) => {
    const teacher = teachers.find((entry) => entry.id === Number(form[role]));
    return {
      id: teacher?.id ?? 0,
      teacherName: teacher ? `${teacher.prenom} ${teacher.nom}` : '',
      role,
      isAvailable: teacher?.isAvailable ?? false,
    };
  });

  const handleSubmit = async (send: boolean) => {
    setModalError('');
    if (!form.studentId || !form.date || !form.timeSlotId || !form.room) {
      setModalError('Renseignez l’étudiant, la date, le créneau horaire et la salle.');
      return;
    }
    const selectedIds = EVALUATOR_ROLES.map(({ role }) => form[role]);
    if (selectedIds.some((id) => !id)) {
      setModalError('Sélectionnez un évaluateur pour chacun des quatre rôles.');
      return;
    }
    if (new Set(selectedIds).size !== EVALUATOR_ROLES.length) {
      setModalError('Chaque rôle doit être attribué à un évaluateur différent.');
      return;
    }
    const timeSlot = timeSlots.find((entry) => String(entry.id) === form.timeSlotId);
    const student = students.find((entry) => entry.id === Number(form.studentId));
    if (!timeSlot || !student) {
      setModalError('Créneau horaire ou étudiant introuvable.');
      return;
    }

    const payload: Omit<DefenseSlot, 'id'> = {
      studentId: student.id,
      studentName: student.fullName,
      date: form.date,
      timeStart: timeSlot.startTime,
      timeEnd: timeSlot.endTime,
      room: form.room,
      status: 'SCHEDULED',
      jury: buildEvaluators(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateDefenseSlot(editingId, payload);
      } else {
        await addDefenseSlot(payload);
      }
      if (send) {
        await sendConvocations(editingId ?? Date.now());
        setFeedback(`Soutenance de ${student.fullName} validée. Les convocations ont été envoyées à l’étudiant et aux évaluateurs via l’application mobile.`);
      } else {
        setFeedback(`Soutenance de ${student.fullName} enregistrée.`);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'L’enregistrement de la soutenance a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0A192F]">Planification des soutenances</h1>
          <p className="mt-1 text-sm text-[#637799]">
            Liez un étudiant, une date, un créneau horaire, une salle et les quatre évaluateurs de la soutenance.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 font-semibold text-white transition hover:bg-[#0A192F]"
        >
          <Plus size={18} aria-hidden="true" /> Nouvelle soutenance
        </button>
      </div>

      {feedback && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-[#3B82F6] bg-[#EAF4FF] p-3 text-sm text-[#1E3A8A]">
          <CheckCircle2 size={16} aria-hidden="true" /> {feedback}
        </p>
      )}

      <DataTable
        columns={[
          { key: 'studentName', label: 'Étudiant' },
          {
            key: 'rédaction',
            label: 'Rédaction PDF',
            render: (_value: unknown, row: DefenseSlot) => {
              const student = students.find((entry) => entry.id === row.studentId);
              const deposited = Boolean(student?.pdfUrl) && student?.submissionStatus === 'PDF_SUBMITTED';
              return (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${deposited ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FFF7ED] text-[#9A3412]'}`}>
                  {deposited ? 'Déposée' : 'Non déposée'}
                </span>
              );
            },
          },
          { key: 'date', label: 'Date' },
          {
            key: 'créneau',
            label: 'Créneau',
            render: (_value: unknown, row: DefenseSlot) => `${formatTime(row.timeStart)} - ${formatTime(row.timeEnd)}`,
          },
          { key: 'room', label: 'Salle' },
          {
            key: 'evaluators',
            label: 'Évaluateurs',
            render: (_value: unknown, row: DefenseSlot) => <span className="text-sm text-[#475569]">{formatEvaluators(row.jury)}</span>,
          },
          {
            key: 'status',
            label: 'Statut',
            render: (_value: unknown, row: DefenseSlot) => STATUS_LABELS[row.status] ?? row.status,
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (_value: unknown, row: DefenseSlot) => (
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#3B82F6] px-2.5 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#EAF4FF]"
              >
                <Pencil size={14} aria-hidden="true" /> Modifier
              </button>
            ),
          },
        ]}
        data={plannedDefenses}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/45 p-4" role="presentation" onClick={closeModal}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="planning-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#DDEAF7] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="planning-title" className="text-lg font-bold text-[#0A192F]">
                  {editingId !== null ? 'Modifier la soutenance' : 'Planifier une soutenance'}
                </h2>
                <p className="mt-1 text-sm text-[#637799]">Associez les informations du créneau et les évaluateurs.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Fermer" className="rounded-lg p-2 text-[#637799] hover:bg-[#F0F5FB]">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#334155]">
                Étudiant
                <select
                  value={form.studentId}
                  onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.fullName} · {student.matricule}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
                />
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Créneau horaire
                <select
                  value={form.timeSlotId}
                  onChange={(event) => setForm((current) => ({ ...current, timeSlotId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
                >
                  <option value="">Sélectionner un créneau</option>
                  {timeSlots.map((timeSlot) => (
                    <option key={timeSlot.id} value={timeSlot.id}>
                      {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Salle disponible
                <select
                  value={form.room}
                  onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
                >
                  <option value="">Sélectionner une salle</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.nom}>{room.nom} · {room.batiment} ({room.capacite} places)</option>
                  ))}
                </select>
              </label>
            </div>

            <h3 className="mt-5 font-semibold text-[#0A192F]">Évaluateurs de la soutenance</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {EVALUATOR_ROLES.map(({ role, label }) => (
                <label key={role} className="text-sm font-medium text-[#334155]">
                  {label}
                  <select
                    value={form[role]}
                    onChange={(event) => setForm((current) => ({ ...current, [role]: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3"
                  >
                    <option value="">Sélectionner un évaluateur</option>
                    {activeTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.prenom} {teacher.nom}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {modalError && <p role="alert" className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FFF1F2] p-3 text-sm text-[#9F1239]">{modalError}</p>}

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-lg border border-[#DDEAF7] px-4 py-2 font-semibold text-[#334155]">
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSubmit(false)}
                className="rounded-lg border border-[#1E3A8A] px-4 py-2 font-semibold text-[#1E3A8A] disabled:opacity-60"
              >
                Enregistrer
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSubmit(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white transition hover:bg-[#0A192F] disabled:opacity-60"
              >
                <Send size={16} aria-hidden="true" />
                {saving ? 'Traitement...' : 'Valider et envoyer les convocations'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PlanificationPage;
