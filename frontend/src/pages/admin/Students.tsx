import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Input } from '../../components/admin';
import { mockStudents } from '../../mocks';
import { Student } from '../../types';

const Students: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/students une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'matricule', label: 'Matricule' },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'formation', label: 'Formation' },
    { key: 'promotion', label: 'Promotion' },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => <Badge status={value as any} />
    },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Étudiants
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des étudiants inscrits aux soutenances
          </p>
        </div>
        <Button>Ajouter un étudiant</Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Nom, prénom ou matricule..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredStudents} />
    </div>
  );
};

export default Students;
