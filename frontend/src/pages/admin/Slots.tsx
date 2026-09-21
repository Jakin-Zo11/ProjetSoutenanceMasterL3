import React, { useEffect, useState } from 'react';
import { Table, Button } from '../../components/admin';
import { mockSlots } from '../../mocks';

const Slots: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/slots une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'jour', label: 'Jour' },
    { key: 'heureDebut', label: 'Heure début' },
    { key: 'heureFin', label: 'Heure fin' },
    { key: 'type', label: 'Type' },
    {
      key: 'actif',
      label: 'Actif',
      render: (value: boolean) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {value ? 'Oui' : 'Non'}
        </span>
      ),
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
            Créneaux
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des créneaux horaires de soutenance
          </p>
        </div>
        <Button>Ajouter un créneau</Button>
      </div>

      <Table columns={columns} data={mockSlots} />
    </div>
  );
};

export default Slots;
