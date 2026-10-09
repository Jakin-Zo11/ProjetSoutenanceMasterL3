import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, FileCheck2, GraduationCap, Plus, Users, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import type { Teacher } from '../../types';
import type { DefenseSlot, JuryMember, JuryRole } from '../../types/defense';

const JURY_ROLES: { role: JuryRole; label: string }[] = [
  { role: 'PRESIDENT', label: 'Président' },
  { role: 'RAPPORTEUR', label: 'Rapporteur' },
  { role: 'EXAMINER', label: 'Examinateur' },
];

const formatDate = (date: string, weekday: 'short' | 'long' = 'long') => new Intl.DateTimeFormat('fr-FR', {
  weekday,
  day: 'numeric',
  month: 'short',
  year: weekday === 'long' ? undefined : undefined,
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

const Dashboard: React.FC = () => {
  const {
    session,
    students,
    teachers,
    defenseSlots,
    addTeacher,
    assignJuryBatch,
  } = useAdminData();

  const [selectedSlot, setSelectedSlot] = useState<DefenseSlot | null>(null);
  const [isEditingJury, setIsEditingJury] = useState(false);
  const [isSavingJury, setIsSavingJury] = useState(false);
  const [juryFeedback, setJuryFeedback] = useState('');
  const [juryForm, setJuryForm] = useState<Record<JuryRole, string>>({
    PRESIDENT: '',
    RAPPORTEUR: '',
    EXAMINER: '',
  });
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [teacherForm, setTeacherForm] = useState({
    prenom: '',
    nom: '',
    specialite: '',
    grade: '',
    email: '',
    telephone: '',
  });

  const submittedCount = students.filter((student) => Boolean(student.pdfUrl)).length;
  const assignedTeacherIds = new Set(defenseSlots
    .filter((slot) => slot.status !== 'COMPLETED')
    .flatMap((slot) => slot.jury.map((member) => member.id)));
  const unassignedTeachers = teachers.filter((teacher) =>
    teacher.status === 'Actif' && teacher.isAvailable && !assignedTeacherIds.has(teacher.id),
  );
  const scheduledSlots = defenseSlots.filter((slot) =>
    Boolean(slot.date && slot.timeStart && slot.timeEnd && slot.room && slot.room !== 'Salle à attribuer'),
  );
  const completedSlots = defenseSlots.filter((slot) => slot.status === 'COMPLETED');
  const activeAvailableTeachers = teachers.filter((teacher) => teacher.status === 'Actif' && teacher.isAvailable);
  const selectedTeacherIds = Object.values(juryForm).filter(Boolean);
  const submissionRate = students.length ? Math.round((submittedCount / students.length) * 100) : 0;
  const recentDefenses = [...scheduledSlots]
    .sort((first, second) => `${first.date}T${first.timeStart}`.localeCompare(`${second.date}T${second.timeStart}`))
    .slice(0, 5);

  const metrics = [
    { label: 'Étudiants inscrits', value: students.length, detail: 'Total des étudiants', icon: GraduationCap },
    { label: 'Rédactions déposées', value: `${submittedCount} / ${students.length}`, detail: `${submissionRate}% du total`, icon: FileCheck2 },
    { label: 'Soutenances planifiées', value: scheduledSlots.length, detail: 'Salle et créneau attribués', icon: CalendarDays },
    { label: 'Soutenances terminées', value: completedSlots.length, detail: 'Évaluations complétées', icon: CheckCircle2 },
    { label: 'Évaluateurs', value: teachers.length, detail: `${activeAvailableTeachers.length} disponibles`, icon: Users },
  ];

  const openSlotDetails = (slot: DefenseSlot) => {
    setSelectedSlot(slot);
    setJuryFeedback('');
    setIsEditingJury(false);
    setJuryForm({
      PRESIDENT: String(slot.jury.find((member) => member.role === 'PRESIDENT')?.id ?? ''),
      RAPPORTEUR: String(slot.jury.find((member) => member.role === 'RAPPORTEUR')?.id ?? ''),
      EXAMINER: String(slot.jury.find((member) => member.role === 'EXAMINER')?.id ?? ''),
    });
  };

  const beginJuryEdit = () => {
    if (!selectedSlot) return;
    setJuryFeedback('');
    setJuryForm({
      PRESIDENT: String(selectedSlot.jury.find((member) => member.role === 'PRESIDENT')?.id ?? ''),
      RAPPORTEUR: String(selectedSlot.jury.find((member) => member.role === 'RAPPORTEUR')?.id ?? ''),
      EXAMINER: String(selectedSlot.jury.find((member) => member.role === 'EXAMINER')?.id ?? ''),
    });
    setIsEditingJury(true);
  };

  const saveJuryAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) return;
    const members: JuryMember[] = JURY_ROLES.map(({ role }) => {
      const teacher = teachers.find((entry) => entry.id === Number(juryForm[role]));
      return {
        id: teacher?.id ?? 0,
        teacherName: teacher ? `${teacher.prenom} ${teacher.nom}` : '',
        role,
        isAvailable: teacher?.isAvailable ?? false,
      };
    });
    setJuryFeedback('');
    setIsSavingJury(true);
    try {
      await assignJuryBatch([selectedSlot.id], members);
      setSelectedSlot({ ...selectedSlot, jury: members, status: 'SCHEDULED' });
      setJuryFeedback(`Affectation de l'évaluateur enregistrée localement.`);
      setIsEditingJury(false);
    } catch (error) {
      setJuryFeedback(error instanceof Error ? error.message : 'Impossible d’enregistrer cette affectation.');
    } finally {
      setIsSavingJury(false);
    }
  };

  const closeSlotDetails = () => {
    if (isSavingJury) return;
    setSelectedSlot(null);
    setIsEditingJury(false);
    setJuryFeedback('');
  };

  const handleAddTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    setIsSavingTeacher(true);
    const newTeacher: Omit<Teacher, 'id'> = {
      ...teacherForm,
      status: 'Actif',
      isAvailable: true,
    };
    try {
      await addTeacher(newTeacher);
      setTeacherForm({ prenom: '', nom: '', specialite: '', grade: '', email: '', telephone: '' });
      setFeedback('Enseignant ajouté aux données locales.');
      setIsAddTeacherOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’ajouter cet enseignant.');
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const modalPanel = 'w-full rounded-2xl border border-[#E2E8F0] bg-white p-5 text-[#0A192F] shadow-2xl sm:p-6';
  const inputClass = 'mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0A192F] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden bg-[#F5F8FF] p-3 text-[#0B1F4B] sm:gap-4 sm:p-4 lg:p-6">
      <section className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">Vue d’ensemble</p>
          <h1 className="truncate text-xl font-bold leading-tight text-[#0B1F4B] sm:text-2xl">Suivi des soutenances</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#52627D] sm:text-sm">
            <CalendarDays size={15} className="text-[#2563EB]" aria-hidden="true" />
            Session immuable : {session.startDate} – {session.endDate}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setFeedback(''); setIsAddTeacherOpen(true); }}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#1E3A8A] hover:shadow-md sm:px-4 sm:text-sm"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter un enseignant</span>
          <span className="sm:hidden">Enseignant</span>
        </button>
      </section>

      {feedback && (
        <div role="status" className="fixed bottom-4 right-4 z-40 max-w-sm rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#1E3A8A] shadow-lg">
          {feedback}
        </div>
      )}

      <section className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5" aria-label="Indicateurs de session">
        {metrics.map(({ label, value, detail, icon: Icon }, index) => (
          <article key={label} className="group min-w-0 rounded-2xl border border-[#E5EAF5] bg-white p-3 shadow-[0_4px_20px_rgba(11,31,75,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#BAE6FD] hover:shadow-[0_12px_28px_rgba(37,99,235,0.09)] sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                index === 1 ? 'bg-[#DCFCE7] text-[#15803D]'
                  : index === 2 ? 'bg-[#E0F2FE] text-[#2563EB]'
                  : index === 3 ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#E0F2FE] text-[#2563EB]'
              }`}>
                <Icon size={21} aria-hidden="true" />
              </div>
              {index === 1 && <span className="rounded-full bg-[#FFF1F2] px-2 py-1 text-[10px] font-semibold text-[#BE123C] sm:text-xs">{submissionRate}%</span>}
              {index === 4 && <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">{activeAvailableTeachers.length} dispo</span>}
            </div>
            <p className="mt-2 text-xs font-medium text-[#52627D] sm:mt-3 sm:text-sm">{label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-[#E11D48] sm:text-2xl">{value}</span>
            </div>
            <p className="mt-1 text-xs text-[#52627D]">{detail}</p>
            {index === 1 && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E0F2FE]" aria-label={`Progression des dépôts : ${submissionRate}%`}>
                <div className="h-full rounded-full bg-[#2563EB] transition-[width] duration-300" style={{ width: `${submissionRate}%` }} />
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E5EAF5] bg-white shadow-[0_4px_20px_rgba(11,31,75,0.04)]" aria-label="Résumé et prochaines soutenances">
          <div className="flex items-center justify-between border-b border-[#E5EAF5] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-bold text-[#0B1F4B]">Résumé de la session</h2>
              <p className="mt-1 text-xs text-[#52627D]">Aperçu des dossiers planifiés et de leur affectation</p>
            </div>
            <Link
              to="/admin/calendrier"
              className="rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1E3A8A] sm:text-sm"
            >
              Gérer le calendrier
            </Link>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-[#E5EAF5] bg-[#F5F8FF] p-4 sm:grid-cols-4 sm:px-5">
            <div>
              <p className="text-xs text-[#52627D]">Dossiers déposés</p>
              <p className="mt-1 text-lg font-bold text-[#15803D]">{submittedCount}<span className="ml-1 text-xs font-medium text-[#52627D]">/ {students.length}</span></p>
            </div>
            <div>
              <p className="text-xs text-[#52627D]">Dossiers en attente</p>
              <p className="mt-1 text-lg font-bold text-[#C2410C]">{students.length - submittedCount}</p>
            </div>
            <div>
              <p className="text-xs text-[#52627D]">Enseignants disponibles</p>
              <p className="mt-1 text-lg font-bold text-[#2563EB]">{unassignedTeachers.length}</p>
            </div>
            <div>
              <p className="text-xs text-[#52627D]">Évaluateurs à compléter</p>
              <p className="mt-1 text-lg font-bold text-[#BE123C]">{scheduledSlots.filter((slot) => !slot.jury.length).length}</p>
            </div>
          </div>
          {recentDefenses.length ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#E0F2FE] text-[10px] uppercase tracking-wide text-[#0B1F4B]">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Étudiant</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Date / heure</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Salle / Évaluateur</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Dossier</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDefenses.map((slot, index) => (
                    <tr key={slot.id} className={`border-t border-[#E5EAF5] transition-colors hover:bg-[#E0F2FE]/50 ${index % 2 === 1 ? 'bg-[#F5F8FF]/60' : 'bg-white'}`}>
                      <td className="max-w-40 px-4 py-3">
                        <button type="button" onClick={() => openSlotDetails(slot)} className="truncate text-left font-semibold text-[#2563EB] hover:underline">
                          {slot.studentName}
                        </button>
                        <p className="mt-0.5 truncate text-[10px] text-[#52627D]">{slot.studentMatricule}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#52627D]">
                        <p className="font-medium capitalize text-[#0B1F4B]">{formatDate(slot.date)}</p>
                        <p className="mt-0.5">{slot.timeStart}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-[#0B1F4B]">{slot.room}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${slot.jury.length ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FFF7ED] text-[#9A3412]'}`}>
                          {slot.jury.length ? 'Évaluateur affecté' : 'À affecter'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${slot.pdfUrl ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FFF7ED] text-[#9A3412]'}`}>
                          {slot.pdfUrl ? 'PDF déposé' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <CheckCircle2 size={28} className="text-[#7DD3FC]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#0B1F4B]">Aucune soutenance planifiée</p>
              <p className="mt-1 text-xs text-[#52627D]">Les prochaines soutenances apparaîtront ici après leur planification.</p>
            </div>
          )}
      </section>

      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/45 p-4" role="presentation" onClick={() => setIsAddTeacherOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="add-teacher-title" className={`${modalPanel} max-w-xl`} onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="add-teacher-title" className="text-xl font-bold">Ajouter un enseignant</h2>
                <p className="mt-1 text-sm text-slate-500">Enregistrement local avec délai simulé de 200 ms.</p>
              </div>
              <button type="button" onClick={() => setIsAddTeacherOpen(false)} aria-label="Fermer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTeacher} className="grid gap-3 sm:grid-cols-2">
              {([
                ['prenom', 'Prénom'],
                ['nom', 'Nom'],
                ['specialite', 'Spécialité'],
                ['grade', 'Grade'],
                ['email', 'E-mail'],
                ['telephone', 'Téléphone'],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    required={key === 'prenom' || key === 'nom'}
                    type={key === 'email' ? 'email' : 'text'}
                    value={teacherForm[key]}
                    onChange={(event) => setTeacherForm((current) => ({ ...current, [key]: event.target.value }))}
                    className={inputClass}
                  />
                </label>
              ))}
              <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={() => setIsAddTeacherOpen(false)} className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={isSavingTeacher} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60">
                  {isSavingTeacher ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/45 p-4" role="presentation" onClick={closeSlotDetails}>
          <section role="dialog" aria-modal="true" aria-labelledby="slot-details-title" className={`${modalPanel} max-h-[90vh] max-w-2xl overflow-y-auto`} onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2563EB]">Détails du créneau</p>
                <h2 id="slot-details-title" className="mt-1 text-xl font-bold">{selectedSlot.studentName}</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedSlot.studentMatricule}</p>
              </div>
              <button type="button" onClick={closeSlotDetails} aria-label="Fermer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
              <Info label="Thème de rédaction" value={selectedSlot.themeTitle} />
              <Info label="Date & horaire" value={`${formatDate(selectedSlot.date)} · ${selectedSlot.timeStart} – ${selectedSlot.timeEnd}`} />
              <Info label="Salle" value={selectedSlot.room} />
              <Info label="Rédaction PDF" value={selectedSlot.pdfUrl ? 'Déposée' : 'En attente de dépôt'} />
            </div>
            {!isEditingJury ? (
              <div className="mt-4">
                <h3 className="font-semibold">Composition de l'évaluateur</h3>
                <div className="mt-2 space-y-2">
                  {JURY_ROLES.map(({ role, label }) => (
                    <div key={role} className="flex justify-between gap-3 rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-right font-medium">{selectedSlot.jury.find((member) => member.role === role)?.teacherName ?? 'En attente d’affectation'}</span>
                    </div>
                  ))}
                </div>
                {juryFeedback && <p role="status" className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-[#1E3A8A]">{juryFeedback}</p>}
                {selectedSlot.status === 'COMPLETED' ? (
                  <p className="mt-4 text-sm text-slate-500">Cette soutenance est clôturée ; son affectation ne peut plus être modifiée.</p>
                ) : selectedSlot.pdfUrl ? (
                  <button type="button" onClick={beginJuryEdit} className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A]">
                    {selectedSlot.jury.length ? "Modifier l’affectation de l'évaluateur" : 'Affecter un évaluateur à ce créneau'}
                  </button>
                ) : (
                  <p className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-slate-600">Déposez d’abord le PDF de l’étudiant. La date, l’heure et la salle restent fixes.</p>
                )}
              </div>
            ) : (
              <form onSubmit={saveJuryAssignment} className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedSlot.jury.length ? "Modifier l'évaluateur" : 'Affecter un évaluateur'}</h3>
                  <p className="mt-1 text-sm text-slate-500">Choisissez trois enseignants actifs et disponibles.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {JURY_ROLES.map(({ role, label }) => (
                    <label key={role} className="text-sm font-medium text-slate-700">
                      {label}
                      <select required value={juryForm[role]} onChange={(event) => setJuryForm((current) => ({ ...current, [role]: event.target.value }))} className={inputClass}>
                        <option value="">Sélectionner</option>
                        {activeAvailableTeachers
                          .filter((teacher) => !selectedTeacherIds.includes(String(teacher.id)) || String(teacher.id) === juryForm[role])
                          .map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.prenom} {teacher.nom}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
                {juryFeedback && <p role="alert" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-[#1E3A8A]">{juryFeedback}</p>}
                <div className="flex justify-end gap-3">
                  <button type="button" disabled={isSavingJury} onClick={() => setIsEditingJury(false)} className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Annuler</button>
                  <button type="submit" disabled={isSavingJury || !selectedSlot.pdfUrl} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60">
                    {isSavingJury ? 'Enregistrement…' : 'Enregistrer l’affectation'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm text-[#0A192F]">{value}</p>
  </div>
);

export default Dashboard;
