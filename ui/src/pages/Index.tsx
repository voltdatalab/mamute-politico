import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import congressoIlustrado from '@/assets/congresso-ilustrado.png';
import mammothImage from '@/assets/figma-mamute.png';
import logoMamute from '@/assets/logo-mamute.png';
import { CheckCircle2, FileBadge2, Landmark, UserRound, UsersRound, Vote } from 'lucide-react';

const features = [
  {
    title: 'ACOMPANHAMENTO\nPERSONALIZADO',
    description: 'Selecione e monitore os parlamentares do seu interesse.',
  },
  {
    title: 'DASHBOARD\nINTERATIVO',
    description: 'Visualize dados, votações e proposições em tempo real.',
  },
  {
    title: 'PESQUISA POR IA',
    description: 'Consulte informações legislativas em linguagem natural.',
  },
  {
    title: 'NOTIFICAÇÕES',
    description: 'Receba alertas sobre movimentações dos parlamentares.',
  },
];

const stats = [
  { label: 'DEPUTADOS/AS', value: '513', icon: UserRound },
  { label: 'SENADORES/AS', value: '81', icon: UsersRound },
  { label: 'PROPOSIÇÕES 2024', value: '4.532', icon: FileBadge2 },
  { label: 'VOTAÇÕES', value: '892', icon: Vote },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <section className="relative overflow-hidden bg-[#e6c54a]">
        <img
          src={congressoIlustrado}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="container relative z-10 grid min-h-[560px] items-center py-8">
          <div className="max-w-[610px] space-y-5">
            <p className="flex items-center gap-2 text-[15px] font-extrabold italic tracking-wide text-[#393939] uppercase">
              <Landmark className="h-4 w-4" />
              TEMPO REAL
            </p>
            <h1 className="text-[48px] font-bold leading-[1.05] text-[#393939] md:text-[56px]">
              Acompanhe o Congresso Nacional de perto
            </h1>
            <p className="max-w-[565px] text-[18px] font-normal leading-snug text-[#393939]">
              Monitore parlamentares, analise votações, acompanhe proposições e mantenha-se informado sobre a atividade legislativa brasileira.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/selecao" className="mp-pill-blue px-9 py-2 text-[13px] uppercase tracking-wide transition hover:opacity-90">
                  COMEÇAR AGORA
              </Link>
              <Link to="/dashboard" className="mp-pill-light px-7 py-2 text-[13px] uppercase tracking-wide transition hover:opacity-90">
                  EXPLORAR DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 relative z-10">
        <div className="container -mt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="mp-card flex h-[285px] flex-col items-center justify-center gap-3 bg-white p-4 text-center">
                <stat.icon className="h-14 w-14 text-[#1b76ff]" />
                <p className="text-[48px] font-extrabold leading-none text-[#878787]">{stat.value}</p>
                <p className="text-[14px] font-normal uppercase tracking-wide text-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-2">
        <div className="container">
          <div className="mb-10 text-center lg:text-right">
            <h2 className="mb-3 text-[40px] font-bold text-[#090909]">
              Funcionalidades Principais
            </h2>
            <p className="ml-auto max-w-2xl text-[20px] font-normal text-[#090909]">
              Ferramentas poderosas para você acompanhar e analisar a atividade legislativa brasileira de forma <strong>simples e eficiente</strong>.
            </p>
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-2">
            <div className="flex justify-center lg:justify-start">
              <img src={mammothImage} alt="Mamute ilustração" className="max-h-[560px] w-auto object-contain" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="mp-card flex min-h-[254px] flex-col items-center gap-4 bg-white p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b76ff]">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-[15px] font-bold uppercase text-[#4b4b4b] whitespace-pre-line leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] font-normal text-[#000000]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container text-center">
          <h2 className="mb-4 text-[56px] font-bold text-[#080808]">
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-[18px] font-semibold text-[#080808]">
            Selecione os parlamentares que deseja acompanhar e comece a monitorar suas atividades legislativas agora mesmo.
          </p>
          <Link to="/selecao" className="inline-flex rounded-[76px] bg-[#468fff] px-8 py-3 text-[15px] font-bold uppercase tracking-wide text-white transition hover:opacity-90">
              SELECIONAR PARLAMENTARES
          </Link>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <img src={logoMamute} alt="Mamute Político" className="h-[47px] w-auto" />
          <p className="mp-footer-note text-black">
            © 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
