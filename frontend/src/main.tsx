import React from 'react';
import './index.css';
import './i18n'; // initialize i18next before rendering the app

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'remixicon/fonts/remixicon.css';
import { AuthProvider } from './contexts/AuthContext';

import { ErrorProvider } from './contexts/ErrorContext';
// import ErrorDisplay from './components/ErrorDisplay';
// import { useError } from './contexts/ErrorContext';

// const AppContent = () => {
//   const { error, clearError } = useError();

//   return (
//     <>
//       <ErrorDisplay error={error} onClose={clearError} />
//       {/* Resto de tu aplicación */}
//     </>
//   );
// };


const isProduction = import.meta.env.PROD;
const basename = isProduction ? '/sisgad5' : '/';

createRoot(document.getElementById('root')!).render(
  <ErrorProvider>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        {/* Suspense allows react-i18next to wait for translation files */}
        <React.Suspense fallback={null}>
          <App />
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  </ErrorProvider>
);
