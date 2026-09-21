import React from 'react';
import { Download, Plus, Edit, CheckCircle, XCircle } from 'lucide-react';

const TeachersPage: React.FC = () => {
  const getAvailabilityBadge = (disponibilite: string) => {
    if (disponibilite === 'disponible') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">
          <CheckCircle size={12} />
          Disponible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#B91C1C]">
          <XCircle size={12} />
          Indisponible
        </span>
      );
    }
  };

  const teachers = [
    { id: 1, nom: 'Dr. Randria Jean', grade: 'Maître de Conférences', specialite: 'Informatique', departement: 'Informatique & TIC', nbJurys: 5, disponibilite: 'disponible' },
    { id: 2, nom: 'Pr. Rasoa Marie', grade: 'Professeur', specialite: 'Gestion', departement: 'Gestion & Finance', nbJurys: 3, disponibilite: 'disponible' },
    { id: 3, nom: 'Dr. Andriamanitra Paul', grade: 'Docteur', specialite: 'Réseaux', departement: 'Informatique & TIC', nbJurys: 4, disponibilite: 'indisponible' }
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition-colors">
            <Download size={16} />
            Exporter
          </button>
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
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Nombre de jurys
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Disponibilité
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEAF7]">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {teacher.nom}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {teacher.grade}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {teacher.specialite}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {teacher.departement}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {teacher.nbJurys}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getAvailabilityBadge(teacher.disponibilite)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Modifier
                    </button>
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

export default TeachersPage;
