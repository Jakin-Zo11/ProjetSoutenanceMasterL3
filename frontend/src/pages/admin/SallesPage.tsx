import React, { useEffect, useState } from 'react';
import { StatusBadge, Button } from '../../components/admin';
import { mockRooms } from '../../mocks';

const SallesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: connecter à l'API /api/rooms une fois le backend prêt
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

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
      {/* Grille de cards - 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl border border-[#DDEAF7] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {room.nom}
                </h3>
                <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {room.batiment}
                </p>
              </div>
              <StatusBadge status={room.disponible ? 'Actif' as any : 'Inactif' as any} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#637799]">👥</span>
                <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Capacité: {room.capacite} personnes
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#637799]">🔧</span>
                <div className="flex-1">
                  <p className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Équipements:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.equipements.map((equip, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-[#F0F5FB] text-[#637799] rounded"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {equip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">
                Modifier
              </Button>
              <Button className="flex-1">
                Planning
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SallesPage;
