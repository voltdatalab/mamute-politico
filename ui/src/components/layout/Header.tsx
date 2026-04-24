import { Link, useLocation } from 'react-router-dom';
import { Bell, Building2, LayoutDashboard, LogIn, MessageSquare, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGhostAuth } from '@/components/auth/ghost-auth/react/useGhostAuth';
import { ACCOUNT_URL, JWT_TOKEN_KEY, LOGIN_URL } from '@/components/auth/config';

const navItems = [
  { path: '/', label: 'Início', icon: Building2 },
  { path: '/selecao', label: 'Selecionar Parlamentares', icon: Users },
  { path: '/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
  { path: '/pesquisa', label: 'Pesquisa IA', icon: MessageSquare },
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
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#e6c54a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#e6c54a]/80">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-foreground" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-wide text-foreground">
                MAMUTE
              </span>
              <span className="text-sm font-extrabold tracking-wide text-foreground">
                POLITICO
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full px-3 text-xs lg:text-sm',
                      isActive ? 'underline underline-offset-4' : 'opacity-85 hover:opacity-100'
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative h-8 w-8 rounded-full bg-white/40 text-foreground transition hover:bg-white/70"
            aria-label="Notificações"
          >
            <Bell className="mx-auto h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-foreground text-[9px] font-semibold text-white">
              3
            </span>
          </button>
          <button
            type="button"
            onClick={handleAuthClick}
            className="h-8 rounded-full bg-red-500 px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-600 cursor-pointer"
            aria-label={token ? 'Conta' : 'Entrar'}
          >
            {token ? (
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5" />
                Sair
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LogIn className="h-3.5 w-3.5" />
                Sair
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
