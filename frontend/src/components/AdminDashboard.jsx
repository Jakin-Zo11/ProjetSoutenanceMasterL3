import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronDown,
  GraduationCap,
  UserCheck,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  FileCheck,
  Download,
  Upload,
  Filter
} from 'lucide-react';

const AdminDashboard = ({ activeTab, setActiveTab, onLogout }) => {
  // État pour la page active (synchronisé avec activeTab depuis App.tsx)
  const [activePage, setActivePage] = useState(activeTab || 'dashboard');

  // Synchroniser activePage avec activeTab
  useEffect(() => {
    setActivePage(activeTab);
  }, [activeTab]);

  // État pour les statistiques
  const [stats, setStats] = useState({
    totalDepots: 156,
    soutenancesPlanifiees: 42,
    etudiants: 89,
    pvSignes: 38,
    jurysIndisponibles: 3
  });

  // État pour les derniers dépôts
  const [recentDepots, setRecentDepots] = useState([]);

  // État pour les soutenances
  const [soutenances, setSoutenances] = useState([]);

  // État pour les résultats
  const [resultats, setResultats] = useState([]);

  // État pour la modal de reprogrammation
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  // Données de démonstration
  useEffect(() => {
    setRecentDepots([
      {
        id: 1,
        etudiant: 'Rakoto Jean',
        initiales: 'RJ',
        promotion: 'Master 1 - Informatique',
        titre: 'Système de gestion de soutenances en ligne',
        statut: 'en_attente',
        date: '2026-09-10'
      },
      {
        id: 2,
        etudiant: 'Rasoa Marie',
        initiales: 'RM',
        promotion: 'Licence 3 - Gestion',
        titre: 'Impact du digital sur les PME à Fianarantsoa',
        statut: 'valide',
        date: '2026-09-09'
      },
      {
        id: 3,
        etudiant: 'Randria Paul',
        initiales: 'RP',
        promotion: 'Master 2 - Réseaux',
        titre: 'Optimisation des réseaux IoT agricoles',
        statut: 'rejete',
        date: '2026-09-08'
      },
      {
        id: 4,
        etudiant: 'Andriamanitra Cécile',
        initiales: 'AC',
        promotion: 'Licence 3 - Économie',
        titre: 'Analyse de l\'économie informelle à Madagascar',
        statut: 'en_attente',
        date: '2026-09-07'
      }
    ]);

    setSoutenances([
      {
        id: 1,
        reference: 'SOUT-2026-001',
        etudiant: 'Rakoto Jean',
        sujet: 'Système de gestion de soutenances en ligne',
        date: '2026-09-15',
        heure: '09:00',
        salle: 'Salle A101',
        jury: 'Dr. Randria, Pr. Rasoa, M. Andriamanitra',
        statut: 'planifiee'
      },
      {
        id: 2,
        reference: 'SOUT-2026-002',
        etudiant: 'Rasoa Marie',
        sujet: 'Impact du digital sur les PME',
        date: '2026-09-16',
        heure: '14:00',
        salle: 'Amphi B',
        jury: 'Pr. Randria, Dr. Andriamanitra, Mme. Rasoarimanana',
        statut: 'en_cours'
      },
      {
        id: 3,
        reference: 'SOUT-2026-003',
        etudiant: 'Randria Paul',
        sujet: 'Optimisation des réseaux IoT',
        date: '2026-09-17',
        heure: '10:00',
        salle: 'Salle C205',
        jury: 'Dr. Rasoa, Pr. Andriamanitra, M. Ravelonarivo',
        statut: 'annulee'
      },
      {
        id: 4,
        reference: 'SOUT-2026-004',
        etudiant: 'Andriamanitra Cécile',
        sujet: 'Analyse économie informelle',
        date: '2026-09-18',
        heure: '11:00',
        salle: 'Salle D102',
        jury: 'Pr. Rasoarimanana, Dr. Ravelonarivo, Mme. Randria',
        statut: 'reprogrammee'
      }
    ]);

    setResultats([
      {
        id: 1,
        etudiant: 'Rakoto Jean',
        matricule: 'MAT-2023-001',
        moyenne: 16.5,
        mention: 'Très Bien',
        avis: 'Excellent travail, sujet maîtrisé',
        date: '2026-09-10',
        statut: 'publie'
      },
      {
        id: 2,
        etudiant: 'Rasoa Marie',
        matricule: 'MAT-2023-002',
        moyenne: 14.0,
        mention: 'Bien',
        avis: 'Bon travail, quelques améliorations possibles',
        date: '2026-09-11',
        statut: 'termine'
      },
      {
        id: 3,
        etudiant: 'Randria Paul',
        matricule: 'MAT-2023-003',
        moyenne: 12.5,
        mention: 'Assez Bien',
        avis: 'Travail satisfaisant',
        date: '2026-09-12',
        statut: 'en_attente'
      }
    ]);
  }, []);

  // Fonction pour obtenir le badge de statut (palette EMIT stricte)
  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_attente: {
        bg: 'bg-[#EAF4FF]',
        text: 'text-[#050840]',
        label: 'En attente'
      },
      planifiee: {
        bg: 'bg-[#EAF4FF]',
        text: 'text-[#050840]',
        label: 'Planifiée'
      },
      en_cours: {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        label: 'En cours'
      },
      termine: {
        bg: 'bg-[#E1F8F0]',
        text: 'text-[#065F46]',
        label: 'Terminé'
      },
      publie: {
        bg: 'bg-[#E1F8F0]',
        text: 'text-[#065F46]',
        label: 'Publié'
      },
      annulee: {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#1E3A8A]',
        label: 'Annulée'
      },
      reprogrammee: {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        label: 'Reprogrammée'
      },
      valide: {
        bg: 'bg-[#E1F8F0]',
        text: 'text-[#065F46]',
        label: 'Validé'
      },
      rejete: {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#1E3A8A]',
        label: 'Rejeté'
      }
    };

    const config = statusConfig[statut] || statusConfig.en_attente;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Fonction pour obtenir le titre de page
  const getPageTitle = () => {
    const titles = {
      dashboard: { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble du système de gestion des soutenances' },
      soutenances: { title: 'Soutenances', subtitle: 'Planification et suivi des soutenances de mémoire' },
      etudiants: { title: 'Étudiants', subtitle: 'Administration des étudiants inscrits' },
      enseignants: { title: 'Enseignants', subtitle: 'Administration du corps enseignant' },
      jurys: { title: 'Jurys', subtitle: 'Administration des membres de jury' },
      resultats: { title: 'Résultats', subtitle: 'Consultation et publication des résultats de soutenance' },
      evaluations: { title: 'Évaluations', subtitle: 'Suivi des évaluations en cours' },
      pv: { title: 'PV / Rapports', subtitle: 'Gestion des procès-verbaux et rapports' },
      salles: { title: 'Salles', subtitle: 'Administration des espaces de soutenance' },
      creneaux: { title: 'Créneaux', subtitle: 'Planification des créneaux horaires' },
      calendrier: { title: 'Calendrier', subtitle: 'Vue calendrier des soutenances' },
      affectation: { title: 'Affectation jury', subtitle: 'Affectation des jurys aux soutenances' }
    };
    return titles[activePage] || titles.dashboard;
  };

  return (
    <div className="w-full">
      {/* Main Content */}
      <main>
            {activePage === 'dashboard' && (
              <div>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Total Étudiants</p>
                    <p className="text-4xl font-bold text-[#050840]">89</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Total Enseignants</p>
                    <p className="text-4xl font-bold text-[#95C5F2]">24</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Jurys Constitués</p>
                    <p className="text-4xl font-bold text-[#050840]">18</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Soutenances Planifiées</p>
                    <p className="text-4xl font-bold text-[#050840]">{soutenances.filter(s => s.statut === 'planifiee').length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Évaluations Terminées</p>
                    <p className="text-4xl font-bold text-[#95C5F2]">{soutenances.filter(s => s.statut === 'termine').length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">En Cours</p>
                    <p className="text-4xl font-bold text-[#050840]">{soutenances.filter(s => s.statut === 'en_cours').length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">En Attente</p>
                    <p className="text-4xl font-bold text-[#95C5F2]">{soutenances.filter(s => s.statut === 'en_attente').length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Annulées/Reportées</p>
                    <p className="text-4xl font-bold text-[#050840]">{soutenances.filter(s => s.statut === 'annulee' || s.statut === 'reprogrammee').length}</p>
                  </div>
                </div>

                {/* Prochaines Soutenances */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
                  <h2 className="text-lg font-semibold text-[#050840] mb-4">
                    Prochaines Soutenances
                  </h2>
                  <div className="space-y-4">
                    {soutenances.slice(0, 3).map((soutenance) => (
                      <div key={soutenance.id} className="flex items-center gap-4 p-4 bg-[#EBF3FA] rounded-2xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#050840]">{soutenance.etudiant}</p>
                          <p className="text-xs text-slate-600">{soutenance.sujet}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#050840]">{soutenance.date}</p>
                          <p className="text-xs text-slate-600">{soutenance.heure} • {soutenance.salle}</p>
                        </div>
                        {getStatusBadge(soutenance.statut)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progression des Évaluations */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
                  <h2 className="text-lg font-semibold text-[#050840] mb-4">
                    Progression des Évaluations
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-600">Évaluations Terminées</span>
                        <span className="text-sm font-medium text-[#050840]">{resultats.length}/42</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#95C5F2] h-2 rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-600">En Cours</span>
                        <span className="text-sm font-medium text-[#050840]">{soutenances.filter(s => s.statut === 'en_cours').length}/42</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#050840] h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-600">En Attente</span>
                        <span className="text-sm font-medium text-[#050840]">{soutenances.filter(s => s.statut === 'en_attente').length}/42</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-slate-400 h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activité Récente */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#050840] mb-4">
                    Activité Récente
                  </h2>
                  <div className="space-y-4">
                    {recentDepots.slice(0, 3).map((depot) => (
                      <div key={depot.id} className="flex items-center gap-4 p-4 bg-[#EBF3FA] rounded-2xl">
                        <div className="w-12 h-12 bg-[#95C5F2] rounded-xl flex items-center justify-center">
                          <span className="text-[#050840] font-semibold text-sm">{depot.initiales}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#050840]">{depot.etudiant}</p>
                          <p className="text-xs text text-slate-600">{depot.promotion}</p>
                        </div>
                        {getStatusBadge(depot.statut)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePage === 'soutenances' && (
              <div>
                {/* Soutenances Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-[#050840]">
                      Liste des Soutenances
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Référence</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Sujet</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date+Heure</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Salle</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Jury</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {soutenances.map((soutenance) => (
                          <tr key={soutenance.id} className="hover:bg-[#EBF3FA] transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-[#050840]">{soutenance.reference}</td>
                            <td className="px-6 py-4 text-sm text-[#050840]">{soutenance.etudiant}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{soutenance.sujet}</td>
                            <td className="px-6 py-4 text-sm text-[#050840]">{soutenance.date} {soutenance.heure}</td>
                            <td className="px-6 py-4 text-sm text-[#050840]">{soutenance.salle}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{soutenance.jury}</td>
                            <td className="px-6 py-4">{getStatusBadge(soutenance.statut)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {(soutenance.statut === 'planifiee' || soutenance.statut === 'en_cours') && (
                                  <>
                                    <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Reprogrammer</button>
                                    <button className="text-xs text-red-500 hover:text-red-700 font-medium">Annuler</button>
                                  </>
                                )}
                                {soutenance.statut === 'annulee' && (
                                  <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Replanifier</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-[#EFF6FF] border border-red-200 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-sm font-semibold text-red-600">Soutenances Annulées</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {soutenances.filter(s => s.statut === 'annulee').length}
                    </p>
                  </div>
                  <div className="bg-[#FEF3C7] border border-amber-200 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-semibold text-amber-600">Soutenances Reprogrammées</h3>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {soutenances.filter(s => s.statut === 'reprogrammee').length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'resultats' && (
              <div>
                {/* Results Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#050840]">
                      Résultats des Soutenances
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#050840] text-white rounded-xl text-sm font-medium hover:bg-[#050840]/90 transition-colors">
                      <Upload size={16} />
                      Publier tout
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Matricule</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Moyenne /20</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Mention</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Avis du jury</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {resultats.map((resultat) => (
                          <tr key={resultat.id} className="hover:bg-[#EBF3FA] transition-colors">
                            <td className="px-6 py-4 text-sm text-[#050840]">{resultat.etudiant}</td>
                            <td className="px-6 py-4 text-sm font-mono text-[#050840]">{resultat.matricule}</td>
                            <td className="px-6 py-4 text-2xl font-bold text-[#050840]">
                              {resultat.moyenne}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#050840]">{resultat.mention}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{resultat.avis}</td>
                            <td className="px-6 py-4 text-sm text-[#050840]">{resultat.date}</td>
                            <td className="px-6 py-4">{getStatusBadge(resultat.statut)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#EAF4FF] text-[#050840] rounded-xl text-xs font-medium hover:bg-[#95C5F2] transition-colors">
                                  <Download size={14} />
                                  PDF
                                </button>
                                {resultat.statut !== 'publie' && (
                                  <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Publier</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'etudiants' && (
              <div>
                {/* Toolbar */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          className="pl-10 pr-4 py-2 bg-[#EBF3FA] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#95C5F2] w-64"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 bg-[#EAF4FF] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#95C5F2] transition-colors">
                        <Download size={16} />
                        Exporter
                      </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#95C5F2] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#7DB5EC] transition-colors">
                      <Plus size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Nom & Email</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Matricule</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Sujet de mémoire</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Directeur</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date soutenance</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#050840]">Rakoto Jean</p>
                            <p className="text-xs text-slate-600">rakoto.jean@emit.mg</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">MAT-2023-001</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">Système de gestion de soutenances</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Dr. Randria</td>
                          <td className="px-6 py-4 text-sm text-slate-600">2026-09-15</td>
                          <td className="px-6 py-4">{getStatusBadge('en_attente')}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Modifier</button>
                              <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Voir</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'enseignants' && (
              <div>
                {/* Toolbar */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EAF4FF] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#95C5F2] transition-colors">
                      <Download size={16} />
                      Exporter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#95C5F2] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#7DB5EC] transition-colors">
                      <Plus size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Spécialité</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Département</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Nombre de jurys</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Disponibilité</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4 text-sm text-[#050840]">Dr. Randria Jean</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Maître de Conférences</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Informatique</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Informatique</td>
                          <td className="px-6 py-4 text-sm text-slate-600">5</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">Disponible</span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Modifier</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'jurys' && (
              <div>
                {/* Warning Banner */}
                <div className="bg-[#FEF3C7] border border-amber-200 rounded-3xl p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                      3 membres obligatoires par jury — Président, Rapporteur, Examinateur
                    </p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Référence jury</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Président</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Rapporteur</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Examinateur</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">JURY-2026-001</td>
                          <td className="px-6 py-4 text-sm text-[#050840]">Rakoto Jean</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Dr. Randria</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Pr. Rasoa</td>
                          <td className="px-6 py-4 text-sm text-slate-600">M. Andriamanitra</td>
                          <td className="px-6 py-4 text-sm text-slate-600">2026-09-15</td>
                          <td className="px-6 py-4">{getStatusBadge('valide')}</td>
                          <td className="px-6 py-4">
                            <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Modifier</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'creneaux' && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Période de soutenance</p>
                    <p className="text-2xl font-bold text-[#050840]">15 Sept - 30 Oct 2026</p>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Total créneaux</p>
                    <p className="text-2xl font-bold text-[#95C5F2]">42</p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Référence</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Heure début</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Heure fin</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Jours</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actif</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">CRN-001</td>
                          <td className="px-6 py-4 text-sm text-slate-600">08:00</td>
                          <td className="px-6 py-4 text-sm text-slate-600">10:00</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Lun, Mer, Ven</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Matin</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">Oui</span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Modifier</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'calendrier' && (
              <div>
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium hover:bg-[#EBF3FA] transition-colors">
                    <ChevronRight size={16} className="rotate-180" />
                    Semaine précédente
                  </button>
                  <button className="px-4 py-2 bg-[#95C5F2] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#7DB5EC] transition-colors">
                    Aujourd'hui
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium hover:bg-[#EBF3FA] transition-colors">
                    Semaine suivante
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Weekly Calendar View */}
                <div className="grid grid-cols-6 gap-4">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, index) => (
                    <div key={day} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                      <div className="text-center mb-4">
                        <p className="text-sm font-medium text-[#050840]">{day}</p>
                        <p className="text-xs text-slate-600">15/09/2026</p>
                      </div>
                      <div className="space-y-2">
                        {soutenances.slice(0, 2).map((soutenance) => (
                          <div key={soutenance.id} className="bg-[#EBF3FA] rounded-xl p-3">
                            <p className="text-xs font-medium text-[#050840]">{soutenance.heure}</p>
                            <p className="text-xs text-slate-600 truncate">{soutenance.etudiant}</p>
                            <p className="text-xs text-slate-500">{soutenance.salle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePage === 'affectation' && (
              <div>
                {/* 3-Step Stepper */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step === 1 ? 'bg-[#95C5F2] text-[#050840]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {step}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${step === 1 ? 'text-[#050840]' : 'text-slate-500'}`}>
                            {step === 1 ? 'Sélectionner une soutenance' : step === 2 ? 'Choisir les membres' : 'Confirmation'}
                          </p>
                        </div>
                        {step < 3 && <div className="w-16 h-1 mx-4 bg-slate-200 rounded-full"></div>}
                      </div>
                    ))}
                  </div>

                  {/* Step 1 Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#050840] mb-4">Soutenances sans jury</h3>
                    <div className="space-y-3">
                      {soutenances.slice(0, 3).map((soutenance) => (
                        <div key={soutenance.id} className="flex items-center justify-between p-4 bg-[#EBF3FA] rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-[#050840]">{soutenance.etudiant}</p>
                            <p className="text-xs text-slate-600">{soutenance.sujet}</p>
                          </div>
                          <button className="px-4 py-2 bg-[#95C5F2] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#7DB5EC] transition-colors">
                            Sélectionner
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'evaluations' && (
              <div>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Soumises</p>
                    <p className="text-4xl font-bold text-[#050840]">42</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">En attente</p>
                    <p className="text-4xl font-bold text-[#95C5F2]">12</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">En cours</p>
                    <p className="text-4xl font-bold text-[#050840]">8</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-200">
                    <p className="text-slate-500 text-sm mb-1">Conflits</p>
                    <p className="text-4xl font-bold text-red-600">2</p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Jury</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Note Président</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Note Rapporteur</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Note Examinateur</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Moyenne</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4 text-sm text-[#050840]">Rakoto Jean</td>
                          <td className="px-6 py-4 text-sm text-slate-600">JURY-001</td>
                          <td className="px-6 py-4 text-sm text-slate-600">16</td>
                          <td className="px-6 py-4 text-sm text-slate-600">17</td>
                          <td className="px-6 py-4 text-sm text-slate-600">16</td>
                          <td className="px-6 py-4 text-2xl font-bold text-[#050840]">16.33</td>
                          <td className="px-6 py-4">{getStatusBadge('en_cours')}</td>
                          <td className="px-6 py-4">
                            <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Voir</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'pv' && (
              <div>
                {/* Info Banner */}
                <div className="bg-[#EAF4FF] border border-[#95C5F2] rounded-3xl p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#050840]" />
                    <p className="text-sm font-medium text-[#050840]">
                      PV générés automatiquement après validation des notes
                    </p>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EAF4FF] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#95C5F2] transition-colors">
                      <Download size={16} />
                      Tout télécharger
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#95C5F2] text-[#050840] rounded-xl text-sm font-medium hover:bg-[#7DB5EC] transition-colors">
                      <Plus size={16} />
                      Générer PV
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#EBF3FA]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Référence PV</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date & Horaire</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Salle</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Généré le</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-[#EBF3FA] transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">PV-2026-001</td>
                          <td className="px-6 py-4 text-sm text-[#050840]">Rakoto Jean</td>
                          <td className="px-6 py-4 text-sm text-slate-600">15/09/2026 09:00</td>
                          <td className="px-6 py-4 text-sm text-slate-600">Salle A101</td>
                          <td className="px-6 py-4 text-sm text-slate-600">15/09/2026 11:30</td>
                          <td className="px-6 py-4">{getStatusBadge('publie')}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Voir</button>
                              <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">PDF</button>
                              <button className="text-xs text-[#95C5F2] hover:text-[#050840] font-medium">Publier</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PV Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="border-b border-slate-200 pb-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center border border-slate-200">
                          <span className="text-[#050840] font-bold text-xl">EM</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#050840]">EMIT</h2>
                          <p className="text-sm text-slate-600">École de Management et d'Innovation Technologique</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">PV N°: PV-2026-001</p>
                        <p className="text-sm text-slate-600">Date: 15/09/2026</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#050840] mb-2">Composition du Jury</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Président:</p>
                          <p className="text-[#050840] font-medium">Dr. Randria</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Rapporteur:</p>
                          <p className="text-[#050840] font-medium">Pr. Rasoa</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Examinateur:</p>
                          <p className="text-[#050840] font-medium">M. Andriamanitra</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#050840] mb-2">Notes et Résultats</h3>
                      <div className="bg-[#EBF3FA] rounded-xl p-4">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Note Président:</p>
                            <p className="text-[#050840] font-bold text-xl">16/20</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Note Rapporteur:</p>
                            <p className="text-[#050840] font-bold text-xl">17/20</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Note Examinateur:</p>
                            <p className="text-[#050840] font-bold text-xl">16/20</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Moyenne:</p>
                            <p className="text-[#95C5F2] font-bold text-xl">16.33/20</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#050840] mb-2">Mention</h3>
                      <p className="text-2xl font-bold text-[#050840]">Très Bien</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#050840] mb-2">Avis du Jury</h3>
                      <p className="text-sm text-slate-600">
                        Le candidat a présenté un travail de qualité supérieure. La maîtrise du sujet est excellente et les réponses aux questions du jury ont été pertinentes. Le jury recommande l'attribution de la mention Très Bien.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

      {/* 4-Step Modal for Rescheduling */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DDEAF7]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Reprogrammer la Soutenance
                </h2>
                <button
                  onClick={() => { setModalOpen(false); setModalStep(1); }}
                  className="p-2 text-[#637799] hover:text-[#0B1D3A] hover:bg-[#F0F5FB] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      modalStep >= step ? 'bg-[#2D84E0] text-white' : 'bg-[#F0F5FB] text-[#637799]'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 ${
                        modalStep > step ? 'bg-[#2D84E0]' : 'bg-[#F0F5FB]'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0B1D3A] mb-4">Vérification de la disponibilité du jury</h3>
                  <div className="space-y-4">
                    <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2D84E0]" />
                        <div>
                          <p className="font-medium text-[#0B1D3A]">Dr. Randria</p>
                          <p className="text-sm text-[#637799]">Disponible le 15/09/2026 à 09:00</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2D84E0]" />
                        <div>
                          <p className="font-medium text-[#0B1D3A]">Pr. Rasoa</p>
                          <p className="text-sm text-[#637799]">Disponible le 15/09/2026 à 09:00</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#EFF6FF] border border-[#1E3A8A] rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-[#1E3A8A]" />
                        <div>
                          <p className="font-medium text-[#0B1D3A]">M. Andriamanitra</p>
                          <p className="text-sm text-[#637799]">Indisponible - Congé du 10/09 au 20/09/2026</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setModalStep(2)}
                      className="px-6 py-2 bg-[#1A4BA8] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F4E] transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0B1D3A] mb-4">Choisir l'action</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setModalStep(3)}
                      className="w-full p-4 bg-[#EAF4FF] border border-[#2D84E0] rounded-lg text-left hover:bg-[#2D84E0] hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">Reprogrammer la soutenance</p>
                          <p className="text-sm opacity-80">Choisir une nouvelle date, heure et salle</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setModalStep(4)}
                      className="w-full p-4 bg-[#EFF6FF] border border-[#1E3A8A] rounded-lg text-left hover:bg-[#1E3A8A] hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">Annuler la soutenance</p>
                          <p className="text-sm opacity-80">Annuler définitivement cette soutenance</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-6 py-2 bg-[#F0F5FB] text-[#637799] rounded-lg text-sm font-medium hover:bg-[#EAF4FF] transition-colors"
                    >
                      Précédent
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0B1D3A] mb-4">Nouveau planning</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0B1D3A] mb-1">Nouvelle date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0B1D3A] mb-1">Nouvelle heure</label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0B1D3A] mb-1">Nouvelle salle</label>
                      <select className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D84E0]">
                        <option>Salle A101</option>
                        <option>Salle B205</option>
                        <option>Amphithéâtre C1</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0B1D3A] mb-1">Remplacement du jury (optionnel)</label>
                      <select className="w-full px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D84E0]">
                        <option>Conserver le même jury</option>
                        <option>Dr. Ravelonarivo</option>
                        <option>Pr. Rasoarimanana</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setModalStep(2)}
                      className="px-6 py-2 bg-[#F0F5FB] text-[#637799] rounded-lg text-sm font-medium hover:bg-[#EAF4FF] transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setModalStep(4)}
                      className="px-6 py-2 bg-[#1A4BA8] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F4E] transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 4 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0B1D3A] mb-4">Confirmation de notification</h3>
                  <div className="space-y-4">
                    <div className="bg-[#EAF4FF] border border-[#2D84E0] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#2D84E0]" />
                        <p className="font-medium text-[#0B1D3A]">Récapitulatif des changements</p>
                      </div>
                      <ul className="text-sm text-[#637799] space-y-1 ml-8">
                        <li>• Date: 15/09/2026 → 20/09/2026</li>
                        <li>• Heure: 09:00 → 14:00</li>
                        <li>• Salle: Salle A101 → Amphithéâtre C1</li>
                        <li>• Jury: Remplacement de M. Andriamanitra par Dr. Ravelonarivo</li>
                      </ul>
                    </div>
                    <div className="bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-[#2D84E0]" />
                        <p className="font-medium text-[#0B1D3A]">Notifications à envoyer</p>
                      </div>
                      <ul className="text-sm text-[#637799] space-y-1 ml-8">
                        <li>• Étudiant: Rakoto Jean (email)</li>
                        <li>• Jury: Dr. Randria, Pr. Rasoa, Dr. Ravelonarivo (email)</li>
                        <li>• Scolarité: admin@emit.mg (email)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setModalStep(3)}
                      className="px-6 py-2 bg-[#F0F5FB] text-[#637799] rounded-lg text-sm font-medium hover:bg-[#EAF4FF] transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => { setModalOpen(false); setModalStep(1); }}
                      className="px-6 py-2 bg-[#1A4BA8] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F4E] transition-colors"
                    >
                      Confirmer et envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
