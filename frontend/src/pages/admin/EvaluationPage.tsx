import React, { useMemo } from 'react';
import { DataTable } from '../../components/admin';
import { useAdminData } from '../../context/AdminDataContext';

const STATUS_BADGES = {
  completed: { label: 'Soumis', className: 'bg-green-100 text-green-800' },
  pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
  partial: { label: 'Partiel', className: 'bg-blue-100 text-blue-800' },
  notstarted: { label: 'Non commencé', className: 'bg-slate-100 text-slate-800' },
} as const;

const getEvaluationStatus = (submission: { isCompleted: boolean; presentationScore?: number; technicalScore?: number; answersScore?: number }) => {
  if (!submission.isCompleted) {
    if (submission.presentationScore || submission.technicalScore || submission.answersScore) {
      return 'partial';
    }
    return 'notstarted';
  }
  return 'completed';
};

export const EvaluationPage: React.FC = () => {
  const { defenseSlots, evaluations, pvs } = useAdminData();

  const evaluationRows = useMemo(() => {
    return defenseSlots.map((slot) => {
      const evaluation = evaluations.find((ev) => ev.slotId === slot.id);
      const pv = pvs.find((pv) => pv.studentMatricule === slot.studentId.toString());
      const isFinalized = !!pv && pv.score !== undefined;

      return {
        id: slot.id,
        student: slot.studentName,
        matricule: slot.studentId.toString(),
        date: slot.date,
        time: slot.timeStart,
        room: slot.room,
        status: slot.status,
        president: evaluation?.evaluatorSubmissions?.find((s) => s.role === 'PRESIDENT') ?? { isCompleted: false },
        rapporteur: evaluation?.evaluatorSubmissions?.find((s) => s.role === 'RAPPORTEUR') ?? { isCompleted: false },
        examiner: evaluation?.evaluatorSubmissions?.find((s) => s.role === 'EXAMINER') ?? { isCompleted: false },
        encadreur: evaluation?.evaluatorSubmissions?.find((s) => s.role === 'ENCADREUR') ?? { isCompleted: false },
        partialScore: evaluation?.totalScore ? `${evaluation.totalScore}/20` : '—',
        finalScore: pv?.score ? `${pv.score}/20` : '—',
        isFinalized,
      };
    });
  }, [defenseSlots, evaluations, pvs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A192F]">Suivi des notes par soutenance</h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-sm text-[#1E3A8A]">
            <span className="font-semibold">Synchronisation mobile : </span>en temps réel
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#475569]">Soutenances totales</p>
          <p className="mt-1 text-2xl font-bold text-[#1E3A8A]">{evaluationRows.length}</p>
        </div>
        <div className="rounded-xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#475569]">Évaluations complètes</p>
          <p className="mt-1 text-2xl font-bold text-[#16A34A]">
            {evaluationRows.filter((r) => r.president.isCompleted && r.rapporteur.isCompleted && r.examiner.isCompleted).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#475569]">Notes finalisées</p>
          <p className="mt-1 text-2xl font-bold text-[#2563EB]">{evaluationRows.filter((r) => r.isFinalized).length}</p>
        </div>
        <div className="rounded-xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#475569]">En attente</p>
          <p className="mt-1 text-2xl font-bold text-[#F59E0B]">
            {evaluationRows.filter((r) => !r.president.isCompleted || !r.rapporteur.isCompleted || !r.examiner.isCompleted).length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#DDEAF7] bg-white shadow-sm">
        <div className="border-b border-[#DDEAF7] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#0A192F]">Tableau de suivi des notes</h2>
          <p className="text-sm text-[#64748B]">
            Les colonnes affichent le statut de saisie de chaque évaluateur. La synchronisation mobile est affichée en temps réel.
          </p>
        </div>

        <DataTable
          columns={[
            { key: 'student', label: 'Étudiant', render: (value: string, row: any) => (
              <div>
                <div className="font-semibold text-[#0A192F]">{value}</div>
                <div className="text-xs text-[#64748B]">Matricule: {row.matricule}</div>
              </div>
            )},
            { key: 'date', label: 'Date' },
            { key: 'time', label: 'Heure' },
            { key: 'room', label: 'Salle' },
            { key: 'president', label: 'Président', render: (_value: any, row: any) => {
              const status = getEvaluationStatus(row.president);
              const badge = STATUS_BADGES[status];
              return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              );
            }},
            { key: 'rapporteur', label: 'Rapporteur', render: (_value: any, row: any) => {
              const status = getEvaluationStatus(row.rapporteur);
              const badge = STATUS_BADGES[status];
              return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              );
            }},
            { key: 'examiner', label: 'Examinateur', render: (_value: any, row: any) => {
              const status = getEvaluationStatus(row.examiner);
              const badge = STATUS_BADGES[status];
              return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              );
            }},
            { key: 'encadreur', label: 'Encadreur', render: (_value: any, row: any) => {
              const status = getEvaluationStatus(row.encadreur);
              const badge = STATUS_BADGES[status];
              return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              );
            }},
            { key: 'partialScore', label: 'Note partielle', render: (value: string) => (
              <span className="font-mono text-sm text-[#475569]">{value}</span>
            )},
            { key: 'finalScore', label: 'Note finale', render: (value: string, row: any) => {
              if (row.isFinalized) {
                return <span className="font-mono text-sm text-[#2563EB]">{value}</span>;
              }
              return <span className="text-slate-400 font-mono text-sm">—</span>;
            }},
            { key: 'actions', label: 'Actions', render: (_value: any, row: any) => {
              const actionLabel = row.isFinalized ? 'Note validée' : 'Modifier';
              const actionClass = row.isFinalized ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-[#2563EB] text-white hover:bg-[#1E3A8A]';
              return (
                <button className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${actionClass}`}>
                  {actionLabel}
                </button>
              );
            }},
          ]}
          data={evaluationRows}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <div className="rounded-xl border border-[#DDEAF7] bg-[#F8FAFC] p-4">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4m-1 4h.01m-6.933 0h.01M9 16V9a3 3 0 016 0v7M4 17v-1M20 17v-1" />
          </svg>
          <div>
            <h3 className="font-semibold text-[#0A192F]">Comment lire le tableau</h3>
            <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-[#64748B]">
              <li><span className="font-medium">Statut "Soumis" : </span>l'évaluateur a complété et synchronisé ses notes</li>
              <li><span className="font-medium">Statut "En attente" : </span>l'évaluateur n'a pas encore démarré</li>
              <li><span className="font-medium">Statut "Partiel" : </span>l'évaluateur a saisi partiellement ses notes</li>
              <li><span className="font-medium">Note finale : </span>affichée après validation officielle par l'administration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;