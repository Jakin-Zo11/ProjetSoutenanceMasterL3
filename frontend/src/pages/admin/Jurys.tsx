import React, { useEffect, useState } from 'react';
import { Table, Button } from '../../components/admin';
import { mockJurys, mockTeachers } from '../../mocks';

const Jurys: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/jurys une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'president',
      label: 'Président',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
    {
      key: 'rapporteur',
      label: 'Rapporteur',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
    {
      key: 'examinateur',
      label: 'Examinateur',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Jurys
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des jurys de soutenance
          </p>
        </div>
        <Button>Créer un jury</Button>
      </div>

      <Table columns={columns} data={mockJurys} />
    </div>
  );
};

export default Jurys;
