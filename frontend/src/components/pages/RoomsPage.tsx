import React from 'react';
import { Monitor, Wifi, Wind, Laptop, MapPin, Users, Edit, Calendar, CheckCircle, XCircle, Plus, Search } from 'lucide-react';

const RoomsPage: React.FC = () => {
  const equipmentOptions = [
    { id: 'projecteur', label: 'Projecteur', icon: Monitor },
    { id: 'wifi', label: 'Wifi HD', icon: Wifi },
    { id: 'climatisation', label: 'Climatisation', icon: Wind },
    { id: 'pc', label: 'PC', icon: Laptop }
  ];

  const getEquipmentIcon = (equipmentId: string) => {
    const option = equipmentOptions.find(opt => opt.id === equipmentId);
    return option ? option.icon : null;
  };

  const getStatusBadge = (statut: string) => {
    if (statut === 'disponible') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">
          <CheckCircle size={12} />
          Disponible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#B91C1C]">
          <XCircle size={12} />
          Indisponible
        </span>
      );
    }
  };

  const rooms = [
    { id: 1, nom: 'Salle A101', batiment: 'Bâtiment A', capacite: 30, equipements: ['projecteur', 'wifi', 'climatisation'], statut: 'disponible' },
    { id: 2, nom: 'Salle B205', batiment: 'Bâtiment B', capacite: 50, equipements: ['projecteur', 'wifi', 'climatisation', 'pc'], statut: 'disponible' },
    { id: 3, nom: 'Amphithéâtre C1', batiment: 'Bâtiment C', capacite: 100, equipements: ['projecteur', 'wifi', 'climatisation'], statut: 'indisponible' },
    { id: 4, nom: 'Salle D102', batiment: 'Bâtiment D', capacite: 25, equipements: ['wifi', 'pc'], statut: 'disponible' }
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#DDEAF7] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#637799]" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              className="pl-10 pr-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2D84E0]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D84E0] text-white rounded-lg text-sm font-medium hover:bg-[#1A4BA8] transition-colors">
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Grille de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0B1D3A] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {room.nom}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <MapPin size={14} />
                  <span>{room.batiment}</span>
                </div>
              </div>
              {room.statut === 'disponible' ? (
                <CheckCircle size={20} className="text-[#065F46]" />
              ) : (
                <XCircle size={20} className="text-[#B91C1C]" />
              )}
            </div>

            {/* Capacité */}
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#2D84E0]" />
              <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {room.capacite} places
              </span>
            </div>

            {/* Équipements */}
            <div className="mb-4">
              <p className="text-xs font-medium text-[#637799] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Équipements :
              </p>
              <div className="flex flex-wrap gap-2">
                {room.equipements.length > 0 ? (
                  room.equipements.map((eqId) => {
                    const Icon = getEquipmentIcon(eqId);
                    const option = equipmentOptions.find(opt => opt.id === eqId);
                    return Icon ? (
                      <div
                        key={eqId}
                        className="flex items-center gap-1 bg-[#EAF4FF] text-[#0B1D3A] px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        <Icon size={12} />
                        <span>{option?.label}</span>
                      </div>
                    ) : null;
                  })
                ) : (
                  <span className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Aucun équipement
                  </span>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="mb-4">
              {getStatusBadge(room.statut)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-[#DDEAF7]">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-[#0B1D3A] bg-[#EAF4FF] rounded-lg hover:bg-[#DBEAFE] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Edit size={16} className="inline mr-1" />
                Modifier
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-[#0B1D3A] bg-[#EAF4FF] rounded-lg hover:bg-[#DBEAFE] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Calendar size={16} className="inline mr-1" />
                Planning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;
