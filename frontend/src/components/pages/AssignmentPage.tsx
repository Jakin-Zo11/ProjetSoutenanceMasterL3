import React, { useState } from 'react';
import { Users, CheckCircle, AlertTriangle, ChevronRight, Send } from 'lucide-react';

const AssignmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const defensesWithoutJury = [
    { id: 1, etudiant: 'Rakoto Jean', sujet: 'Système de gestion de soutenances', date: '2024-09-15' },
    { id: 2, etudiant: 'Rasoa Marie', sujet: 'Impact du digital sur les PME', date: '2024-09-16' }
  ];

  const teachers = [
    { id: 1, nom: 'Dr. Randria Jean', disponibilite: 'disponible' },
    { id: 2, nom: 'Pr. Rasoa Marie', disponibilite: 'disponible' },
    { id: 3, nom: 'Dr. Andriamanitra Paul', disponibilite: 'indisponible' },
    { id: 4, nom: 'Dr. Ravelonarivo Cécile', disponibilite: 'disponible' }
  ];

  const [selectedPresident, setSelectedPresident] = useState('');
  const [selectedRapporteur, setSelectedRapporteur] = useState('');
  const [selectedExaminateur, setSelectedExaminateur] = useState('');

  const getAvailabilityBadge = (disponibilite: string) => {
    if (disponibilite === 'disponible') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">
          <CheckCircle size={12} />
          Disponible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#B91C1C]">
          Indisponible
        </span>
      );
    }
  };

  const steps = [
    { id: 1, label: 'Sélection soutenance' },
    { id: 2, label: 'Affectation jury' },
    { id: 3, label: 'Confirmation' }
  ];

  return (
    <div className="space-y-6">
      {/* Règle rappelée */}
      <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-[#2D84E0]" />
          <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Règle : Exactement 3 membres par jury (Président, Rapporteur, Examinateur). Pas de doublon sur le même créneau.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id
                      ? 'bg-[#2D84E0] text-white'
                      : 'bg-[#F0F5FB] text-[#637799]'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {currentStep > step.id ? <CheckCircle size={20} /> : step.id}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-[#0B1D3A]' : 'text-[#637799]'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight size={20} className="text-[#637799] ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Étape 1 : Sélection soutenance */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#DDEAF7]">
            <h2 className="text-lg font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Soutenances sans jury affecté
            </h2>
          </div>
          <div className="divide-y divide-[#DDEAF7]">
            {defensesWithoutJury.map((defense) => (
              <div key={defense.id} className="p-4 hover:bg-[#F0F5FB] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {defense.etudiant}
                    </p>
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {defense.sujet}
                    </p>
                    <p className="text-xs text-[#637799]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {defense.date}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Affecter jury
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 : Affectation jury */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Card Président */}
          <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            <h3 className="text-md font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Président de Jury
            </h3>
            <select
              value={selectedPresident}
              onChange={(e) => setSelectedPresident(e.target.value)}
              className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Sélectionner un enseignant...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Card Rapporteur */}
          <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            <h3 className="text-md font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Rapporteur
            </h3>
            <select
              value={selectedRapporteur}
              onChange={(e) => setSelectedRapporteur(e.target.value)}
              className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Sélectionner un enseignant...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Card Examinateur */}
          <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            <h3 className="text-md font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Examinateur
            </h3>
            <select
              value={selectedExaminateur}
              onChange={(e) => setSelectedExaminateur(e.target.value)}
              className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Sélectionner un enseignant...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Vérification disponibilité */}
          <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            <h3 className="text-md font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Vérification de disponibilité
            </h3>
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-[#F0F5FB] rounded-lg">
                  <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {teacher.nom}
                  </span>
                  {getAvailabilityBadge(teacher.disponibilite)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-[#F0F5FB] text-[#0B1D3A] rounded-lg font-medium hover:bg-[#E1E8F0] transition-colors"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Retour
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-[#2D84E0] text-white rounded-lg font-medium hover:bg-[#1A4BA8] transition-colors"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Confirmation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            <h2 className="text-lg font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Récapitulatif de l'affectation
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F0F5FB] rounded-lg">
                <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Président
                </span>
                <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedPresident ? teachers.find(t => t.id === parseInt(selectedPresident))?.nom : 'Non sélectionné'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F0F5FB] rounded-lg">
                <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Rapporteur
                </span>
                <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedRapporteur ? teachers.find(t => t.id === parseInt(selectedRapporteur))?.nom : 'Non sélectionné'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F0F5FB] rounded-lg">
                <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Examinateur
                </span>
                <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedExaminateur ? teachers.find(t => t.id === parseInt(selectedExaminateur))?.nom : 'Non sélectionné'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Send size={20} className="text-[#2D84E0]" />
              <p className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Une notification sera envoyée aux membres du jury sélectionnés.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-[#F0F5FB] text-[#0B1D3A] rounded-lg font-medium hover:bg-[#E1E8F0] transition-colors"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Retour
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#2D84E0] text-white rounded-lg font-medium hover:bg-[#1A4BA8] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <Send size={20} />
              Confirmer et Notifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
