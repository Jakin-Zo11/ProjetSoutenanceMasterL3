import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge, Button } from '../../components/admin';
import { mockTeachers } from '../../mocks';

const EnseignantsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/teachers une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'nom', label: 'Nom', render: (value: string, row: any) => (
      <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {row.nom} {row.prenom}
      </p>
    )},
    { key: 'grade', label: 'Grade' },
    { key: 'specialite', label: 'Spécialité' },
    { key: 'departement', label: 'Département', render: () => 'Informatique' },
    { key: 'nbJurys', label: 'Nb jurys', render: () => Math.floor(Math.random() * 5) + 1 },
    { key: 'disponibilite', label: 'Disponibilité', render: (value: string) => (
      <StatusBadge status={value === 'Actif' ? 'Actif' as any : 'Inactif' as any} />
    )},
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Modifier
        </button>
        <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Voir
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
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50">Exporter</Button>
          <Button>Ajouter</Button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockTeachers} />
    </div>
  );
};

export default EnseignantsPage;
