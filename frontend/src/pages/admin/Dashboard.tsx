import React from 'react';
import { CalendarDays, FileCheck2, FileText, GraduationCap, Users } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

const Dashboard: React.FC = () => {
  const { session, students, defenseSlots, pvs } = useAdminData();

  const metrics = [
    { label: 'Étudiants inscrits', value: students.length, icon: GraduationCap },
    { label: 'PDF reçus', value: students.filter((student) => Boolean(student.pdfUrl)).length, icon: FileCheck2 },
    { label: 'Jurys affectés', value: defenseSlots.filter((slot) => slot.jury.length > 0).length, icon: Users },
    { label: 'PV générés', value: pvs.length, icon: FileText },
  ];

  const upcomingDefenses = [...defenseSlots]
    .sort((a, b) => `${a.date} ${a.timeStart}`.localeCompare(`${b.date} ${b.timeStart}`))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#BFDBFE] bg-white p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-[#1E3A8A]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[#1E3A8A]">Session officielle de soutenances</p>
            <h2 className="text-xl font-bold text-[#0A192F]">{session.startDate} – {session.endDate}</h2>
            <p className="mt-1 text-sm text-[#475569]">Les dates de session sont fixes et ne peuvent pas être modifiées.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs de session">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-[#DDEAF7] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#475569]">{label}</p>
              <Icon size={20} className="text-[#3B82F6]" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold text-[#0A192F]">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[#DDEAF7] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-[#0A192F]">Prochains passages planifiés</h2>
        <div className="divide-y divide-[#E2E8F0]">
          {upcomingDefenses.length > 0 ? (
            upcomingDefenses.map((defense) => (
              <div key={defense.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-[#0A192F]">{defense.studentName}</p>
                  <p className="text-sm text-[#475569]">{defense.themeTitle}</p>
                </div>
                <p className="text-sm text-[#1E3A8A]">
                  {defense.date} · {defense.timeStart} – {defense.timeEnd} · {defense.room}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-[#475569]">Aucun créneau n’est encore planifié.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
