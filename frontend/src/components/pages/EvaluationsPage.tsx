import React from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Download, Eye } from 'lucide-react';

const EvaluationsPage: React.FC = () => {
  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      soumise: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'Soumise' },
      en_attente: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'En attente' },
      en_cours: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'En cours' },
      conflit: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Conflit' },
      complete: { bg: 'bg-[#E1F8F0]', text: 'text-[#065F46]', label: 'Complète' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const evaluations = [
    { id: 1, etudiant: 'Rakoto Jean', jury: 'Dr. Randria, Pr. Rasoa, Dr. Andriamanitra', notePresident: 16, noteRapporteur: 15, noteExaminateur: 17, moyenne: 16, statut: 'complete' },
    { id: 2, etudiant: 'Rasoa Marie', jury: 'Pr. Andriamanitra, Dr. Randria, Dr. Ravelonarivo', notePresident: 14, noteRapporteur: 0, noteExaminateur: 0, moyenne: 0, statut: 'en_cours' },
    { id: 3, etudiant: 'Randria Paul', jury: 'Dr. Rasoa, Pr. Andriamanitra, Dr. Randria', notePresident: 0, noteRapporteur: 0, noteExaminateur: 0, moyenne: 0, statut: 'en_attente' },
    { id: 4, etudiant: 'Andriamanitra Cécile', jury: 'Pr. Rasoarimanana, Dr. Ravelonarivo, Dr. Randria', notePresident: 18, noteRapporteur: 17, noteExaminateur: 16, moyenne: 17, statut: 'conflit' }
  ];

  return (
    <div className="space-y-6">
      {/* Cards stat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Soumises
              </p>
              <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {evaluations.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D1F4E] to-[#1A4BA8] rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                En attente
              </p>
              <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {evaluations.filter(e => e.statut === 'en_attente').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FEF3C7] to-[#F59E0B] rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                En cours
              </p>
              <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {evaluations.filter(e => e.statut === 'en_cours').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#2D84E0] to-[#1A4BA8] rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Conflits
              </p>
              <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {evaluations.filter(e => e.statut === 'conflit').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
          </div>
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
                  Jury
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Note Président
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Note Rapporteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Note Examinateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Moyenne
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
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {evaluation.etudiant}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799] max-w-xs truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {evaluation.jury}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {evaluation.notePresident > 0 ? evaluation.notePresident : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {evaluation.noteRapporteur > 0 ? evaluation.noteRapporteur : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {evaluation.noteExaminateur > 0 ? evaluation.noteExaminateur : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {evaluation.moyenne > 0 ? evaluation.moyenne : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(evaluation.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Eye size={16} className="inline mr-1" />
                        Voir
                      </button>
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Download size={16} className="inline mr-1" />
                        PDF
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

export default EvaluationsPage;
