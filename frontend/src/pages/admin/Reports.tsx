import React, { useEffect, useState } from 'react';
import { Table, Button, Input } from '../../components/admin';
import { mockReports } from '../../mocks';

const Reports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: connecter à l'API /api/reports une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'reference', label: 'Référence' },
    {
      key: 'student',
      label: 'Étudiant',
      render: (value: any) => `${value?.nom} ${value?.prenom}`,
    },
    { key: 'dateGeneration', label: 'Date génération' },
    {
      key: 'room',
      label: 'Salle',
      render: (value: any) => value?.nom,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Généré' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#EAF1FB] text-[#3D6EA8]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {value}
        </span>
      ),
    },
  ];

  const filteredReports = mockReports.filter(
    (report) =>
      report.student?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reference.toLowerCase().includes(searchTerm.toLowerCase())
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
            PV / Rapports
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gestion des procès-verbaux de soutenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Tout télécharger</Button>
          <Button>Générer PV</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <Input
          label="Rechercher"
          placeholder="Référence ou nom de l'étudiant..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table columns={columns} data={filteredReports} />
    </div>
  );
};

export default Reports;
