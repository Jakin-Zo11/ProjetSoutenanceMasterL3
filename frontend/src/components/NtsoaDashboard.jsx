import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  LogOut,
  Search,
  User,
  Plus,
  X,
  Edit,
  Clock,
  MoreVertical,
  Award,
  Filter,
  Download
} from 'lucide-react';

const NtsoaDashboard = () => {
  // État pour la page active
  const [activePage, setActivePage] = useState('dashboard');
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // État pour les statistiques
  const [stats, setStats] = useState({
    totalDepots: 156,
    soutenancesPlanifiees: 42,
    etudiants: 89,
    pvSignes: 38,
    jurysIndisponibles: 3
  });

  // État pour les soutenances
  const [soutenances, setSoutenances] = useState([]);

  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation groups
  const navGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'Gestion académique',
      items: [
        { id: 'etudiants', label: 'Étudiants', icon: Users },
        { id: 'enseignants', label: 'Enseignants', icon: User },
        { id: 'jurys', label: 'Jurys', icon: Users }
      ]
    },
    {
      label: 'Soutenances',
      items: [
        { id: 'soutenances', label: 'Soutenances', icon: Calendar },
        { id: 'salles', label: 'Salles', icon: LayoutDashboard },
        { id: 'creneaux', label: 'Créneaux', icon: Clock }
      ]
    },
    {
      label: 'Résultats',
      items: [
        { id: 'evaluations', label: 'Évaluations', icon: FileText },
        { id: 'resultats', label: 'Résultats', icon: Award }
      ]
    }
  ];

  // Données de démonstration
  useEffect(() => {
    setSoutenances([
      {
        id: 1,
        etudiant: 'Rakoto Jean',
        matricule: 'MAT-2023-001',
        sujet: 'Système de gestion de soutenances',
        date: '2026-09-20',
        heure: '09:00',
        salle: 'Salle A101',
        jury: 'Dr. Randria, Pr. Rasoa',
        statut: 'planifiee'
      },
      {
        id: 2,
        etudiant: 'Randria Marie',
        matricule: 'MAT-2023-002',
        sujet: 'Intelligence artificielle dans l\'éducation',
        date: '2026-09-20',
        heure: '10:30',
        salle: 'Salle A102',
        jury: 'Pr. Andriamanitra, Dr. Ravelonarivo',
        statut: 'en_cours'
      },
      {
        id: 3,
        etudiant: 'Rasoa Paul',
        matricule: 'MAT-2023-003',
        sujet: 'Blockchain pour la gestion académique',
        date: '2026-09-21',
        heure: '14:00',
        salle: 'Salle A103',
        jury: 'Dr. Randria, Pr. Rasoa',
        statut: 'termine'
      },
      {
        id: 4,
        etudiant: 'Andriamanitra Cécile',
        matricule: 'MAT-2023-004',
        sujet: 'Optimisation des bases de données',
        date: '2026-09-21',
        heure: '15:30',
        salle: 'Salle A104',
        jury: 'Pr. Andriamanitra, Dr. Ravelonarivo',
        statut: 'annulee'
      },
      {
        id: 5,
        etudiant: 'Ravelonarivo Marc',
        matricule: 'MAT-2023-005',
        sujet: 'Cloud computing pour les universités',
        date: '2026-09-22',
        heure: '09:00',
        salle: 'Salle A105',
        jury: 'Dr. Randria, Pr. Rasoa',
        statut: 'reprogrammee'
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
      dashboard: { title: 'Dashboard Ntsoa', subtitle: 'Vue d\'ensemble du système de gestion des soutenances' },
      soutenances: { title: 'Gestion des Soutenances', subtitle: 'Planification et suivi des soutenances de mémoire' },
      etudiants: { title: 'Gestion des Étudiants', subtitle: 'Administration des étudiants inscrits' },
      enseignants: { title: 'Gestion des Enseignants', subtitle: 'Administration du corps enseignant' },
      jurys: { title: 'Gestion des Jurys', subtitle: 'Administration des membres de jury' },
      resultats: { title: 'Résultats', subtitle: 'Consultation et publication des résultats de soutenance' },
      evaluations: { title: 'Évaluations', subtitle: 'Suivi des évaluations en cours' },
      salles: { title: 'Gestion des Salles', subtitle: 'Administration des espaces de soutenance' },
      creneaux: { title: 'Gestion des Créneaux', subtitle: 'Planification des créneaux horaires' }
    };
    return titles[activePage] || titles.dashboard;
  };

  // Ouvrir la modale
  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Fermer la modale
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // Filtrer les soutenances
  const filteredSoutenances = soutenances.filter(soutenance =>
    soutenance.etudiant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    soutenance.sujet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    soutenance.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#EBF3FA] font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex min-h-screen">
        {/* Sidebar - Bleu Nuit #050840, rounded-3xl */}
        <aside className="w-64 bg-[#050840] flex flex-col fixed h-full z-10 rounded-3xl shadow-xl m-4">
          {/* Section 1: Logo Block */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* Conteneur de logo - Carré blanc w-12 h-12 rounded-2xl p-1.5 */}
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md flex-shrink-0">
                <img 
                  src="/Logo-emit.png" 
                  alt="Logo EMIT" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback gradient si l'image ne charge pas */}
                <div className="w-full h-full bg-gradient-to-br from-[#050840] to-[#95C5F2] rounded-xl flex items-center justify-center hidden">
                  <span className="text-white font-bold text-lg">EM</span>
                </div>
              </div>
              
              {/* Texte à côté du logo */}
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">EMIT</h1>
                <p className="text-sm text-[#95C5F2]">Fianarantsoa</p>
              </div>
            </div>
          </div>

          {/* Section 2: Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="text-xs font-semibold text-[#95C5F2] uppercase tracking-wider mb-3 px-2">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenu(item.id);
                          setActivePage(item.id);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#95C5F2] text-[#050840] shadow-md'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Section 3: Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200">
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-72 p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#050840] mb-2">
                  {getPageTitle().title}
                </h1>
                <p className="text-sm text-slate-600">
                  {getPageTitle().subtitle}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter size={18} />
                  <span>Filtrer</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-all">
                  <Download size={18} />
                  <span>Exporter</span>
                </button>
                <button 
                  onClick={() => openModal('add')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#95C5F2] text-[#050840] rounded-full font-bold hover:bg-[#7DB5EC] transition-all"
                >
                  <Plus size={18} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par étudiant, sujet ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
              />
            </div>
          </header>

          {/* KPI Cards */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#EAF4FF] rounded-2xl flex items-center justify-center">
                    <FileText size={24} className="text-[#050840]" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#050840] mb-1">{stats.totalDepots}</h3>
                <p className="text-sm text-slate-600">Total Dépôts</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#EAF4FF] rounded-2xl flex items-center justify-center">
                    <Calendar size={24} className="text-[#050840]" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +8%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#050840] mb-1">{stats.soutenancesPlanifiees}</h3>
                <p className="text-sm text-slate-600">Soutenances Planifiées</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#EAF4FF] rounded-2xl flex items-center justify-center">
                    <Users size={24} className="text-[#050840]" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +5%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#050840] mb-1">{stats.etudiants}</h3>
                <p className="text-sm text-slate-600">Étudiants Inscrits</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#E1F8F0] rounded-2xl flex items-center justify-center">
                    <Award size={24} className="text-[#065F46]" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    {stats.jurysIndisponibles}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#050840] mb-1">{stats.pvSignes}</h3>
                <p className="text-sm text-slate-600">PVs Signés</p>
              </div>
            </div>
          </section>

          {/* Data Table */}
          <section>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Étudiant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Matricule</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Sujet</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Date & Heure</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Salle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#050840] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSoutenances.map((soutenance) => (
                      <tr key={soutenance.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#95C5F2] to-[#050840] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {soutenance.etudiant.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-[#050840]">{soutenance.etudiant}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-mono">{soutenance.matricule}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700 max-w-xs truncate">{soutenance.sujet}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={14} />
                            <span>{soutenance.date}</span>
                            <Clock size={14} />
                            <span>{soutenance.heure}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{soutenance.salle}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(soutenance.statut)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openModal('edit', soutenance)}
                              className="p-2 text-slate-400 hover:text-[#050840] hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-[#050840] hover:bg-slate-100 rounded-lg transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredSoutenances.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aucune soutenance trouvée</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Modal d'action - Soft UI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#050840]">
                    {modalMode === 'add' ? 'Ajouter une Soutenance' : 'Modifier la Soutenance'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {modalMode === 'add' ? 'Créer une nouvelle soutenance' : 'Modifier les détails de la soutenance'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-[#050840] hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#050840] mb-2">
                    Étudiant
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedItem?.etudiant || ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
                    placeholder="Nom de l'étudiant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050840] mb-2">
                    Matricule
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedItem?.matricule || ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
                    placeholder="MAT-2023-XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050840] mb-2">
                    Sujet du mémoire
                  </label>
                  <textarea
                    defaultValue={selectedItem?.sujet || ''}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all resize-none"
                    placeholder="Sujet du mémoire de soutenance"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#050840] mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      defaultValue={selectedItem?.date || ''}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#050840] mb-2">
                      Heure
                    </label>
                    <input
                      type="time"
                      defaultValue={selectedItem?.heure || ''}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050840] mb-2">
                    Salle
                  </label>
                  <select
                    defaultValue={selectedItem?.salle || ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#95C5F2] focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner une salle</option>
                    <option value="Salle A101">Salle A101</option>
                    <option value="Salle A102">Salle A102</option>
                    <option value="Salle A103">Salle A103</option>
                    <option value="Salle A104">Salle A104</option>
                    <option value="Salle A105">Salle A105</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-[#050840] text-white rounded-full font-bold hover:bg-[#0B0C3C] transition-all"
                >
                  {modalMode === 'add' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NtsoaDashboard;
