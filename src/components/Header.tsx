import { useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/auth';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h1 className="text-2xl font-semibold text-gray-800">BTx Health</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="w-6 h-6 text-gray-600" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}