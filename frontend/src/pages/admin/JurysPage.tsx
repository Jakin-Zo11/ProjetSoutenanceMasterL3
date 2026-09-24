import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DataTable, StatusBadge } from '../../components/admin';
import { mockJurys, mockDefenses, mockTeachers } from '../../mocks';

const JurysPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/jurys une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'reference', label: 'Référence', render: (value: string, row: any) => `JURY-${String(row.id).padStart(3, '0')}` },
    { key: 'etudiant', label: 'Étudiant', render: (value: any, row: any) => {
      const defense = mockDefenses.find(d => d.juryId === row.id);
      return defense ? `${defense.student?.nom} ${defense.student?.prenom}` : '-';
    }},
    { key: 'president', label: 'Président', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'rapporteur', label: 'Rapporteur', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'examinateur', label: 'Examinateur', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'date', label: 'Date', render: (value: string, row: any) => {
      const defense = mockDefenses.find(d => d.juryId === row.id);
      return defense ? defense.date : '-';
    }},
    { key: 'status', label: 'Statut', render: (value: string, row: any) => {
      const defense = mockDefenses.find(d => d.juryId === row.id);
      return defense ? <StatusBadge status={defense.status} /> : <StatusBadge status="En attente" />;
    }},
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
      {/* Bannière jaune d'avertissement */}
      <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-[#B91C1C]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-[#92400E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Règle importante
          </p>
          <p className="text-sm text-[#92400E]" style={{ fontFamily: 'Inter, sans-serif' }}>
            3 membres minimum par jury (Président, Rapporteur, Examinateur)
          </p>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockJurys} />
    </div>
  );
};

export default JurysPage;
