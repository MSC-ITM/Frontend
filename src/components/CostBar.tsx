import React from 'react';

interface CostBarProps {
  level: 'bajo' | 'medio' | 'alto';
  label?: string;
}

const CostBar: React.FC<CostBarProps> = ({ level, label = 'Nivel de Costo' }) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'bajo':
        return {
          percentage: 33,
          color: 'from-emerald-500 to-teal-500',
          bgColor: 'bg-emerald-500/20',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          text: 'Bajo',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'medio':
        return {
          percentage: 66,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/30',
          text: 'Medio',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'alto':
        return {
          percentage: 100,
          color: 'from-rose-500 to-red-500',
          bgColor: 'bg-rose-500/20',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          text: 'Alto',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className="space-y-2">
      {/* Label y nivel */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
          {config.icon}
          <span className="font-semibold text-sm">{config.text}</span>
        </div>
      </div>

      {/* Barra de costo */}
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-700"></div>

        {/* Marcadores de nivel */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-gray-600/50"></div>
          <div className="flex-1 border-r border-gray-600/50"></div>
          <div className="flex-1"></div>
        </div>

        {/* Barra de progreso */}
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.color} shadow-lg transition-all duration-500 ease-out`}
          style={{ width: `${config.percentage}%` }}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Labels debajo de la barra */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span className={level === 'bajo' ? config.textColor : ''}>Bajo</span>
        <span className={level === 'medio' ? config.textColor : ''}>Medio</span>
        <span className={level === 'alto' ? config.textColor : ''}>Alto</span>
      </div>
    </div>
  );
};

export default CostBar;
