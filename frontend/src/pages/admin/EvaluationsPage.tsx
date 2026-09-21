import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Hourglass, XCircle } from 'lucide-react';
import { StatCard, DataTable, StatusBadge } from '../../components/admin';
import { mockEvaluations } from '../../mocks';

const EvaluationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/evaluations une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'etudiant', label: 'Étudiant', render: (value: any, row: any) => `${row.defense?.student?.nom} ${row.defense?.student?.prenom}` },
    { key: 'jury', label: 'Jury', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'notePresident', label: 'Note Président', render: (value: number) => value || '-' },
    { key: 'noteRapporteur', label: 'Note Rapporteur', render: (value: number) => value || '-' },
    { key: 'noteExaminateur', label: 'Note Examinateur', render: (value: number) => value || '-' },
    { key: 'moyenne', label: 'Moyenne', render: (value: number) => (
      <span className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {value || '-'}
      </span>
    )},
    { key: 'status', label: 'Statut', render: (value: string) => <StatusBadge status={value as any} /> },
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

  const stats = [
    { title: 'Soumises', value: mockEvaluations.filter(e => e.status === 'Soumise').length, icon: CheckCircle2, color: '#1A4BA8' },
    { title: 'En attente', value: mockEvaluations.filter(e => e.status === 'En attente').length, icon: Hourglass, color: '#2D84E0' },
    { title: 'En cours', value: mockEvaluations.filter(e => e.status === 'En cours').length, icon: Clock, color: '#1A4BA8' },
    { title: 'Conflits', value: mockEvaluations.filter(e => e.status === 'Conflit').length, icon: XCircle, color: '#DC2626' },
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
      {/* 4 cartes stat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockEvaluations} />
    </div>
  );
};

export default EvaluationsPage;
