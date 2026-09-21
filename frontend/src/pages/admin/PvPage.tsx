import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { DataTable, StatusBadge, Button } from '../../components/admin';
import { mockReports } from '../../mocks';

const PvPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    // TODO: connecter à l'API /api/reports une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = [
    { key: 'reference', label: 'Référence PV' },
    { key: 'etudiant', label: 'Étudiant', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'dateHoraire', label: 'Date & Horaire', render: (value: string, row: any) => `${row.defense?.date} · ${row.defense?.heure}` },
    { key: 'salle', label: 'Salle', render: (value: any) => value?.nom },
    { key: 'genereLe', label: 'Généré le', render: (value: string) => value || '-' },
    { key: 'status', label: 'Statut', render: (value: string) => <StatusBadge status={value === 'Généré' ? 'Actif' as any : 'Inactif' as any} /> },
    { key: 'actions', label: 'Actions', render: (value: any, row: any) => (
      <div className="flex gap-2">
        <button 
          className="text-[#1A4BA8] hover:underline text-sm" 
          style={{ fontFamily: 'Inter, sans-serif' }}
          onClick={() => setSelectedReport(row)}
        >
          Aperçu
        </button>
        <button className="text-[#637799] hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Télécharger
        </button>
      </div>
    )},
  ];

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
      {/* Bannière bleue info */}
      <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-lg p-4 flex items-start gap-3">
        <Info size={20} className="text-[#1A4BA8]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Information
          </p>
          <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            PV générés automatiquement après validation des évaluations
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button variant="secondary">Tout télécharger</Button>
          <Button>Générer PV</Button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable columns={columns} data={mockReports} />

      {/* Aperçu document officiel PV */}
      {selectedReport && (
        <div className="bg-white rounded-xl border border-[#DDEAF7] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Aperçu PV - {selectedReport.reference}
            </h3>
            <Button variant="secondary" onClick={() => setSelectedReport(null)}>
              Fermer
            </Button>
          </div>

          {/* Document stylé */}
          <div className="border-2 border-[#0D1F4E] rounded-lg p-8 bg-white">
            {/* En-tête EMIT */}
            <div className="text-center mb-8 pb-4 border-b border-[#DDEAF7]">
              <h1 className="text-2xl font-bold text-[#0D1F4E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ÉCOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE
              </h1>
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                PROCÈS-VERBAL DE SOUTENANCE DE MASTER
              </p>
            </div>

            {/* Composition jury */}
            <div className="mb-6">
              <h3 className="font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Composition du Jury
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div>
                  <p className="text-[#637799]">Président:</p>
                  <p className="font-semibold text-[#0B1D3A]">Marc Rasamoelina</p>
                  <p className="text-[#637799]">Professeur</p>
                </div>
                <div>
                  <p className="text-[#637799]">Rapporteur:</p>
                  <p className="font-semibold text-[#0B1D3A]">Sophie Rajaonarivelo</p>
                  <p className="text-[#637799]">Maître de Conférences</p>
                </div>
                <div>
                  <p className="text-[#637799]">Examinateur:</p>
                  <p className="font-semibold text-[#0B1D3A]">Jean-Pierre Rakotomamonjy</p>
                  <p className="text-[#637799]">Maître de Conférences</p>
                </div>
              </div>
            </div>

            {/* Notes des 3 membres */}
            <div className="mb-6">
              <h3 className="font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Notes attribuées
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="bg-[#F0F5FB] p-3 rounded-lg">
                  <p className="text-[#637799]">Président:</p>
                  <p className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    16/20
                  </p>
                </div>
                <div className="bg-[#F0F5FB] p-3 rounded-lg">
                  <p className="text-[#637799]">Rapporteur:</p>
                  <p className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    15/20
                  </p>
                </div>
                <div className="bg-[#F0F5FB] p-3 rounded-lg">
                  <p className="text-[#637799]">Examinateur:</p>
                  <p className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    17/20
                  </p>
                </div>
              </div>
            </div>

            {/* Moyenne et mention */}
            <div className="mb-6 bg-[#EAF4FF] p-4 rounded-lg border border-[#2D84E0]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Moyenne finale
                  </p>
                  <p className="text-3xl font-bold text-[#0D1F4E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    16/20
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Mention
                  </p>
                  <p className="text-2xl font-bold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Très Bien
                  </p>
                </div>
              </div>
            </div>

            {/* Avis du jury */}
            <div className="mb-6">
              <h3 className="font-bold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Avis du Jury
              </h3>
              <p className="text-sm text-[#0B1D3A] p-4 bg-[#F0F5FB] rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Le candidat a présenté un travail de qualité supérieure. La maîtrise du sujet est excellente et la présentation orale est claire et structurée. Le jury recommande l'attribution du diplôme avec la mention Très Bien.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-[#DDEAF7]">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-[#637799] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Le Président
                  </p>
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Marc Rasamoelina
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#637799] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Le Rapporteur
                  </p>
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Sophie Rajaonarivelo
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#637799] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    L'Examinateur
                  </p>
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Jean-Pierre Rakotomamonjy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PvPage;
