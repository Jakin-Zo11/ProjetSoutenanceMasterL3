import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  MapPin,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { UserRole } from './LoginPage';

interface RoleDashboardProps {
  role: Exclude<UserRole, 'admin'>;
  onLogout: () => void;
}

const RoleDashboard: React.FC<RoleDashboardProps> = ({ role, onLogout }) => {
  const isStudent = role === 'student';

  return (
    <div className="min-h-screen bg-[#F0F5FB] text-[#0B1D3A]">
      <header className="flex items-center justify-between border-b border-[#DDEAF7] bg-white px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A4BA8] text-sm font-bold text-white">EMIT</div>
          <div>
            <p className="font-bold">Soutenances de Master</p>
            <p className="text-xs text-[#637799]">Espace {isStudent ? 'étudiant' : 'membre du jury'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="rounded-lg border border-[#DDEAF7] px-3 py-2 text-sm font-semibold text-[#637799] hover:bg-[#F0F5FB]">
          Se déconnecter
        </button>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-5 md:p-10">
        <section>
          <p className="mb-2 text-sm font-semibold text-[#2D84E0]">Bonjour {isStudent ? 'Aina' : 'Pr. Rakoto'}</p>
          <h1 className="text-2xl font-bold md:text-3xl">{isStudent ? 'Mon parcours de soutenance' : 'Mes soutenances affectées'}</h1>
          <p className="mt-2 text-sm text-[#637799]">
            {isStudent ? 'Retrouvez vos informations, votre convocation et votre résultat au même endroit.' : 'Consultez les dossiers à évaluer et suivez vos validations.'}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(isStudent
            ? [
                { label: 'Prochaine soutenance', value: '18 juin 2026', icon: CalendarDays },
                { label: 'Salle', value: 'Salle B-204', icon: MapPin },
                { label: 'Statut du dossier', value: 'Complet', icon: CheckCircle2 },
              ]
            : [
                { label: 'Soutenances affectées', value: '08', icon: Users },
                { label: 'Évaluations validées', value: '05', icon: CheckCircle2 },
                { label: 'Évaluations restantes', value: '03', icon: Clock3 },
              ]).map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-[#DDEAF7] bg-white p-5 shadow-sm">
                <Icon className="mb-4 text-[#2D84E0]" size={22} />
                <p className="text-sm text-[#637799]">{stat.label}</p>
                <p className="mt-1 text-xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#DDEAF7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{isStudent ? 'Ma soutenance' : 'Prochaines soutenances'}</h2>
              <span className="rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-semibold text-[#1A4BA8]">2026</span>
            </div>
            {isStudent ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#F0F5FB] p-4">
                  <p className="font-semibold">Conception d’une plateforme de suivi académique</p>
                  <p className="mt-1 text-sm text-[#637799]">Master Informatique — Parcours Génie logiciel</p>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div><p className="text-[#637799]">Date</p><p className="font-semibold">18 juin 2026</p></div>
                  <div><p className="text-[#637799]">Horaire</p><p className="font-semibold">09:00 – 10:00</p></div>
                  <div><p className="text-[#637799]">Salle</p><p className="font-semibold">B-204</p></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-[#1A4BA8] px-4 py-2 text-sm font-semibold text-white"><FileText size={16} /> Voir ma convocation</button>
                  <button className="flex items-center gap-2 rounded-lg border border-[#DDEAF7] px-4 py-2 text-sm font-semibold text-[#1A4BA8]"><Download size={16} /> Télécharger</button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#DDEAF7]">
                {['Aina Rakoto — 09:00', 'Mamy Randria — 10:30', 'Soa Andrianina — 14:00'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div><p className="font-semibold">{item}</p><p className="text-sm text-[#637799]">Salle B-204 · Génie logiciel</p></div>
                    <button className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-sm font-semibold text-[#1A4BA8]">Évaluer</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#DDEAF7] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold">{isStudent ? 'Mon avancement' : 'Rappels'}</h2>
            <div className="space-y-4">
              {(isStudent
                ? [
                    { icon: GraduationCap, label: 'Dossier académique', status: 'Validé' },
                    { icon: FileText, label: 'Mémoire déposé', status: 'Validé' },
                    { icon: CalendarDays, label: 'Convocation', status: 'Disponible' },
                    { icon: MessageSquare, label: 'Résultat final', status: 'Après soutenance' },
                  ]
                : [
                    { icon: Clock3, label: 'Évaluations à terminer', status: '3 restantes' },
                    { icon: FileText, label: 'Critères d’évaluation', status: 'À consulter' },
                    { icon: MessageSquare, label: 'Commentaires', status: 'À compléter' },
                  ]).map((item) => {
                const Icon = item.icon;
                return <div key={item.label} className="flex items-center gap-3"><div className="rounded-lg bg-[#EAF4FF] p-2 text-[#2D84E0]"><Icon size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.label}</p><p className="text-xs text-[#637799]">{item.status}</p></div></div>;
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RoleDashboard;
