import { Link } from 'react-router-dom';
import { ArrowRight, Bell, FileText, LayoutDashboard, MessageSquare, UserRound, Vote } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import heroImage from '@/assets/figma-hero.png';
import mammothImage from '@/assets/figma-mamute.png';

const features = [
  {
    icon: UserRound,
    title: 'Acompanhamento Personalizado',
    description: 'Selecione e monitore os parlamentares do seu interesse.',
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
  { label: 'DEPUTADOS/AS', value: '513', icon: UserRound },
  { label: 'SENADORES/AS', value: '81', icon: UserRound },
  { label: 'Proposições 2024', value: '4.532', icon: FileText },
  { label: 'Votações', value: '892', icon: Vote },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-[#ececec]">
      <Header />

      <section className="relative overflow-hidden bg-[#e6c54a]">
        <img
          src={heroImage}
          alt="Fundo Congresso Nacional"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="container relative py-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge variant="outline" className="border-0 bg-transparent px-0 text-sm font-extrabold italic text-foreground">
                  TEMPO REAL
                </Badge>
                <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
                  Acompanhe o Congresso Nacional de perto
                </h1>
                <p className="max-w-xl text-base text-foreground/80 md:text-lg">
                  Monitore parlamentares, analise votacoes, acompanhe proposicoes e mantenha-se informado sobre a atividade legislativa brasileira.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/selecao">
                  <Button variant="hero" className="h-10 px-8 text-xs uppercase tracking-wide">
                    COMECAR AGORA
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="h-10 border-0 bg-white px-8 text-xs uppercase tracking-wide">
                    EXPLORAR DASHBOARD
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-12 pb-14">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="rounded-[20px] border border-black/10 bg-[#f1f1f1] shadow-md">
                  <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-5xl font-extrabold text-[#787878]">{stat.value}</p>
                    <p className="text-xs uppercase text-foreground/70">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-8">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-extrabold text-[#0a0a0a] md:text-5xl">
              Funcionalidades Principais
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80">
              Ferramentas poderosas para voce acompanhar e analisar a atividade legislativa brasileira de forma simples e eficiente.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <img src={mammothImage} alt="Mamute ilustracao" className="h-full w-full object-contain" />
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="min-h-[250px] border-black/10 bg-[#f5f5f5]">
                    <CardHeader className="items-center pt-8">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-center text-lg font-bold uppercase tracking-tight">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-foreground/80">
                      {feature.description}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-8">
        <div className="container text-center">
          <h2 className="mb-4 text-5xl font-extrabold text-[#080808]">
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/85">
            Selecione os parlamentares que deseja acompanhar e comece a monitorar suas atividades legislativas agora mesmo.
          </p>
          <Link to="/selecao">
            <Button variant="hero" className="h-12 px-10 text-sm uppercase">
              Selecionar Parlamentares
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/10 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-sm font-extrabold tracking-wide">MAMUTE POLITICO</span>
            </div>
            <p className="text-xs text-foreground/75">
              © 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
