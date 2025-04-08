import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { PatientsProvider } from '@/contexts/PatientsContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PatientsProvider>
        <Component {...pageProps} />
      </PatientsProvider>
    </AuthProvider>
  );
} 