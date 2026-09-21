import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-[#F0F5FB] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-[#DC2626]' : 'border-[#DDEAF7]'
        }`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      {error && (
        <p className="mt-1 text-xs text-[#DC2626]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
