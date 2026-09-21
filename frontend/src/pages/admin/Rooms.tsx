import React, { useEffect, useState } from 'react';
import { Table, Button, Input } from '../../components/admin';
import { mockRooms } from '../../mocks';

const Rooms: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/rooms une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'batiment', label: 'Bâtiment' },
    { key: 'capacite', label: 'Capacité' },
    {
      key: 'equipements',
      label: 'Équipements',
      render: (value: string[]) => value.join(', '),
    },
    {
      key: 'disponible',
      label: 'Disponible',
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

  const filteredRooms = mockRooms.filter(
    (room) =>
      room.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.batiment.toLowerCase().includes(searchTerm.toLowerCase())
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
            Salles
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des salles de soutenance
          </p>
        </div>
        <Button>Ajouter une salle</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom ou bâtiment..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredRooms} />
    </div>
  );
};

export default Rooms;
