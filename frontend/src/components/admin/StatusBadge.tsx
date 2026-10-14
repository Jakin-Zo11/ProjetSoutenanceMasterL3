import React from 'react';
interface StatusBadgeProps {
  status: string;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'En attente':
      case 'À affecter':
      case 'Non généré':
      case 'Non publié':
        return 'bg-[#FFF7ED] text-[#9A3412]';
      case 'Planifiée':
      case 'En cours':
      case 'Soumise':
      case 'Généré':
      case 'Reprogrammée':
        return 'bg-[#E0F2FE] text-[#075985]';
      case 'Terminé':
      case 'Publié':
      case 'Actif':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'Annulée':
      case 'Conflit':
        return 'bg-[#FFF1F2] text-[#BE123C]';
      case 'Inactif':
        return 'bg-[#F1F5F9] text-[#475569]';
      default:
        return 'bg-[#E0F2FE] text-[#075985]';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(status)}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {label || status}
    </span>
  );
};

export default StatusBadge;
