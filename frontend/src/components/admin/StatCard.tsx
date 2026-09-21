import React from 'react';
import type { StatCard as StatCardType } from '../../types';

interface StatCardProps {
  data: StatCardType;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#DDEAF7]">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${data.color ?? '#1A4BA8'}20` }}>
          {data.icon ? <data.icon size={22} color={data.color ?? '#1A4BA8'} aria-hidden="true" /> : null}
        </div>
        {(data.trend ?? data.change) && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EAF4FF] text-[#1A4BA8]">
            {data.trend ?? data.change}
          </span>
        )}
      </div>
      <h3 className="mb-1 font-mono text-3xl font-bold text-[#0B1D3A]">
        {data.value}
      </h3>
      <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {data.title}
      </p>
    </div>
  );
};

export default StatCard;
