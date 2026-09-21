import React, { useState } from 'react';
import { Calendar, Plus, Clock, XCircle, AlertTriangle, X } from 'lucide-react';

const DefensesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedDefense, setSelectedDefense] = useState<any>(null);

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'En attente' },
      planifiee: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'Planifiée' },
      en_cours: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'En cours' },
      termine: { bg: 'bg-[#1A4BA8]', text: 'text-white', label: 'Terminé' },
      annulee: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Annulée' },
      reprogrammee: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', label: 'Reprogrammée' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const defenses = [
    { id: 1, reference: 'SOUT-2024-001', etudiant: 'Rakoto Jean', sujet: 'Système de gestion de soutenances', date: '2024-09-15', heure: '09:00', salle: 'Salle A101', jury: 'Dr. Randria, Pr. Rasoa, Dr. Andriamanitra', statut: 'planifiee' },
    { id: 2, reference: 'SOUT-2024-002', etudiant: 'Rasoa Marie', sujet: 'Impact du digital sur les PME', date: '2024-09-16', heure: '14:00', salle: 'Amphi B', jury: 'Pr. Andriamanitra, Dr. Randria, Dr. Ravelonarivo', statut: 'en_cours' },
    { id: 3, reference: 'SOUT-2024-003', etudiant: 'Randria Paul', sujet: 'Optimisation des réseaux IoT', date: '2024-09-17', heure: '10:00', salle: 'Salle C205', jury: 'Dr. Rasoa, Pr. Andriamanitra, Dr. Randria', statut: 'annulee' },
    { id: 4, reference: 'SOUT-2024-004', etudiant: 'Andriamanitra Cécile', sujet: 'Analyse économie informelle', date: '2024-09-18', heure: '11:00', salle: 'Salle D102', jury: 'Pr. Rasoarimanana, Dr. Ravelonarivo, Dr. Randria', statut: 'reprogrammee' }
  ];

  const openModal = (defense: any, step: number = 1) => {
    setSelectedDefense(defense);
    setModalStep(step);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDefense(null);
    setModalStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition-colors">
              <Calendar size={16} />
              Calendrier
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors">
            <Plus size={16} />
            Planifier
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
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Date+Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Jury
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
              {defenses.map((defense) => (
                <tr key={defense.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {defense.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {defense.etudiant}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799] max-w-xs truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {defense.sujet}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {defense.date} {defense.heure}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {defense.salle}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799] max-w-xs truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {defense.jury}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(defense.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(defense.statut === 'planifiee' || defense.statut === 'en_cours' || defense.statut === 'en_attente') && (
                        <>
                          <button
                            onClick={() => openModal(defense, 1)}
                            className="text-xs text-[#2D84E0] hover:text-[#1A4BA8] font-medium"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Reprogrammer
                          </button>
                          <button
                            onClick={() => openModal(defense, 2)}
                            className="text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {defense.statut === 'annulee' && (
                        <button
                          onClick={() => openModal(defense, 3)}
                          className="text-xs text-[#2D84E0] hover:text-[#1A4BA8] font-medium"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Replanifier
                        </button>
                      )}
                      {defense.statut === 'reprogrammee' && (
                        <button
                          onClick={() => openModal(defense, 4)}
                          className="text-xs text-[#2D84E0] hover:text-[#1A4BA8] font-medium"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Historique
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panneaux d'info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panneau Annulées */}
        <div className="bg-[#FEE2E2] border border-[#B91C1C] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={20} className="text-[#B91C1C]" />
            <h3 className="text-sm font-semibold text-[#B91C1C]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Soutenances Annulées
            </h3>
          </div>
          <p className="text-2xl font-bold text-[#B91C1C]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {defenses.filter(d => d.statut === 'annulee').length}
          </p>
        </div>

        {/* Panneau Reprogrammées */}
        <div className="bg-[#E0F2FE] border border-[#0369A1] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-[#0369A1]" />
            <h3 className="text-sm font-semibold text-[#0369A1]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Soutenances Reprogrammées
            </h3>
          </div>
          <p className="text-2xl font-bold text-[#0369A1]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {defenses.filter(d => d.statut === 'reprogrammee').length}
          </p>
        </div>
      </div>

      {/* Modal Reprogrammer/Annuler */}
      {modalOpen && selectedDefense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DDEAF7] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {modalStep === 1 ? 'Reprogrammer la soutenance' : 
                 modalStep === 2 ? 'Annuler la soutenance' :
                 modalStep === 3 ? 'Replanifier la soutenance' : 'Historique des modifications'}
              </h2>
              <button onClick={closeModal} className="p-2 text-[#637799] hover:text-[#0B1D3A]">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-[#92400E]" />
                      <p className="text-sm text-[#92400E]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Vérification de la disponibilité du jury en cours...
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#E1F8F0] rounded-lg">
                      <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Dr. Randria (Président)
                      </span>
                      <span className="text-xs font-medium text-[#065F46]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Disponible
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#FEE2E2] rounded-lg">
                      <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Pr. Rasoa (Rapporteur)
                      </span>
                      <span className="text-xs font-medium text-[#B91C1C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Indisponible
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-[#EAF4FF] text-[#0B1D3A] rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Retour
                    </button>
                    <button className="flex-1 py-3 bg-[#2D84E0] text-white rounded-lg font-medium hover:bg-[#1A4BA8] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-[#FEE2E2] border-2 border-[#B91C1C] rounded-xl hover:bg-[#FECACA] transition-colors">
                      <XCircle size={32} className="text-[#B91C1C] mx-auto mb-2" />
                      <p className="font-semibold text-[#B91C1C] text-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Annuler
                      </p>
                    </button>
                    <button className="p-6 bg-[#EAF4FF] border-2 border-[#2D84E0] rounded-xl hover:bg-[#DBEAFE] transition-colors">
                      <Clock size={32} className="text-[#2D84E0] mx-auto mb-2" />
                      <p className="font-semibold text-[#2D84E0] text-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Reprogrammer
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Nouvelle date
                    </label>
                    <input type="date" className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Nouvelle heure
                    </label>
                    <input type="time" className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Nouvelle salle
                    </label>
                    <select className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]">
                      <option>Salle A101</option>
                      <option>Salle B205</option>
                      <option>Amphithéâtre C1</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={closeModal} className="flex-1 py-3 bg-[#F0F5FB] text-[#0B1D3A] rounded-lg font-medium hover:bg-[#E1E8F0] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Annuler
                    </button>
                    <button className="flex-1 py-3 bg-[#2D84E0] text-white rounded-lg font-medium hover:bg-[#1A4BA8] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Confirmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefensesPage;
