import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge, Button } from '../../components/admin';
import { mockSlots } from '../../mocks';

const CreneauxPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/slots une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'reference', label: 'Référence', render: (value: string, row: any) => `CRN-${String(row.id).padStart(3, '0')}` },
    { key: 'heureDebut', label: 'Heure début' },
    { key: 'heureFin', label: 'Heure fin' },
    { key: 'jours', label: 'Jours', render: (value: string, row: any) => row.jour },
    { key: 'type', label: 'Type' },
    { key: 'actif', label: 'Actif', render: (value: boolean) => (
      <StatusBadge status={value ? 'Actif' as any : 'Inactif' as any} />
    )},
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Modifier
        </button>
        <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50" style={{ fontFamily: 'Inter, sans-serif' }}>
          Supprimer
        </button>
      </div>
    )},
  ];

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
      {/* 2 cards résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
          <h3 className="text-lg font-bold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Période active
          </h3>
          <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Janvier 2025 - Juin 2025
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
          <h3 className="text-lg font-bold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Totaux
          </h3>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {mockSlots.length}
              </p>
              <p className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Créneaux
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D84E0]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {mockSlots.filter(s => s.actif).length}
              </p>
              <p className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Actifs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div></div>
        <Button>Ajouter un créneau</Button>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockSlots} />
    </div>
  );
};

export default CreneauxPage;
