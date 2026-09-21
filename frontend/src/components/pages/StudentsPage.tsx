import React, { useState } from 'react';
import { Search, Download, Plus, Edit, Eye } from 'lucide-react';

const StudentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'En attente' },
      dossier_complet: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'Dossier complet' },
      planifiee: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'Planifiée' },
      termine: { bg: 'bg-[#1A4BA8]', text: 'text-white', label: 'Terminé' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const students = [
    { id: 1, nom: 'Rakoto Jean', email: 'rakoto.jean@emit.mg', matricule: 'MAT-2024-001', sujet: 'Système de gestion de soutenances', directeur: 'Dr. Randria', date: '2024-09-15', statut: 'planifiee' },
    { id: 2, nom: 'Rasoa Marie', email: 'rasoa.marie@emit.mg', matricule: 'MAT-2024-002', sujet: 'Impact du digital sur les PME', directeur: 'Pr. Andriamanitra', date: '2024-09-16', statut: 'en_cours' },
    { id: 3, nom: 'Randria Paul', email: 'randria.paul@emit.mg', matricule: 'MAT-2024-003', sujet: 'Optimisation des réseaux IoT', directeur: 'Dr. Ravelonarivo', date: '2024-09-17', statut: 'en_attente' }
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#637799]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition-colors">
              <Download size={16} />
              Exporter
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors">
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F5FB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Nom & Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Sujet de mémoire
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Directeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Date soutenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEAF7]">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {student.nom}
                    </p>
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {student.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {student.matricule}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799] max-w-xs truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {student.sujet}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {student.directeur}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {student.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(student.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Modifier
                      </button>
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Voir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
