import React, { useEffect, useState } from 'react';
import { Button, Input } from '../../components/admin';
import { mockDefenses, mockJurys, mockTeachers } from '../../mocks';

const Assignment: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDefense, setSelectedDefense] = useState<number | null>(null);
  const [selectedPresident, setSelectedPresident] = useState<number | null>(null);
  const [selectedRapporteur, setSelectedRapporteur] = useState<number | null>(null);
  const [selectedExaminateur, setSelectedExaminateur] = useState<number | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // TODO: connecter à l'API /api/assignment une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Affectation Jury
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Affectation des jurys aux soutenances
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
                {s === 1 ? 'Soutenance' : s === 2 ? 'Jury' : 'Confirmation'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Defense */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sélectionnez une soutenance
            </h3>
            <div className="space-y-2">
              {mockDefenses.map((defense) => (
                <div
                  key={defense.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDefense === defense.id
                      ? 'border-[#1A4BA8] bg-[#EAF4FF]'
                      : 'border-[#DDEAF7] hover:bg-[#F0F5FB]'
                  }`}
                  onClick={() => setSelectedDefense(defense.id)}
                >
                  <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {defense.student?.nom} {defense.student?.prenom}
                  </p>
                  <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {defense.date} à {defense.heure}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedDefense}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Jury */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sélectionnez les membres du jury
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Président
                </label>
                <select
                  value={selectedPresident || ''}
                  onChange={(e) => setSelectedPresident(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F0F5FB] border border-[#DDEAF7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Rapporteur
                </label>
                <select
                  value={selectedRapporteur || ''}
                  onChange={(e) => setSelectedRapporteur(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F0F5FB] border border-[#DDEAF7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Examinateur
                </label>
                <select
                  value={selectedExaminateur || ''}
                  onChange={(e) => setSelectedExaminateur(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F0F5FB] border border-[#DDEAF7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Sélectionner...</option>
                  {mockTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nom} {teacher.prenom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedPresident || !selectedRapporteur || !selectedExaminateur}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Confirmer l'affectation
            </h3>
            <div className="bg-[#F0F5FB] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-[#0B1D3A]">Soutenance:</span>{' '}
                {mockDefenses.find((d) => d.id === selectedDefense)?.student?.nom}{' '}
                {mockDefenses.find((d) => d.id === selectedDefense)?.student?.prenom}
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
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button>Confirmer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignment;
