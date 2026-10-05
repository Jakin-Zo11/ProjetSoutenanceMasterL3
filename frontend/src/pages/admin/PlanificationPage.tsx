import React, { useMemo, useState } from 'react';
import { DataTable } from '../../components/admin';
import { useAdminData } from '../../context/AdminDataContext';
import type { JuryRole } from '../../types/defense';

interface PlanificationPageProps {
  initialTab?: 'assignment' | 'calendar' | 'teachers';
}

const JURY_ROLES: { role: JuryRole; label: string }[] = [
  { role: 'PRESIDENT', label: 'Président' },
  { role: 'RAPPORTEUR', label: 'Rapporteur' },
  { role: 'EXAMINER', label: 'Examinateur' },
];

const PlanificationPage: React.FC<PlanificationPageProps> = ({ initialTab = 'assignment' }) => {
  const { defenseSlots, teachers, assignJuryBatch, replaceJuryMember } = useAdminData();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedJury, setSelectedJury] = useState<Record<JuryRole, string>>({
    PRESIDENT: '',
    RAPPORTEUR: '',
    EXAMINER: '',
  });
  const [replacementTarget, setReplacementTarget] = useState('');
  const [replacementTeacherId, setReplacementTeacherId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const eligibleSlots = defenseSlots.filter((slot) => slot.pdfUrl && slot.status !== 'COMPLETED');
  const selectedSlot = defenseSlots.find((slot) => slot.id === Number(selectedSlotId));
  const replacementOptions = useMemo(() => {
    const [slotId, teacherId] = replacementTarget.split(':').map(Number);
    const slot = defenseSlots.find((entry) => entry.id === slotId);
    if (!slot || !teacherId) return [];
    return teachers.filter((teacher) =>
      teacher.status === 'Actif'
      && teacher.isAvailable
      && !slot.jury.some((member) => member.id === teacher.id),
    );
  }, [defenseSlots, replacementTarget, teachers]);

  const handleAssign = async () => {
    if (!selectedSlot) {
      setFeedback('Sélectionnez un créneau avec PDF déposé.');
      return;
    }
    const jury = JURY_ROLES.map(({ role }) => {
      const teacher = teachers.find((entry) => entry.id === Number(selectedJury[role]));
      return teacher ? {
        id: teacher.id,
        teacherName: `${teacher.prenom} ${teacher.nom}`,
        role,
        isAvailable: teacher.isAvailable,
      } : null;
    });
    if (jury.some((member) => member === null)) {
      setFeedback('Sélectionnez un enseignant pour chacun des trois rôles.');
      return;
    }
    setIsSaving(true);
    try {
      await assignJuryBatch([selectedSlot.id], jury.filter((member) => member !== null));
      setFeedback(`Jury affecté au créneau de ${selectedSlot.studentName}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'L’affectation locale a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplace = async () => {
    const [slotId, oldTeacherId] = replacementTarget.split(':').map(Number);
    if (!slotId || !oldTeacherId || !replacementTeacherId) {
      setFeedback('Sélectionnez le créneau, le juré absent et son remplaçant.');
      return;
    }
    setIsSaving(true);
    try {
      await replaceJuryMember(slotId, oldTeacherId, Number(replacementTeacherId));
      setFeedback('Le remplacement a été enregistré localement, sans modifier le créneau.');
      setReplacementTarget('');
      setReplacementTeacherId('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Le remplacement local a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'assignment' as const, label: 'Affectation & remplacement' },
    { id: 'calendar' as const, label: 'Calendrier & salles' },
    { id: 'teachers' as const, label: 'Enseignants' },
  ];

  const calendarRows = defenseSlots.map((slot) => ({
    id: slot.id,
    student: slot.studentName,
    date: slot.date,
    time: `${slot.timeStart}–${slot.timeEnd}`,
    room: slot.room,
    status: slot.status,
    jury: slot.jury.map((member) => `${member.teacherName} (${member.role})`).join(', ') || 'Non affecté',
  }));

  const teacherRows = teachers.map((teacher) => ({
    ...teacher,
    fullName: `${teacher.prenom} ${teacher.nom}`,
    availability: teacher.isAvailable ? 'Disponible' : 'Indisponible',
  }));

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              activeTab === tab.id ? 'bg-[#0A192F] text-white' : 'bg-white text-[#637799] hover:bg-[#EAF4FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && <p role="status" className="rounded-lg bg-[#EFF6FF] p-3 text-sm text-[#1E3A8A]">{feedback}</p>}

      {activeTab === 'assignment' && (
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-[#DDEAF7] bg-white p-5">
            <h2 className="font-bold text-[#0A192F]">Affecter un jury à un créneau</h2>
            <label className="block text-sm font-medium text-[#334155]">
              Créneau étudiant
              <select value={selectedSlotId} onChange={(event) => setSelectedSlotId(event.target.value)} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3">
                <option value="">Sélectionner un étudiant</option>
                {eligibleSlots.map((slot) => <option key={slot.id} value={slot.id}>{slot.studentName} · {slot.date} · {slot.timeStart}</option>)}
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              {JURY_ROLES.map(({ role, label }) => (
                <label key={role} className="text-sm font-medium text-[#334155]">
                  {label}
                  <select value={selectedJury[role]} onChange={(event) => setSelectedJury((current) => ({ ...current, [role]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3">
                    <option value="">Choisir un enseignant</option>
                    {teachers.filter((teacher) => teacher.status === 'Actif').map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.prenom} {teacher.nom}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button type="button" disabled={isSaving} onClick={handleAssign} className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-60">
              {isSaving ? 'Enregistrement...' : 'Affecter le jury'}
            </button>
          </section>

          <section className="space-y-4 rounded-xl border border-[#DDEAF7] bg-white p-5">
            <h2 className="font-bold text-[#0A192F]">Remplacement d’un membre</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-medium text-[#334155]">
                Créneau et juré
                <select value={replacementTarget} onChange={(event) => { setReplacementTarget(event.target.value); setReplacementTeacherId(''); }} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3">
                  <option value="">Choisir un juré à remplacer</option>
                  {defenseSlots.filter((slot) => slot.status !== 'COMPLETED').flatMap((slot) => slot.jury.map((member) => (
                    <option key={`${slot.id}:${member.id}`} value={`${slot.id}:${member.id}`}>{slot.studentName} · {member.teacherName} ({member.role})</option>
                  )))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Remplaçant disponible
                <select value={replacementTeacherId} onChange={(event) => setReplacementTeacherId(event.target.value)} className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3">
                  <option value="">Choisir un enseignant</option>
                  {replacementOptions.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.prenom} {teacher.nom}</option>)}
                </select>
              </label>
              <button type="button" disabled={isSaving} onClick={handleReplace} className="self-end rounded-lg bg-[#1E3A8A] px-4 py-3 font-semibold text-white disabled:opacity-60">
                Remplacer le membre
              </button>
            </div>
            <p className="text-sm text-[#64748B]">La date, l’heure et la salle du créneau restent inchangées.</p>
          </section>

          <DataTable
            columns={[
              { key: 'studentName', label: 'Étudiant' },
              { key: 'date', label: 'Date' },
              { key: 'timeStart', label: 'Heure' },
              { key: 'room', label: 'Salle' },
              { key: 'status', label: 'Statut' },
            ]}
            data={defenseSlots}
          />
        </div>
      )}

      {activeTab === 'calendar' && (
        <DataTable columns={[
          { key: 'student', label: 'Étudiant' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Horaire' },
          { key: 'room', label: 'Salle' },
          { key: 'jury', label: 'Jury' },
          { key: 'status', label: 'Statut' },
        ]} data={calendarRows} />
      )}

      {activeTab === 'teachers' && (
        <DataTable columns={[
          { key: 'fullName', label: 'Enseignant' },
          { key: 'grade', label: 'Grade' },
          { key: 'specialite', label: 'Spécialité' },
          { key: 'availability', label: 'Disponibilité' },
          { key: 'status', label: 'Statut' },
        ]} data={teacherRows} />
      )}
    </div>
  );
};

export default PlanificationPage;
