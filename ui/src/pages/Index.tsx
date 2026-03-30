import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  FileText,
  ArrowRight,
  Search,
  TrendingUp,
  Vote
} from 'lucide-react';
// Foto do Congresso Nacional: Agência Senado / Senado Federal
// Fonte: https://www12.senado.leg.br/fotos/fotodestaque/?id-52722654292
import congressoImage from '@/assets/congresso-nacional.jpg';

const features = [
  {
    icon: Users,
    title: 'Acompanhamento Personalizado',
    description: 'Selecione e monitore os parlamentares de seu interesse.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Interativo',
    description: 'Visualize dados, votações e proposições em tempo real.',
  },
  {
    icon: MessageSquare,
    title: 'Pesquisa por IA',
    description: 'Consulte informações legislativas em linguagem natural.',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Receba alertas sobre movimentações dos parlamentares.',
  },
];

const stats = [
  { label: 'Deputados', value: '513', icon: Building2 },
  { label: 'Senadores', value: '81', icon: Building2 },
  { label: 'Proposições 2024', value: '4.532', icon: FileText },
  { label: 'Votações', value: '892', icon: Vote },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge variant="accent" className="px-4 py-1.5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Monitoramento Legislativo em Tempo Real
                </Badge>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Acompanhe o{' '}
                  <span className="text-primary">Congresso Nacional</span>{' '}
                  de perto
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Monitore parlamentares, analise votações, acompanhe proposições 
                  e mantenha-se informado sobre a atividade legislativa brasileira.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/selecao">
                  <Button variant="hero" size="xl" className="gap-2">
                    Começar Agora
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="xl" className="gap-2">
                    <Search className="h-5 w-5" />
                    Explorar Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <img
                  src={congressoImage}
                  alt="Congresso Nacional do Brasil"
                  className="w-full h-auto rounded-2xl shadow-2xl grayscale"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10" />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  Foto: Agência Senado
                </div>
              </div>
              
              {/* Floating stats cards */}
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">594</p>
                    <p className="text-xs text-muted-foreground">Parlamentares</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-card p-4 rounded-xl shadow-lg border animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.5k+</p>
                    <p className="text-xs text-muted-foreground">Proposições</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para você acompanhar e analisar a atividade 
              legislativa brasileira de forma simples e eficiente.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  variant="interactive"
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Selecione os parlamentares que deseja acompanhar e comece a monitorar 
            suas atividades legislativas agora mesmo.
          </p>
          <Link to="/selecao">
            <Button variant="gold" size="xl" className="gap-2">
              Selecionar Parlamentares
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-primary">Mamute Político</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
