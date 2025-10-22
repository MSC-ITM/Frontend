import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ message, size = 'md' }) => {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div
        className={`${sizeStyles[size]} border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-lg shadow-cyan-500/30`}
      ></div>
      {message && <p className="mt-4 text-cyan-100/60">{message}</p>}
    </div>
  );
};

export default Loading;
