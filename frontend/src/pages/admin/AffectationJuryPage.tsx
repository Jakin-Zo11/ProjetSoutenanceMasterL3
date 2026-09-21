import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { DataTable, Button, StatusBadge } from '../../components/admin';
import { mockDefenses, mockTeachers } from '../../mocks';

const AffectationJuryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedDefense, setSelectedDefense] = useState<number | null>(null);
  const [selectedPresident, setSelectedPresident] = useState<number | null>(null);
  const [selectedRapporteur, setSelectedRapporteur] = useState<number | null>(null);
  const [selectedExaminateur, setSelectedExaminateur] = useState<number | null>(null);

  useEffect(() => {
    // TODO: connecter à l'API /api/assignment une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const defensesWithoutJury = mockDefenses.filter(d => !d.juryId);

  const columns = [
    { key: 'etudiant', label: 'Étudiant', render: (value: any) => `${value?.nom} ${value?.prenom}` },
    { key: 'sujet', label: 'Sujet', render: (value: string, row: any) => row.student?.sujetThese?.substring(0, 40) + '...' },
    { key: 'date', label: 'Date' },
    { key: 'heure', label: 'Heure' },
    { key: 'salle', label: 'Salle', render: (value: any) => value?.nom },
    { key: 'actions', label: 'Actions', render: (value: any, row: any) => (
      <Button onClick={() => { setSelectedDefense(row.id); setStep(2); }}>
        Affecter jury
      </Button>
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
      {/* Règle rappelée */}
      <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-lg p-4 flex items-start gap-3">
        <Info size={20} className="text-[#1A4BA8]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-[#1A4BA8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Règle d'affectation
          </p>
          <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Exactement 3 membres par jury (Président, Rapporteur, Examinateur). Pas de doublon sur le même créneau.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] p-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s ? 'bg-[#1A4BA8] text-white' : 'bg-[#F0F5FB] text-[#637799]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {s}
              </div>
              <span
                className={`text-sm ${step >= s ? 'text-[#0B1D3A]' : 'text-[#637799]'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {s === 1 ? 'Soutenances sans jury' : s === 2 ? 'Sélection des membres' : 'Confirmation'}
              </span>
            </div>
          ))}
        </div>

        {/* Étape 1 - Tableau soutenances sans jury */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sélectionnez une soutenance
            </h3>
            <DataTable columns={columns} data={defensesWithoutJury} />
          </div>
        )}

        {/* Étape 2 - 3 cards avec select */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sélectionnez les membres du jury
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Président */}
              <div className="bg-[#F0F5FB] rounded-lg p-4 border border-[#DDEAF7]">
                <h4 className="font-semibold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Président
                </h4>
                <select
                  value={selectedPresident || ''}
                  onChange={(e) => setSelectedPresident(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <StatusBadge status="Actif" />
                </div>
              </div>

              {/* Rapporteur */}
              <div className="bg-[#F0F5FB] rounded-lg p-4 border border-[#DDEAF7]">
                <h4 className="font-semibold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Rapporteur
                </h4>
                <select
                  value={selectedRapporteur || ''}
                  onChange={(e) => setSelectedRapporteur(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <StatusBadge status="Actif" />
                </div>
              </div>

              {/* Examinateur */}
              <div className="bg-[#F0F5FB] rounded-lg p-4 border border-[#DDEAF7]">
                <h4 className="font-semibold text-[#0B1D3A] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Examinateur
                </h4>
                <select
                  value={selectedExaminateur || ''}
                  onChange={(e) => setSelectedExaminateur(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <StatusBadge status="Actif" />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedPresident || !selectedRapporteur || !selectedExaminateur}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3 - Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Confirmer l'affectation
            </h3>
            <div className="bg-[#F0F5FB] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-[#0B1D3A]">Soutenance:</span>{' '}
                {defensesWithoutJury.find((d) => d.id === selectedDefense)?.student?.nom}{' '}
                {defensesWithoutJury.find((d) => d.id === selectedDefense)?.student?.prenom}
              </p>
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-[#0B1D3A]">Président:</span>{' '}
                {mockTeachers.find((t) => t.id === selectedPresident)?.nom}{' '}
                {mockTeachers.find((t) => t.id === selectedPresident)?.prenom}
              </p>
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-[#0B1D3A]">Rapporteur:</span>{' '}
                {mockTeachers.find((t) => t.id === selectedRapporteur)?.nom}{' '}
                {mockTeachers.find((t) => t.id === selectedRapporteur)?.prenom}
              </p>
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-[#0B1D3A]">Examinateur:</span>{' '}
                {mockTeachers.find((t) => t.id === selectedExaminateur)?.nom}{' '}
                {mockTeachers.find((t) => t.id === selectedExaminateur)?.prenom}
              </p>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button onClick={() => console.log('Notifier')}>
                Confirmer et Notifier
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffectationJuryPage;
