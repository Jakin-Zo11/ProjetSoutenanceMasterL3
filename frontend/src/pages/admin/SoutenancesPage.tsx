import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge, Button } from '../../components/admin';
import { mockDefenses } from '../../mocks';

const SoutenancesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/defenses une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const getActions = (status: string) => {
    switch (status) {
      case 'Planifiée':
        return (
          <div className="flex gap-2">
            <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => console.log('Reprogrammer')}>
              Reprogrammer
            </button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => console.log('Annuler')}>
              Annuler
            </button>
          </div>
        );
      case 'En cours':
        return (
          <div className="flex gap-2">
            <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Historique
            </button>
          </div>
        );
      case 'Annulée':
        return (
          <div className="flex gap-2">
            <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => console.log('Replanifier')}>
              Replanifier
            </button>
            <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Historique
            </button>
          </div>
        );
      case 'Reprogrammée':
        return (
          <div className="flex gap-2">
            <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Modifier
            </button>
            <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Historique
            </button>
          </div>
        );
      default:
        return (
          <div className="flex gap-2">
            <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Voir
            </button>
          </div>
        );
    }
  };

  const columns = [
    { key: 'reference', label: 'Référence', render: (value: string, row: any) => `SOUT-${String(row.id).padStart(3, '0')}` },
    { key: 'etudiant', label: 'Étudiant', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'sujet', label: 'Sujet', render: (value: string, row: any) => row.student?.sujetThese?.substring(0, 40) + '...' },
    { key: 'dateHeure', label: 'Date & Heure', render: (value: string, row: any) => `${row.date} · ${row.heure}` },
    { key: 'salle', label: 'Salle', render: (value: any) => value?.nom },
    { key: 'jury', label: 'Jury', render: (value: any, row: any) => `JURY-${String(row.juryId).padStart(3, '0')}` },
    { key: 'status', label: 'Statut', render: (value: string) => <StatusBadge status={value as any} /> },
    { key: 'actions', label: 'Actions', render: (value: any, row: any) => getActions(row.status) },
  ];

  const canceledDefenses = mockDefenses.filter(d => d.status === 'Annulée');
  const rescheduledDefenses = mockDefenses.filter(d => d.status === 'Reprogrammée');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button variant="secondary">Calendrier</Button>
          <Button>Planifier</Button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockDefenses} />

      {/* Panneau rouge - Soutenances annulées */}
      {canceledDefenses.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#DC2626] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Soutenances annulées
          </h3>
          <div className="space-y-3">
            {canceledDefenses.map((defense) => (
              <div key={defense.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#FEE2E2]">
                <div>
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {defense.student?.nom} {defense.student?.prenom}
                  </p>
                  <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Motif: Conflit d'emploi du temps
                  </p>
                </div>
                <Button variant="secondary" onClick={() => console.log('Replanifier')}>
                  Replanifier
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panneau bleu ciel - Soutenances reprogrammées */}
      {rescheduledDefenses.length > 0 && (
        <div className="bg-[#E0F2FE] border border-[#0369A1] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#0369A1] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Soutenances reprogrammées
          </h3>
          <div className="space-y-3">
            {rescheduledDefenses.map((defense) => (
              <div key={defense.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#BAE6FD]">
                <div>
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {defense.student?.nom} {defense.student?.prenom}
                  </p>
                  <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Nouvelle date: {defense.date} à {defense.heure}
                  </p>
                </div>
                <StatusBadge status="Reprogrammée" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoutenancesPage;
