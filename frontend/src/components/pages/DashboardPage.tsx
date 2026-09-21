import React from 'react';
import { Users, GraduationCap, Scale, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-[#EAF1FB]', text: 'text-[#3D6EA8]', label: 'En attente' },
      planifiee: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'Planifiée' },
      en_cours: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', label: 'En cours' },
      termine: { bg: 'bg-[#1A4BA8]', text: 'text-white', label: 'Terminé' },
      publie: { bg: 'bg-[#1D4ED8]', text: 'text-white', label: 'Publié' },
      annulee: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Annulée' },
      reprogrammee: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', label: 'Reprogrammée' }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const kpiStats = [
    { label: 'Total Étudiants', value: 89, icon: Users, color: 'from-[#0D1F4E] to-[#1A4BA8]' },
    { label: 'Enseignants', value: 24, icon: GraduationCap, color: 'from-[#2D84E0] to-[#1A4BA8]' },
    { label: 'Jurys Constitués', value: 18, icon: Scale, color: 'from-[#0D1F4E] to-[#1A4BA8]' },
    { label: 'Soutenances Planifiées', value: 42, icon: Calendar, color: 'from-[#2D84E0] to-[#1A4BA8]' }
  ];

  const evaluationStats = [
    { label: 'Évaluations Terminées', value: 22, icon: CheckCircle, color: 'from-[#1A4BA8] to-[#2D84E0]' },
    { label: 'En Cours', value: 12, icon: Clock, color: 'from-[#0D1F4E] to-[#1A4BA8]' },
    { label: 'En Attente', value: 8, icon: AlertTriangle, color: 'from-[#2D84E0] to-[#1A4BA8]' },
    { label: 'Annulées/Reportées', value: 3, icon: XCircle, color: 'from-[#DC2626] to-[#B91C1C]' }
  ];

  const upcomingDefenses = [
    { id: 1, etudiant: 'Rakoto Jean', sujet: 'Système de gestion de soutenances', date: '2024-09-15', heure: '09:00', salle: 'Salle A101', statut: 'planifiee' },
    { id: 2, etudiant: 'Rasoa Marie', sujet: 'Impact du digital sur les PME', date: '2024-09-16', heure: '14:00', salle: 'Amphi B', statut: 'en_cours' },
    { id: 3, etudiant: 'Randria Paul', sujet: 'Optimisation des réseaux IoT', date: '2024-09-17', heure: '10:00', salle: 'Salle C205', statut: 'planifiee' }
  ];

  const recentActivity = [
    { id: 1, action: 'Dépôt mémoire', etudiant: 'Rakoto Jean', date: '2024-09-10 14:30', type: 'depot' },
    { id: 2, action: 'Validation jury', etudiant: 'Rasoa Marie', date: '2024-09-10 11:15', type: 'validation' },
    { id: 3, action: 'Planification', etudiant: 'Randria Paul', date: '2024-09-09 16:45', type: 'planning' }
  ];

  return (
    <div className="space-y-6">
      {/* Grille KPI Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grille Stats Évaluations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {evaluationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-5 border border-[#DDEAF7] shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prochaines Soutenances */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Prochaines Soutenances
        </h2>
        <div className="space-y-3">
          {upcomingDefenses.map((defense) => (
            <div key={defense.id} className="flex items-center justify-between p-4 bg-[#F0F5FB] rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {defense.etudiant}
                </p>
                <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {defense.sujet}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {defense.date}
                </p>
                <p className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {defense.heure} • {defense.salle}
                </p>
              </div>
              {getStatusBadge(defense.statut)}
            </div>
          ))}
        </div>
      </div>

      {/* Progression Évaluations */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Progression des Évaluations
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Évaluations Terminées
              </span>
              <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                22/42
              </span>
            </div>
            <div className="w-full bg-[#F0F5FB] rounded-full h-2">
              <div className="bg-[#2D84E0] h-2 rounded-full" style={{ width: '52%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                En Cours
              </span>
              <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                12/42
              </span>
            </div>
            <div className="w-full bg-[#F0F5FB] rounded-full h-2">
              <div className="bg-[#0D1F4E] h-2 rounded-full" style={{ width: '29%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                En Attente
              </span>
              <span className="text-sm font-medium text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                8/42
              </span>
            </div>
            <div className="w-full bg-[#F0F5FB] rounded-full h-2">
              <div className="bg-[#637799] h-2 rounded-full" style={{ width: '19%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activité Récente */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0B1D3A] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Activité Récente
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-[#F0F5FB] rounded-lg">
              <div className="w-10 h-10 bg-[#2D84E0] rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {activity.action} - {activity.etudiant}
                </p>
                <p className="text-xs text-[#637799]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {activity.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
