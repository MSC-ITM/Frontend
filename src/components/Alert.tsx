import React from 'react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const getAlertStyles = () => {
    const styles = {
      error: {
        gradient: 'from-red-500 to-rose-500',
        shadow: 'shadow-red-500/50',
        border: 'border-red-500/50',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      warning: {
        gradient: 'from-yellow-500 to-orange-500',
        shadow: 'shadow-yellow-500/50',
        border: 'border-yellow-500/50',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
      success: {
        gradient: 'from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/50',
        border: 'border-emerald-500/50',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      info: {
        gradient: 'from-cyan-500 to-blue-500',
        shadow: 'shadow-cyan-500/50',
        border: 'border-cyan-500/50',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    };
    return styles[type];
  };

  const alertStyles = getAlertStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#1e1e1e] rounded-xl shadow-2xl border-2 border-gray-700/50 max-w-md w-full mx-4 animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className={`bg-gradient-to-r ${alertStyles.gradient} p-4 rounded-t-xl ${alertStyles.shadow} shadow-lg`}>
          <div className="flex items-center gap-3 text-white">
            {alertStyles.icon}
            <h3 className="font-bold text-lg drop-shadow-lg">{title}</h3>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer con botón */}
        <div className="p-4 border-t border-gray-700/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2 bg-gradient-to-r ${alertStyles.gradient} text-white rounded-lg hover:opacity-90 transition-all ${alertStyles.shadow} shadow-lg font-medium text-sm`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
