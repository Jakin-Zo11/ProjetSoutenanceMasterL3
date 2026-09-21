import React from 'react';
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'En attente':
        return 'bg-[#EAF1FB] text-[#3D6EA8]';
      case 'Planifiée':
      case 'En cours':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'Terminé':
      case 'Publié':
        return 'bg-[#1A4BA8] text-white';
      case 'Annulée':
        return 'bg-[#FEE2E2] text-[#B91C1C]';
      case 'Reprogrammée':
        return 'bg-[#E0F2FE] text-[#0369A1]';
      case 'Actif':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'Inactif':
        return 'bg-[#FEE2E2] text-[#B91C1C]';
      case 'Soumise':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'En attente':
        return 'bg-[#EAF1FB] text-[#3D6EA8]';
      case 'En cours':
        return 'bg-[#E0F2FE] text-[#0369A1]';
      case 'Conflit':
        return 'bg-[#FEE2E2] text-[#B91C1C]';
      case 'Non publié':
        return 'bg-[#EAF1FB] text-[#3D6EA8]';
      case 'Généré':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'Non généré':
        return 'bg-[#EAF1FB] text-[#3D6EA8]';
      default:
        return 'bg-[#EAF1FB] text-[#3D6EA8]';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(status)}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
