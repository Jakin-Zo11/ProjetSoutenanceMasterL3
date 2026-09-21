import React from 'react';
import { Download, FileText, Eye, CheckCircle, Info } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      genere: { bg: 'bg-[#E1F8F0]', text: 'text-[#065F46]', label: 'Généré' },
      en_attente: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'En attente' },
      publie: { bg: 'bg-[#1D4ED8]', text: 'text-white', label: 'Publié' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const reports = [
    { id: 1, reference: 'PV-2024-001', etudiant: 'Rakoto Jean', dateHoraire: '2024-09-15 09:00', salle: 'Salle A101', genereLe: '2024-09-15 11:30', statut: 'genere' },
    { id: 2, reference: 'PV-2024-002', etudiant: 'Rasoa Marie', dateHoraire: '2024-09-16 14:00', salle: 'Amphi B', genereLe: '2024-09-16 16:30', statut: 'publie' },
    { id: 3, reference: 'PV-2024-003', etudiant: 'Randria Paul', dateHoraire: '2024-09-17 10:00', salle: 'Salle C205', genereLe: '-', statut: 'en_attente' }
  ];

  return (
    <div className="space-y-6">
      {/* Bannière info */}
      <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[#2D84E0]" />
          <p className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Les procès-verbaux sont générés automatiquement après la complétion des évaluations par tous les membres du jury.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition-colors">
            <Download size={16} />
            Tout télécharger
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors">
            <FileText size={16} />
            Générer PV
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
                  Référence PV
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Date & Horaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Généré le
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
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {report.etudiant}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.dateHoraire}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {report.salle}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.genereLe}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(report.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Eye size={16} className="inline mr-1" />
                        Voir
                      </button>
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

      {/* Aperçu document officiel PV */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm p-8">
        <div className="border-b border-[#DDEAF7] pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-[#1A4BA8] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">EMIT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  EMIT Fianarantsoa
                </h1>
                <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  École de Management et d'Innovation Technologique
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Procès-Verbal de Soutenance
              </p>
              <p className="text-xs text-[#637799]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                PV-2024-001
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Composition du jury */}
          <div>
            <h3 className="text-lg font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Composition du Jury
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Président
                </p>
                <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Dr. Randria Jean
                </p>
              </div>
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Rapporteur
                </p>
                <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Pr. Rasoa Marie
                </p>
              </div>
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Examinateur
                </p>
                <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Dr. Andriamanitra Paul
                </p>
              </div>
            </div>
          </div>

          {/* Notes des membres */}
          <div>
            <h3 className="text-lg font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Notes des Membres du Jury
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Note Président
                </p>
                <p className="text-2xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  16/20
                </p>
              </div>
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Note Rapporteur
                </p>
                <p className="text-2xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  15/20
                </p>
              </div>
              <div className="p-3 bg-[#F0F5FB] rounded-lg">
                <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Note Examinateur
                </p>
                <p className="text-2xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  17/20
                </p>
              </div>
            </div>
          </div>

          {/* Moyenne et Mention */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#EAF4FF] border border-[#2D84E0] rounded-lg">
              <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Moyenne Finale
              </p>
              <p className="text-4xl font-bold text-[#2D84E0]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                16/20
              </p>
            </div>
            <div className="p-4 bg-[#EAF4FF] border border-[#2D84E0] rounded-lg">
              <p className="text-xs text-[#637799] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Mention
              </p>
              <p className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Très Bien
              </p>
            </div>
          </div>

          {/* Avis du jury */}
          <div>
            <h3 className="text-lg font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Avis du Jury
            </h3>
            <div className="p-4 bg-[#F0F5FB] rounded-lg">
              <p className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Le jury déclare que le candidat Rakoto Jean a soutenu avec succès son mémoire intitulé "Système de gestion de soutenances". Le travail présenté témoigne d'une bonne maîtrise du sujet et d'une démarche méthodologique rigoureuse. Le jury recommande l'attribution de la mention "Très Bien".
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="flex justify-between pt-6 border-t border-[#DDEAF7]">
            <div className="text-center">
              <p className="text-xs text-[#637799] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Le Président du Jury
              </p>
              <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Dr. Randria Jean
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#637799] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fianarantsoa, le 15 Septembre 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
