import React, { useMemo, useState } from 'react';
import { DataTable, Input, StatusBadge } from '../../components/admin';
import { useAdminData } from '../../context/AdminDataContext';

const DepotsPage: React.FC = () => {
  const { students, uploadStudentPdf } = useAdminData();
  const [activeTab, setActiveTab] = useState<'students' | 'themes' | 'pdfs'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  const tabs = [
    { id: 'students' as const, label: 'Liste Étudiants' },
    { id: 'themes' as const, label: 'Thèmes Déposés' },
    { id: 'pdfs' as const, label: 'Fichiers PDF' },
  ];

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
    { key: 'submissionStatus', label: 'Statut', render: (value: string) => <StatusBadge status={value === 'PDF déposé' ? 'Actif' as any : 'Inactif' as any} /> },
    { key: 'pdfUrl', label: 'PDF', render: (value?: string) => value ? <a className="font-semibold text-[#1E3A8A] underline" href={value} target="_blank" rel="noreferrer">Consulter</a> : 'Non déposé' },
  ];

  const themesColumns = [
    { key: 'matricule', label: 'Matricule' },
    { key: 'fullName', label: 'Étudiant' },
    { key: 'themeTitle', label: 'Sujet de thèse' },
    { key: 'submissionStatus', label: 'Statut' },
  ];

  const pdfsColumns = [
    { key: 'matricule', label: 'Matricule' },
    { key: 'fullName', label: 'Étudiant' },
    { key: 'themeTitle', label: 'Sujet' },
    {
      key: 'pdfUrl',
      label: 'PDF',
      render: (value?: string) => value ? <span className="text-[#1E3A8A] font-semibold">Disponible</span> : <span className="text-[#637799]">Non déposé</span>,
    },
  ];

  const handleFileUpload = async (student: { matricule: string; fullName: string; }, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFeedback('Le fichier sélectionné doit être un PDF.');
      event.target.value = '';
      return;
    }
    try {
      await uploadStudentPdf(student.matricule, URL.createObjectURL(file));
      setFeedback(`PDF déposé pour ${student.fullName}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Le dépôt a échoué.');
    }
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0A192F] text-white'
                  : 'bg-white text-[#637799] hover:bg-[#EAF4FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="max-w-md flex-1">
          <Input label="Recherche" placeholder="Rechercher par matricule, nom ou thème..." value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {feedback && <p role="status" className="rounded-lg bg-[#EFF6FF] p-3 text-sm text-[#1E3A8A]">{feedback}</p>}

      {activeTab === 'students' && (
        <DataTable
          columns={[
            ...studentsColumns,
            {
              key: 'upload',
              label: 'Déposer PDF',
              render: (_value, row) => (
                <label className="cursor-pointer rounded-lg border border-[#1E3A8A] px-3 py-2 text-sm font-semibold text-[#1E3A8A]">
                  Ajouter
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => handleFileUpload(row, event)}
                  />
                </label>
              ),
            },
          ]}
          data={filteredStudents}
        />
      )}

      {activeTab === 'themes' && (
        <DataTable columns={themesColumns} data={filteredStudents} />
      )}

      {activeTab === 'pdfs' && (
        <DataTable columns={pdfsColumns} data={filteredStudents} />
      )}
    </div>
  );
};

export default DepotsPage;
