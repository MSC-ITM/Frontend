import React from 'react';
import { TaskState } from '../types';

interface StateBadgeProps {
  state: TaskState;
  className?: string;
}

const StateBadge: React.FC<StateBadgeProps> = ({ state, className = '' }) => {
  const getStateStyles = (state: TaskState): string => {
    const styles: Record<TaskState, string> = {
      Pending: 'bg-gray-500/20 text-gray-300 border-gray-500/30 shadow-gray-500/20',
      Running: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/30',
      Succeeded: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/30',
      Failed: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/30',
      Retry: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-orange-500/30',
    };
    return styles[state] || styles.Pending;
  };

  const translateState = (state: TaskState): string => {
    const translations: Record<TaskState, string> = {
      Pending: 'Pendiente',
      Running: 'Ejecutando',
      Succeeded: 'Exitoso',
      Failed: 'Fallido',
      Retry: 'Reintentando',
    };
    return translations[state] || state;
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getStateStyles(
        state
      )} ${className}`}
    >
      {translateState(state)}
    </span>
  );
};

export default StateBadge;
