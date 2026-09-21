import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge, Button } from '../../components/admin';
import { mockResults } from '../../mocks';

const ResultatsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/results une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'etudiant', label: 'Étudiant', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'matricule', label: 'Matricule', render: (value: string, row: any) => row.student?.matricule },
    { key: 'moyenne', label: 'Moyenne /20', render: (value: number) => (
      <span className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {value || '-'}
      </span>
    )},
    { key: 'mention', label: 'Mention' },
    { key: 'avis', label: 'Avis du jury', render: (value: string) => value?.substring(0, 30) + '...' },
    { key: 'date', label: 'Date', render: (value: string) => value || '-' },
    { key: 'status', label: 'Statut', render: (value: string) => <StatusBadge status={value === 'Publié' ? 'Publié' as any : 'Non publié' as any} /> },
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <button className="text-[#1A4BA8] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          PDF
        </button>
        <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Publier
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
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50">Exporter PDF</Button>
          <Button>Publier les résultats</Button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockResults} />
    </div>
  );
};

export default ResultatsPage;
