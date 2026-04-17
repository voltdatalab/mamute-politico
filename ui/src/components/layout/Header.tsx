import { Link, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, Users, MessageSquare, LogIn, UserRound } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-primary">
                Mamute Político
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1">
                Monitor Legislativo
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
                      isActive && 'shadow-md'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* TODO: Add notifications */}
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button> */}
          {/* <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button> */}
          <button
            type="button"
            onClick={handleAuthClick}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-accent transition cursor-pointer"
            aria-label={token ? 'Conta' : 'Entrar'}
          >
            {token ? (
              <UserRound className="h-5 w-5" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
