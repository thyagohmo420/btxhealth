import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PatientsProvider } from './contexts/PatientsContext';

export function App() {
  return (
    <BrowserRouter>
      <PatientsProvider>
        <ToastContainer />
        <Router />
      </PatientsProvider>
    </BrowserRouter>
  );
}

export default App;