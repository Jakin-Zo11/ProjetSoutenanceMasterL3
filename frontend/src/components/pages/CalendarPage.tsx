import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

const CalendarPage: React.FC = () => {
  const { session, defenseSlots } = useAdminData();
  const start = new Date(`${session.startDate}T00:00:00Z`);
  const end = new Date(`${session.endDate}T00:00:00Z`);
  const dates: Date[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(new Date(cursor));
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  const dateKey = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-3 rounded-xl border border-[#BFDBFE] bg-white p-5">
        <CalendarDays className="text-[#1E3A8A]" aria-hidden="true" />
        <div>
          <h2 className="font-bold text-[#0A192F]">Calendrier des soutenances</h2>
          <p className="text-sm text-[#475569]">{session.startDate} – {session.endDate} · période officielle immuable</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dates.map((date) => {
          const daySlots = defenseSlots
            .filter((slot) => slot.date === dateKey(date))
            .sort((left, right) => left.timeStart.localeCompare(right.timeStart));
          return (
            <section key={dateKey(date)} className="min-h-64 rounded-xl border border-[#DDEAF7] bg-white">
              <header className="border-b border-[#DDEAF7] bg-[#F0F5FB] px-4 py-3">
                <h3 className="font-semibold capitalize text-[#0A192F]">{formatDate(date)}</h3>
              </header>
              <div className="space-y-2 p-3">
                {daySlots.length ? daySlots.map((slot) => (
                  <article key={slot.id} className="rounded-lg border-l-4 border-[#3B82F6] bg-[#EFF6FF] p-3">
                    <p className="text-xs font-semibold text-[#1E3A8A]">{slot.timeStart}–{slot.timeEnd} · {slot.room}</p>
                    <p className="mt-1 text-sm font-semibold text-[#0A192F]">{slot.studentName}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#475569]">{slot.themeTitle}</p>
                    <p className="mt-2 text-xs text-[#1E3A8A]">{slot.jury.length ? slot.jury.map((member) => member.teacherName).join(' · ') : 'Jury à affecter'}</p>
                  </article>
                )) : (
                  <p className="py-6 text-center text-sm text-[#94A3B8]">Aucune soutenance planifiée</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;
