import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

const SlotsPage: React.FC = () => {
  const { session, defenseSlots } = useAdminData();
  const slotRows = defenseSlots.map((slot) => ({
    ...slot,
    juryNames: slot.jury.map((member) => member.teacherName).join(', ') || 'Non affecté',
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="flex items-center justify-between rounded-xl border border-[#DDEAF7] bg-white p-5">
          <div>
            <p className="text-sm text-[#637799]">Période fixe</p>
            <p className="mt-1 font-bold text-[#0A192F]">{session.startDate} – {session.endDate}</p>
          </div>
          <CalendarDays className="text-[#3B82F6]" aria-hidden="true" />
        </article>
        <article className="flex items-center justify-between rounded-xl border border-[#DDEAF7] bg-white p-5">
          <div>
            <p className="text-sm text-[#637799]">Créneaux enregistrés</p>
            <p className="mt-1 text-2xl font-bold text-[#0A192F]">{defenseSlots.length}</p>
          </div>
          <Clock className="text-[#3B82F6]" aria-hidden="true" />
        </article>
      </section>

      <div className="overflow-hidden rounded-xl border border-[#DDEAF7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F5FB]">
              <tr>
                {['Étudiant', 'Matricule', 'Date', 'Début', 'Fin', 'Salle', 'Jury', 'Statut'].map((label) => (
                  <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#334155]">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEAF7]">
              {slotRows.map((slot) => (
                <tr key={slot.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-4 text-sm font-medium text-[#0A192F]">{slot.studentName}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.studentMatricule}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.date}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.timeStart}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.timeEnd}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.room}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{slot.juryNames}</td>
                  <td className="px-5 py-4 text-sm text-[#1E3A8A]">{slot.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {slotRows.length === 0 && <p className="p-8 text-center text-sm text-[#637799]">Aucun créneau de démonstration disponible.</p>}
        </div>
      </div>
      <p className="text-sm text-[#637799]">Les dates, heures et salles des créneaux sont fixes. Toute affectation ou tout remplacement de jury se gère dans la page de planification.</p>
    </div>
  );
};

export default SlotsPage;
