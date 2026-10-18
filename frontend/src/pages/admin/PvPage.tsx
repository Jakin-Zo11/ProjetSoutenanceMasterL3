
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { DataTable } from '../../components/admin';
import { useAdminData } from '../../context/AdminDataContext';

interface PvPageProps {
  initialTab?: 'evaluations' | 'results' | 'pv';
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character] as string));

const PvPage: React.FC<PvPageProps> = ({ initialTab = 'pv' }) => {
  const { defenseSlots, evaluations, pvs, students } = useAdminData();

  const [activeTab, setActiveTab] = useState<
    'evaluations' | 'results' | 'pv'
  >(initialTab);

  const [selectedReport, setSelectedReport] =
    useState<(typeof pvs)[number] | null>(null);

  const [feedback, setFeedback] = useState('');

  // Retrouver le créneau associé à un étudiant.
  const getSlotForStudent = (studentId: number) =>
    defenseSlots.find((slot) => slot.studentId === studentId);

  // Retrouver l'étudiant à partir de son matricule.
  const getStudentForPv = (pv: (typeof pvs)[number]) =>
    students.find(
      (student) => student.matricule === pv.studentMatricule,
    );

  // Les types actuels ne possèdent pas de référence PV.
  const getPvReference = (pv: (typeof pvs)[number]) =>
    `PV-${pv.id}`;

  // Préparer les lignes du tableau des évaluations.
  const evaluationRows = evaluations.map((evaluation) => {
    const slot = defenseSlots.find(
      (entry) => entry.id === evaluation.slotId,
    );

    const student = students.find(
      (entry) => entry.id === evaluation.studentId,
    );

    return {
      id: evaluation.id,
      student:
        slot?.studentName ??
        student?.fullName ??
        'Étudiant inconnu',
      matricule: student?.matricule ?? '—',
      total: `${evaluation.totalScore}/20`,
      status:
        slot?.status === 'COMPLETED'
          ? 'Validée'
          : 'En cours',
      comments: evaluation.comments || 'Aucun commentaire',
    };
  });

  // Calculer la mention à partir de la note finale.
  const resultRows = evaluationRows.map((evaluation) => {
    const score = Number.parseFloat(
      evaluation.total.split('/')[0],
    );

    const mention =
      score >= 16
        ? 'Très bien'
        : score >= 14
          ? 'Bien'
          : score >= 12
            ? 'Assez bien'
            : score >= 10
              ? 'Passable'
              : 'Insuffisant';

    return { ...evaluation, mention };
  });

  // Préparer les lignes des procès-verbaux.
  const pvRows = pvs.map((pv) => {
    const student = getStudentForPv(pv);

    const slot = student
      ? getSlotForStudent(student.id)
      : undefined;

    return {
      ...pv,
      reference: getPvReference(pv),
      studentName:
        student?.fullName ??
        slot?.studentName ??
        'Étudiant inconnu',
      dateTime: slot
        ? `${slot.date} · ${slot.timeStart}`
        : '—',
      room: slot?.room ?? '—',
      generatedDate: '—',
    };
  });

  // Retrouver les informations liées à un PV.
  const getReportDetails = (pv: (typeof pvs)[number]) => {
    const student = getStudentForPv(pv);

    const slot = student
      ? getSlotForStudent(student.id)
      : undefined;

    const evaluation = evaluations.find(
      (entry) =>
        student !== undefined &&
        entry.studentId === student.id &&
        (slot === undefined || entry.slotId === slot.id),
    );

    return {
      student,
      slot,
      evaluation,
      reference: getPvReference(pv),
      studentName:
        student?.fullName ??
        slot?.studentName ??
        'Étudiant inconnu',
      comments: evaluation?.comments || 'Aucun commentaire',
    };
  };

  // Ouvrir l'impression du PV dans une nouvelle fenêtre.
  const printPv = (pv: (typeof pvs)[number]) => {
    const popup = window.open(
      '',
      '_blank',
      'width=800,height=650',
    );

    if (!popup) {
      setFeedback(
        "La fenêtre d'impression a été bloquée par le navigateur.",
      );
      return;
    }

    const details = getReportDetails(pv);
    const { slot, evaluation } = details;

    popup.document.write(`
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(details.reference)}</title>
          <style>
            body {
              font: 16px Arial, sans-serif;
              color: #0A192F;
              margin: 48px;
            }
            h1 { color: #1E3A8A; }
            hr {
              border: 0;
              border-top: 1px solid #cbd5e1;
            }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>Procès-verbal de soutenance</h1>
          <hr>
          <p>
            <strong>Référence :</strong>
            ${escapeHtml(details.reference)}
          </p>
          <p>
            <strong>Étudiant :</strong>
            ${escapeHtml(details.studentName)}
            (${escapeHtml(pv.studentMatricule)})
          </p>
          <p>
            <strong>Date et heure :</strong>
            ${escapeHtml(
              slot ? `${slot.date} à ${slot.timeStart}` : '—',
            )}
          </p>
          <p>
            <strong>Salle :</strong>
            ${escapeHtml(slot?.room ?? '—')}
          </p>
          <p>
            <strong>Note finale :</strong>
            ${pv.score}/20
          </p>
          <p>
            <strong>Présentation :</strong>
            ${evaluation?.presentationScore ?? '—'}/5
            ·
            <strong>Technique :</strong>
            ${evaluation?.technicalScore ?? '—'}/10
            ·
            <strong>Réponses :</strong>
            ${evaluation?.answersScore ?? '—'}/5
          </p>
          <p>
            <strong>Mention :</strong>
            ${escapeHtml(pv.mention)}
          </p>
          <p>
            <strong>Commentaires :</strong>
            ${escapeHtml(details.comments)}
          </p>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);

    popup.document.close();

    setFeedback(
      `Aperçu d'impression ouvert pour ${details.reference}.`,
    );
  };

  // Exporter les PV en CSV.
  const exportCsv = () => {
    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const lines = [
      [
        'Référence',
        'Matricule',
        'Étudiant',
        'Note /20',
        'Mention',
        'Généré le',
      ]
        .map(escapeCsv)
        .join(';'),

      ...pvs.map((pv) => {
        const details = getReportDetails(pv);

        return [
          details.reference,
          pv.studentMatricule,
          details.studentName,
          pv.score,
          pv.mention,
          '—',
        ]
          .map(escapeCsv)
          .join(';');
      }),
    ];

    const url = URL.createObjectURL(
      new Blob([`\uFEFF${lines.join('\r\n')}`], {
        type: 'text/csv;charset=utf-8',
      }),
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'proces-verbaux.csv';
    link.click();

    URL.revokeObjectURL(url);

    setFeedback('Export CSV préparé.');
  };

  const tabs = [
    { id: 'evaluations' as const, label: 'Suivi Évaluations' },
    { id: 'results' as const, label: 'Résultats Finaux' },
    { id: 'pv' as const, label: 'Export PV' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#0A192F] text-white'
                : 'bg-white text-[#637799] hover:bg-[#EAF4FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && (
        <p
          role="status"
          className="rounded-lg bg-[#EFF6FF] p-3 text-sm text-[#1E3A8A]"
        >
          {feedback}
        </p>
      )}

      {activeTab === 'evaluations' && (
        <DataTable
          columns={[
            { key: 'student', label: 'Étudiant' },
            { key: 'matricule', label: 'Matricule' },
            { key: 'total', label: 'Note' },
            { key: 'status', label: 'Statut' },
            { key: 'comments', label: 'Commentaires' },
          ]}
          data={evaluationRows}
        />
      )}

      {activeTab === 'results' && (
        <DataTable
          columns={[
            { key: 'student', label: 'Étudiant' },
            { key: 'matricule', label: 'Matricule' },
            { key: 'total', label: 'Moyenne' },
            { key: 'mention', label: 'Mention' },
            { key: 'status', label: 'Statut' },
          ]}
          data={resultRows}
        />
      )}

      {activeTab === 'pv' && (
        <>
          <div className="flex items-start gap-3 rounded-lg border border-[#3B82F6] bg-[#EAF4FF] p-4">
            <Info
              size={20}
              className="text-[#1E3A8A]"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-[#1E3A8A]">
                Procès-verbaux générés automatiquement
              </p>
              <p className="text-sm text-[#637799]">
                Chaque PV est créé à la validation d'une évaluation.
                L'impression permet de l'enregistrer au format PDF.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={exportCsv}
              disabled={pvs.length === 0}
              className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Exporter la liste (CSV)
            </button>
          </div>

          <DataTable
            columns={[
              { key: 'reference', label: 'Référence PV' },
              { key: 'studentName', label: 'Étudiant' },
              { key: 'dateTime', label: 'Date & horaire' },
              { key: 'room', label: 'Salle' },
              { key: 'score', label: 'Note /20' },
              { key: 'generatedDate', label: 'Généré le' },
              {
                key: 'actions',
                label: 'Actions',
                render: (_value, row: (typeof pvRows)[number]) => {
                  const originalPv = pvs.find(
                    (pv) => pv.id === row.id,
                  );

                  return (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-[#3B82F6] hover:underline"
                        onClick={() => {
                          if (originalPv) {
                            setSelectedReport(originalPv);
                          }
                        }}
                      >
                        Aperçu
                      </button>

                      <button
                        type="button"
                        className="text-[#1E3A8A] hover:underline"
                        onClick={() => {
                          if (originalPv) {
                            printPv(originalPv);
                          }
                        }}
                      >
                        Imprimer / PDF
                      </button>
                    </div>
                  );
                },
              },
            ]}
            data={pvRows}
          />
        </>
      )}

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/50 p-4"
          role="presentation"
          onClick={() => setSelectedReport(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-preview-title"
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {(() => {
              const details = getReportDetails(selectedReport);

              return (
                <>
                  <h2
                    id="pv-preview-title"
                    className="text-xl font-bold text-[#0A192F]"
                  >
                    Aperçu du PV {details.reference}
                  </h2>

                  <p>
                    <strong>Étudiant :</strong>{' '}
                    {details.studentName} (
                    {selectedReport.studentMatricule})
                  </p>

                  <p>
                    <strong>Note finale :</strong>{' '}
                    {selectedReport.score}/20
                  </p>

                  <p>
                    <strong>Mention :</strong>{' '}
                    {selectedReport.mention}
                  </p>

                  <p>
                    <strong>Commentaires :</strong>{' '}
                    {details.comments}
                  </p>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="rounded-lg px-4 py-2 text-[#637799]"
                    >
                      Fermer
                    </button>

                    <button
                      type="button"
                      onClick={() => printPv(selectedReport)}
                      className="rounded-lg bg-[#1E3A8A] px-4 py-2 font-semibold text-white"
                    >
                      Imprimer / PDF
                    </button>
                  </div>
                </>
              );
            })()}
          </section>
        </div>
      )}
    </div>
  );
};

export default PvPage;
