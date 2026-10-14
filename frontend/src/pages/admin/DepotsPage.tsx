import React, { useMemo, useState } from 'react';
import { DataTable, Input, StatusBadge } from '../../components/admin';
import { useAdminData } from '../../context/AdminDataContext';

const DepotsPage: React.FC = () => {
  const { students } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => students.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.themeTitle.toLowerCase().includes(searchQuery.toLowerCase())
  ), [students, searchQuery]);

  const studentsColumns = [
    { key: 'matricule', label: 'Matricule' },
    { key: 'fullName', label: 'Nom' },
    { key: 'filiere', label: 'Filière' },
    { key: 'promotion', label: 'Promotion' },
    { 
      key: 'themeTitle', 
      label: 'Thème de stage/mémoire',
      render: (value: string) => (
        <span className="text-sm text-[#637799]">{value || '-'}</span>
      )
    },
    { 
      key: 'submissionStatus', 
      label: 'Statut dépôt PDF',
      render: (value: string) => (
        <StatusBadge 
          status={value === 'PDF_SUBMITTED' ? 'Actif' : 'Inactif'}
          label={value === 'PDF_SUBMITTED' ? 'Déposé' : 'Pas encore'}
        />
      )
    },
    { 
      key: 'pdfAction', 
      label: 'Rédaction PDF',
      render: (_value: string, row: any) => {
        const hasPdf = row.pdfUrl && row.submissionStatus === 'PDF_SUBMITTED';
        if (hasPdf) {
          return (
            <a 
              href={row.pdfUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1E3A8A]"
            >
              Voir le PDF
            </a>
          );
        }
        return (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-lg bg-[#E2E8F0] px-3 py-2 text-sm font-semibold text-[#94A3B8]"
          >
            Voir le PDF
          </span>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A192F]">Liste des Étudiants</h1>
        <div className="max-w-md flex-1 ml-4">
          <Input label="Recherche" placeholder="Rechercher par matricule, nom ou thème..." value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <DataTable columns={studentsColumns} data={filteredStudents} />
    </div>
  );
};

export default DepotsPage;
