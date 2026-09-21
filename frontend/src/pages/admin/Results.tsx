import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Input } from '../../components/admin';
import { mockResults } from '../../mocks';

const Results: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/results une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'student',
      label: 'Étudiant',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
    { key: 'moyenne', label: 'Moyenne' },
    { key: 'mention', label: 'Mention' },
    { key: 'datePublication', label: 'Date publication' },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Publié' ? 'bg-[#1A4BA8] text-white' : 'bg-[#EAF1FB] text-[#3D6EA8]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {value}
        </span>
      ),
    },
  ];

  const filteredResults = mockResults.filter(
    (result) =>
      result.student?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.prenom.toLowerCase().includes(searchTerm.toLowerCase())
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
            Résultats
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion et publication des résultats de soutenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Exporter PDF</Button>
          <Button>Publier les résultats</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom de l'étudiant..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredResults} />
    </div>
  );
};

export default Results;
