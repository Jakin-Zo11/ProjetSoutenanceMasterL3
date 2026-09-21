import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Input } from '../../components/admin';
import { mockEvaluations } from '../../mocks';

const Evaluations: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/evaluations une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'defense',
      label: 'Soutenance',
      render: (value: any) => `${value?.student?.nom} ${value?.student?.prenom}`,
    },
    {
      key: 'jury',
      label: 'Jury',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
    { key: 'moyenne', label: 'Moyenne' },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Soumise'
              ? 'bg-[#DBEAFE] text-[#1D4ED8]'
              : value === 'En attente'
              ? 'bg-[#EAF1FB] text-[#3D6EA8]'
              : value === 'En cours'
              ? 'bg-[#E0F2FE] text-[#0369A1]'
              : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {value}
        </span>
      ),
    },
  ];

  const filteredEvaluations = mockEvaluations.filter(
    (evaluation) =>
      evaluation.defense?.student?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.defense?.student?.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Évaluations
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des évaluations des soutenances
          </p>
        </div>
        <Button>Voir détails</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom de l'étudiant..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredEvaluations} />
    </div>
  );
};

export default Evaluations;
