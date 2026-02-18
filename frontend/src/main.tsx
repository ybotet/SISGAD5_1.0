import './index.css';
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
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorProvider>
);
