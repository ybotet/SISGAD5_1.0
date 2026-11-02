// components/ErrorDisplay.tsx
import React from 'react';


interface ErrorDisplayProps {
  error: string | null;
  errorType?: 'FORBIDDEN' | 'UNAUTHORIZED' | 'GENERAL' | null;
  onClose?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType,
  onClose
}) => {
  if (!error) return null;

  // Estilos según el tipo de error
  const getStyles = () => {
    switch (errorType) {
      case 'FORBIDDEN':
        return {
          container: 'bg-yellow-50 border-yellow-400 text-yellow-800',
          title: 'text-yellow-800',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'UNAUTHORIZED':
        return {
          container: 'bg-red-50 border-red-400 text-red-800',
          title: 'text-red-800',
          button: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          container: 'bg-red-50 border-red-400 text-red-800',
          title: 'text-red-800',
          button: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
    }
  };

  const getTitle = () => {
    switch (errorType) {
      case 'FORBIDDEN':
        return 'Acceso Restringido';
      case 'UNAUTHORIZED':
        return 'No Autorizado';
      default:
        return 'Error';
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.container} border-l-4 p-4 rounded mb-4`}>
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0">
            {errorType === 'FORBIDDEN' ? (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {getTitle()}
            </h3>
            <div className="mt-2 text-sm">
              <p>{error}</p>
            </div>

            {errorType === 'FORBIDDEN' && (
              <div className="mt-4">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Volver al Dashboard
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contactar Soporte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="ml-3 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;