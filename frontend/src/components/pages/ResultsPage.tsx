import React from 'react';
import { Download, FileText, CheckCircle, Trophy } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'En attente' },
      publie: { bg: 'bg-[#1D4ED8]', text: 'text-white', label: 'Publié' },
      non_publie: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Non publié' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getMention = (moyenne: number) => {
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const results = [
    { id: 1, etudiant: 'Rakoto Jean', matricule: 'MAT-2024-001', moyenne: 16, mention: 'Très Bien', avis: 'Excellent travail, sujet bien maîtrisé', date: '2024-09-15', statut: 'publie' },
    { id: 2, etudiant: 'Rasoa Marie', matricule: 'MAT-2024-002', moyenne: 14.5, mention: 'Bien', avis: 'Travail sérieux, bonne présentation', date: '2024-09-16', statut: 'en_attente' },
    { id: 3, etudiant: 'Randria Paul', matricule: 'MAT-2024-003', moyenne: 12, mention: 'Assez Bien', avis: 'Traitement correct du sujet', date: '2024-09-17', statut: 'non_publie' }
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition-colors">
              <Download size={16} />
              Exporter PDF
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors">
            <CheckCircle size={16} />
            Publier les résultats
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
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Moyenne /20
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Mention
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Avis du jury
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
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {result.etudiant}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.matricule}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-3xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.moyenne}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-[#F59E0B]" />
                      <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {result.mention}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799] max-w-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {result.avis}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(result.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <FileText size={16} className="inline mr-1" />
                        PDF
                      </button>
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Publier
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

export default ResultsPage;
