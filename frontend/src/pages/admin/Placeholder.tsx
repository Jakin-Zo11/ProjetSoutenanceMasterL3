import React from 'react';

interface PlaceholderProps {
  page: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ page }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-2xl font-bold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {page}
        </p>
        <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sélectionnez une page
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
