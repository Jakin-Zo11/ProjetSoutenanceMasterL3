import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Input } from '../../components/admin';
import { mockTeachers } from '../../mocks';

const Teachers: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/teachers une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'specialite', label: 'Spécialité' },
    { key: 'grade', label: 'Grade' },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Actif' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {value}
        </span>
      ),
    },
  ];

  const filteredTeachers = mockTeachers.filter(
    (teacher) =>
      teacher.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            Enseignants
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des enseignants et membres de jury
          </p>
        </div>
        <Button>Ajouter un enseignant</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom, prénom ou email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredTeachers} />
    </div>
  );
};

export default Teachers;
