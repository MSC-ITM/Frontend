import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from './index';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loading message="Verificando autenticación..." />
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar el componente protegido
  return <>{children}</>;
};

export default ProtectedRoute;
