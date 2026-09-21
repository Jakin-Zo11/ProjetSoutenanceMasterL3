import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dates = ['09 Sep', '10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep'];

  const defenses = [
    { id: 1, etudiant: 'Rakoto Jean', heure: '09:00', salle: 'A101', jour: 0, color: 'bg-[#2D84E0]' },
    { id: 2, etudiant: 'Rasoa Marie', heure: '14:00', salle: 'Amphi B', jour: 1, color: 'bg-[#1A4BA8]' },
    { id: 3, etudiant: 'Randria Paul', heure: '10:00', salle: 'C205', jour: 2, color: 'bg-[#2D84E0]' },
    { id: 4, etudiant: 'Andriamanitra Cécile', heure: '11:00', salle: 'D102', jour: 3, color: 'bg-[#1A4BA8]' },
    { id: 5, etudiant: 'Rasoarimanana Luc', heure: '15:00', salle: 'A101', jour: 4, color: 'bg-[#2D84E0]' }
  ];

  const getDefensesForDay = (dayIndex: number) => {
    return defenses.filter(d => d.jour === dayIndex);
  };

  return (
    <div className="space-y-6">
      {/* Navigation semaine */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F5FB] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#E1E8F0] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            <ChevronLeft size={18} />
            Semaine précédente
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-[#2D84E0]" />
            <span className="text-lg font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              9 - 14 Septembre 2024
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Aujourd'hui
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F5FB] text-[#0B1D3A] rounded-lg text-sm font-medium hover:bg-[#E1E8F0] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Semaine suivante
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Vue hebdomadaire */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 divide-x divide-[#DDEAF7]">
          {days.map((day, index) => (
            <div key={day} className="min-h-[500px]">
              {/* En-tête jour */}
              <div className="p-4 border-b border-[#DDEAF7] bg-[#F0F5FB]">
                <p className="text-sm font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {day}
                </p>
                <p className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {dates[index]}
                </p>
              </div>

              {/* Blocs soutenances */}
              <div className="p-2 space-y-2">
                {getDefensesForDay(index).map((defense) => (
                  <div
                    key={defense.id}
                    className={`${defense.color} rounded-lg p-3 text-white`}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {defense.heure}
                    </p>
                    <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {defense.etudiant}
                    </p>
                    <p className="text-xs opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {defense.salle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
