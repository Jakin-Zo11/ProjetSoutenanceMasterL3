import React from 'react';
import { AlertTriangle, Edit } from 'lucide-react';

const JurysPage: React.FC = () => {
  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'En attente' },
      valide: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'Validé' },
      complet: { bg: 'bg-[#1A4BA8]', text: 'text-white', label: 'Complet' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const jurys = [
    { id: 1, reference: 'JURY-2024-001', etudiant: 'Rakoto Jean', president: 'Dr. Randria', rapporteur: 'Pr. Rasoa', examinateur: 'Dr. Andriamanitra', date: '2024-09-15', statut: 'valide' },
    { id: 2, reference: 'JURY-2024-002', etudiant: 'Rasoa Marie', president: 'Pr. Andriamanitra', rapporteur: 'Dr. Randria', examinateur: 'Dr. Ravelonarivo', date: '2024-09-16', statut: 'complet' },
    { id: 3, reference: 'JURY-2024-003', etudiant: 'Randria Paul', president: 'Dr. Rasoa', rapporteur: 'Pr. Andriamanitra', examinateur: 'Dr. Randria', date: '2024-09-17', statut: 'en_attente' }
  ];

  return (
    <div className="space-y-6">
      {/* Bannière avertissement */}
      <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-[#92400E]" />
          <p className="text-sm font-medium text-[#92400E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            3 membres obligatoires par jury — Président, Rapporteur, Examinateur
          </p>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F5FB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Référence jury
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Président
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Rapporteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Examinateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Date
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
              {jurys.map((jury) => (
                <tr key={jury.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {jury.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {jury.etudiant}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {jury.president}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {jury.rapporteur}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {jury.examinateur}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {jury.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(jury.statut)}
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

export default JurysPage;
