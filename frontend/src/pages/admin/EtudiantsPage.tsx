import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge, Button, Input } from '../../components/admin';
import { mockStudents } from '../../mocks';

const EtudiantsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/students une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'nom', label: 'Nom & email', render: (value: string, row: any) => (
      <div>
        <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {row.nom} {row.prenom}
        </p>
        <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {row.email}
        </p>
      </div>
    )},
    { key: 'matricule', label: 'Matricule' },
    { key: 'sujetThese', label: 'Sujet' },
    { key: 'directeur', label: 'Directeur', render: () => 'Non assigné' },
    { key: 'date', label: 'Date soutenance', render: (value: string, row: any) => {
      const defense = mockStudents.find(s => s.id === row.id);
      return defense ? '15 Jan 2025' : '-';
    }},
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

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50">Exporter</Button>
          <Button>Ajouter</Button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={filteredStudents} />
    </div>
  );
};

export default EtudiantsPage;
