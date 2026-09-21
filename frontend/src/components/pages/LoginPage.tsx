import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export type UserRole = 'admin' | 'student' | 'jury';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  const features = [
    'Planification et affectation automatisée des jurys',
    'Suivi des évaluations en temps réel',
    'Génération automatique des PV de soutenance',
    'Application mobile étudiants et jury'
  ];

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Colonne gauche - Navy fixe w-96 */}
      <div className="hidden lg:flex w-96 bg-[#0D1F4E] flex-col justify-between p-10">
        <div className="flex-1 flex flex-col justify-center">
          {/* Logo EMIT */}
          <div className="flex items-center space-x-3 mb-8">
            <img src="/logo.png" alt="Logo EMIT" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-[11px] text-white/90 leading-tight">
                École de Management et d'Innovation Technologique
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold leading-tight mb-3" style={{ fontSize: '28px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Système de Gestion des Soutenances de Master
            </h2>
            <p className="text-white/55 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Plateforme unifiée de planification, d'évaluation et de publication des résultats des soutenances de mémoire de fin d'études.
            </p>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#2D84E0] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" />
                </div>
                <p className="text-white/55 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6">
          <p className="text-white/40 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2025 EMIT – École de Management et d'Innovation Technologique
          </p>
        </div>
      </div>

      {/* Colonne droite - Blanc centré */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[380px]">
          {/* En-tête du formulaire */}
          <div className="mb-8 text-center">
            <img
              src="/logo.png"
              alt="Logo EMIT"
              className="mx-auto mb-4 h-20 w-20 object-contain md:h-24 md:w-24"
            />
            <h1 className="mb-2 text-2xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Connexion — Web Admin
            </h1>
            <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              École de Management et d'Innovation Technologique
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Université de Fianarantsoa
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Adresse e-mail */}
            <div>
              <label className="block text-sm font-bold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@emit.dz"
                className="w-full px-4 py-[14px] bg-[#F0F5FB] border border-[#DDEAF7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0] focus:border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-[#0B1D3A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-[14px] bg-[#F0F5FB] border border-[#DDEAF7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D84E0] focus:border-transparent pr-12"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#637799] hover:text-[#0B1D3A]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DDEAF7] text-[#2D84E0] focus:ring-[#2D84E0]"
                />
                <span className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Se souvenir de moi
                </span>
              </label>
              <a href="#" className="text-sm text-[#2D84E0] hover:text-[#1A4BA8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1A4BA8] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Pied de formulaire */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Accès réservé aux utilisateurs habilités — EMIT 2024/2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
