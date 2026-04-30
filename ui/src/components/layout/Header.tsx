import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
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
  const visibleNavItems = token ? navItems : navItems//.filter((item) => item.path === '/');

  const handleAuthClick = () => {
    if (token) {
      localStorage.removeItem(JWT_TOKEN_KEY);
      window.location.href = ACCOUNT_URL;
    } else {
      window.location.href = LOGIN_URL;
    }
  };

  // const handleAccountClick = () => {
  //   window.open(ACCOUNT_URL, '_blank', 'noopener,noreferrer');
  // };

  return (
    //TODO: Add sticky to the header
    <header className="top-0 z-50 w-full">
      <div className="container flex h-[88px] items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center">
            <img src={logoMamute} alt="Mamute Político" className="h-[39px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-1 py-1 text-[15px] font-medium text-[#393939] transition-opacity',
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
          {/* <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#393939] transition hover:opacity-80"
            aria-label="Notificações"
          >
            <Bell className="h-[15px] w-[15px]" />
            <span className="absolute right-[4px] top-[1px] flex h-[15px] w-[15px] items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              3
            </span>
          </button> */}
          {/* {token && (
            <button
              type="button"
              onClick={handleAuthClick}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#ff0004] hover:text-white border-[#393939] bg-white text-[#393939] transition hover:opacity-80"
              aria-label="Sua conta"
              title="Sua conta"
            >
              <User className="h-5 w-5" /> CONTA
            </button>
          )} */}
          {<button
            type="button"
            onClick={handleAuthClick}
            className={cn(
              'cursor-pointer rounded-[92px] px-6 py-2 text-[11px] font-bold uppercase tracking-wide transition hover:opacity-90',
              'hover:bg-[#ff0004] hover:text-white bg-[#f5f5f5] text-black'
            )}
            aria-label={token ? 'Sair' : 'Iniciar Sessão'}
          >
            {token ? <div className="flex items-center gap-2"><User className="h-5 w-5" /><span className="hidden md:block">{" "}CONTA</span></div> : 'INICIAR SESSÃO'}
          </button>}
        </div>
      </div>
    </header>
  );
}
