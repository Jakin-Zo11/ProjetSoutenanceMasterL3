import React, { useEffect, useState } from 'react';
import { Button } from '../../components/admin';

const Calendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    // TODO: connecter à l'API /api/calendar une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

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
            Calendrier
          </h1>
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Vue hebdomadaire des soutenances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}>
            ← Semaine précédente
          </Button>
          <Button onClick={() => setCurrentWeek(new Date())}>
            Aujourd'hui
          </Button>
          <Button variant="secondary" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}>
            Semaine suivante →
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DDEAF7] overflow-hidden">
        <div className="grid grid-cols-6 border-b border-[#DDEAF7]">
          <div className="p-4 bg-[#F0F5FB]"></div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-4 bg-[#F0F5FB] text-center">
              <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {days[index]}
              </p>
              <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-6 border-b border-[#DDEAF7]">
            <div className="p-4 bg-[#F0F5FB] text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {hour}
            </div>
            {weekDates.map((_, dayIndex) => (
              <div key={dayIndex} className="p-4 min-h-[60px] hover:bg-[#F0F5FB] transition-colors">
                {/* Placeholder for defenses */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
