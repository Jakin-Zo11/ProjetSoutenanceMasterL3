import React from 'react';
import { Clock, Calendar, Edit, Plus, CheckCircle, XCircle } from 'lucide-react';

const SlotsPage: React.FC = () => {
  const getActiveBadge = (actif: boolean) => {
    if (actif) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E1F8F0] text-[#065F46]">
          <CheckCircle size={12} />
          Actif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#B91C1C]">
          <XCircle size={12} />
          Inactif
        </span>
      );
    }
  };

  const slots = [
    { id: 1, reference: 'CREN-001', debut: '08:00', fin: '10:00', jours: 'Lun, Mer, Ven', type: 'Matin', actif: true },
    { id: 2, reference: 'CREN-002', debut: '10:30', fin: '12:30', jours: 'Lun, Mer, Ven', type: 'Matin', actif: true },
    { id: 3, reference: 'CREN-003', debut: '14:00', fin: '16:00', jours: 'Mar, Jeu, Sam', type: 'Après-midi', actif: true },
    { id: 4, reference: 'CREN-004', debut: '16:30', fin: '18:30', jours: 'Mar, Jeu, Sam', type: 'Après-midi', actif: false }
  ];

  return (
    <div className="space-y-6">
      {/* Cards résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Période active
              </p>
              <p className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Septembre 2024
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D1F4E] to-[#1A4BA8] rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#DDEAF7] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#637799] text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Total créneaux
              </p>
              <p className="text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {slots.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#2D84E0] to-[#1A4BA8] rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-[#DDEAF7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F5FB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Heure début
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Heure fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Jours
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#0B1D3A] uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEAF7]">
              {slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-[#F0F5FB] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {slot.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {slot.debut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#0B1D3A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {slot.fin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {slot.jours}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {slot.type}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getActiveBadge(slot.actif)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-[#2D84E0] hover:text-[#1A4BA8] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bouton Ajouter */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#2D84E0] text-white rounded-lg font-medium hover:bg-[#1A4BA8] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <Plus size={20} />
          Ajouter un créneau
        </button>
      </div>
    </div>
  );
};

export default SlotsPage;
