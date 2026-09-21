import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Input } from '../../components/admin';
import { mockDefenses } from '../../mocks';

const Defenses: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/defenses une fois le backend prêt
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
    { key: 'date', label: 'Date' },
    { key: 'heure', label: 'Heure' },
    {
      key: 'room',
      label: 'Salle',
      render: (value: any) => value?.nom,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => <Badge status={value as any} />,
    },
  ];

  const filteredDefenses = mockDefenses.filter(
    (defense) =>
      defense.student?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defense.student?.prenom.toLowerCase().includes(searchTerm.toLowerCase())
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
            Soutenances
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des soutenances de master
          </p>
        </div>
        <Button>Planifier une soutenance</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom de l'étudiant..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredDefenses} />
    </div>
  );
};

export default Defenses;
