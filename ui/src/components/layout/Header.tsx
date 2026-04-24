import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGhostAuth } from '@/components/auth/ghost-auth/react/useGhostAuth';
import { ACCOUNT_URL, JWT_TOKEN_KEY, LOGIN_URL } from '@/components/auth/config';
import logoMamute from '@/assets/logo-mamute.png';

const navItems = [
  { path: '/', label: 'Início' },
  { path: '/selecao', label: 'Selecionar Parlamentares' },
  { path: '/dashboard', label: 'Dashboard Geral' },
  { path: '/pesquisa', label: 'Pesquisa IA' },
];

export function Header() {
  const location = useLocation();
  const token = useGhostAuth();

  const handleAuthClick = () => {
    if (token) {
      localStorage.removeItem(JWT_TOKEN_KEY);
      window.location.href = ACCOUNT_URL;
    } else {
      window.location.href = LOGIN_URL;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#e6c54a]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <img src={logoMamute} alt="Mamute Político" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-3 py-1.5 text-[15px] font-medium text-[#383838] transition-opacity',
                    isActive ? 'underline underline-offset-4' : 'opacity-85 hover:opacity-100'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#383838] transition hover:opacity-80"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
              3
            </span>
          </button>
          <button
            type="button"
            onClick={handleAuthClick}
            className="rounded-full bg-[#ff0004] px-5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:opacity-90 cursor-pointer"
            aria-label={token ? 'Sair' : 'Iniciar Sessão'}
          >
            {token ? 'SAIR' : 'INICIAR SESSÃO'}
          </button>
        </div>
      </div>
    </header>
  );
}
