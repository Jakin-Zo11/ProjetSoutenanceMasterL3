import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#1A4BA8] text-white hover:opacity-90';
      case 'secondary':
        return 'bg-white text-[#1A4BA8] border border-[#1A4BA8] hover:bg-[#F0F5FB]';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-[#1A4BA8] text-white hover:opacity-90';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-sm';
      case 'lg':
        return 'px-8 py-4 text-base';
      default:
        return 'px-6 py-3 text-sm';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${getVariantStyles()} ${getSizeStyles()} rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {children}
    </button>
  );
};

export default Button;
