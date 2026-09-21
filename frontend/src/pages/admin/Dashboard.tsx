import React from 'react';
import { AlertCircle, Building2, CalendarDays, CheckCircle2, Circle, Clock, Hourglass, XCircle } from 'lucide-react';
import { StatCard } from '../../components/admin';
import {
  mockDashboardActivities,
  mockEvaluationProgress,
  mockDashboardStats,
  mockUpcomingDefenses,
} from '../../mocks/dashboard';
const statusClasses: Record<string, string> = {
  'En attente': 'bg-[#EAF1FB] text-[#3D6EA8]',
  Planifiée: 'bg-[#DBEAFE] text-[#1D4ED8]',
  'En cours': 'bg-[#DBEAFE] text-[#1D4ED8]',
  Terminé: 'bg-[#1A4BA8] text-white',
  Publié: 'bg-[#1A4BA8] text-white',
  Annulée: 'bg-[#FEE2E2] text-[#B91C1C]',
  Reprogrammée: 'bg-[#E0F2FE] text-[#0369A1]',
};

const Dashboard: React.FC = () => {
  const evaluationStats = [
    { title: 'Évaluations terminées', value: 86, icon: CheckCircle2, iconClass: 'text-[#1A4BA8]', cardClass: 'border-[#DDEAF7] bg-white', valueClass: 'text-[#0B1D3A]' },
    { title: 'En cours', value: 24, icon: Clock, iconClass: 'text-[#2D84E0]', cardClass: 'border-[#DDEAF7] bg-white', valueClass: 'text-[#0B1D3A]' },
    { title: 'En attente', value: 16, icon: Hourglass, iconClass: 'text-[#1A4BA8]', cardClass: 'border-[#DDEAF7] bg-white', valueClass: 'text-[#0B1D3A]' },
    { title: 'Annulées / Reportées', value: 2, icon: XCircle, iconClass: 'text-red-600', cardClass: 'border-red-200 bg-red-50', valueClass: 'text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-[#2D84E0]">Vue d’ensemble</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0B1D3A]">Bonjour, administrateur</h2>
          <p className="mt-1 text-sm text-[#637799]">
            Suivez l’avancement des soutenances de Master et les évaluations à traiter.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[#DDEAF7] bg-white px-3 py-2 text-xs font-semibold text-[#637799]">
          Session 2025–2026
        </span>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockDashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            data={{
              title: stat.label,
              value: stat.value,
              icon: stat.icon,
              color: stat.tone === 'error' ? '#DC2626' : stat.tone === 'sky' ? '#2D84E0' : '#1A4BA8',
              change: stat.helper,
            }}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {evaluationStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.title} className={`rounded-xl border p-6 shadow-sm ${stat.cardClass}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white/70 ${stat.iconClass}`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[#637799]">Session</span>
              </div>
              <p className={`font-mono text-3xl font-bold ${stat.valueClass}`}>{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-[#0B1D3A]">{stat.title}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-[#DDEAF7] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0B1D3A]">Prochaines soutenances</h3>
              <p className="mt-1 text-xs text-[#637799]">Les prochains créneaux publiés</p>
            </div>
            <CalendarDays size={20} className="text-[#2D84E0]" aria-hidden="true" />
          </div>
          <div className="divide-y divide-[#DDEAF7]">
            {mockUpcomingDefenses.map((defense) => (
              <div key={defense.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0B1D3A]">{defense.studentName}</p>
                  <p className="mt-1 truncate text-sm text-[#637799]">{defense.subject}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#637799]">
                    <span className="flex items-center gap-1"><Clock size={13} />{defense.date} · {defense.time}</span>
                    <span className="flex items-center gap-1"><Building2 size={13} />{defense.room}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {defense.priority === 'urgent' && (
                    <span className="flex w-fit items-center gap-1 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <AlertCircle size={13} aria-hidden="true" />
                      Urgent
                    </span>
                  )}
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[defense.status]}`}>
                    {defense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[#DDEAF7] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0B1D3A]">Progression des évaluations</h3>
              <p className="mt-1 text-xs text-[#637799]">État global de la session</p>
            </div>
            <Clock size={20} className="text-[#2D84E0]" aria-hidden="true" />
          </div>
          <div className="space-y-5">
            {mockEvaluationProgress.map((progress) => {
              const percentage = Math.round((progress.completed / progress.total) * 100);
              return (
                <div key={progress.label}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="text-[#637799]">{progress.label}</span>
                    <span className="font-mono font-semibold text-[#0B1D3A]">{percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F0F5FB]">
                    <div className="h-2 rounded-full bg-[#1A4BA8]" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-[#DDEAF7] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#0B1D3A]">Activité récente</h3>
            <p className="mt-1 text-xs text-[#637799]">Les dernières actions enregistrées</p>
          </div>
          <CheckCircle2 size={20} className="text-[#2D84E0]" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mockDashboardActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3 rounded-lg bg-[#F0F5FB] p-4">
              <Circle size={8} fill="currentColor" className="mt-1 flex-shrink-0 text-[#2D84E0]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row">
                  <p className="text-sm font-semibold text-[#0B1D3A]">{activity.action}</p>
                  <span className="text-xs text-[#637799]">{activity.time}</span>
                </div>
                <p className="mt-1 text-xs text-[#637799]">{activity.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
