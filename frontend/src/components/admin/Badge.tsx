import React from 'react';
import { Status } from '../../types';

interface BadgeProps {
  status: Status;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeStyles = (status: Status) => {
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

export default Badge;
