import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import congressoIlustrado from '@/assets/congresso-ilustrado.png';
import mammothImage from '@/assets/figma-mamute.png';
import logoMamute from '@/assets/logo-mamute.png';

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
  { label: 'DEPUTADOS/AS', value: '513' },
  { label: 'SENADORES/AS', value: '81' },
  { label: 'PROPOSIÇÕES 2024', value: '4.532' },
  { label: 'VOTAÇÕES', value: '892' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#e6c54a]" style={{ minHeight: '460px' }}>
        {/* Congress building illustration — right side on large screens */}
        <img
          src={congressoIlustrado}
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-auto object-contain object-right-bottom lg:block"
          style={{ maxWidth: '55%' }}
        />

        <div className="container relative z-10 flex min-h-[460px] items-center py-14">
          <div className="max-w-[500px] space-y-6">
            <p className="text-[15px] font-black tracking-widest text-[#383838] uppercase">
              TEMPO REAL
            </p>
            <h1 className="text-[42px] font-bold leading-[1.05] text-[#383838] md:text-[52px]">
              Acompanhe o Congresso Nacional de perto
            </h1>
            <p className="text-[18px] font-normal leading-snug text-[#383838]">
              Monitore parlamentares, analise votações, acompanhe proposições e mantenha-se informado sobre a atividade legislativa brasileira.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/selecao">
                <button className="rounded-full bg-[#1b76ff] px-7 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition hover:opacity-90">
                  COMEÇAR AGORA
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="rounded-full bg-white px-7 py-3 text-[13px] font-semibold uppercase tracking-wide text-[#4b4b4b] transition hover:opacity-90">
                  EXPLORAR DASHBOARD
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-[12px] bg-white py-8 px-4 text-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-1">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#e8f0fe" />
                    <path d="M24 14C18.477 14 14 18.477 14 24s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.38V19z" fill="#468fff"/>
                  </svg>
                </div>
                <p className="text-[36px] font-black leading-none text-[#868686]">{stat.value}</p>
                <p className="text-[14px] font-normal uppercase tracking-wide text-[#000000]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-14">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-[40px] font-bold text-[#090909]">
              Funcionalidades Principais
            </h2>
            <p className="mx-auto max-w-2xl text-[20px] font-normal text-[#090909]">
              Ferramentas poderosas para você acompanhar e analisar a atividade legislativa brasileira de forma <strong>simples e eficiente</strong>.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="flex justify-center">
              <img src={mammothImage} alt="Mamute ilustração" className="max-h-[420px] w-auto object-contain" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[12px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex flex-col items-center text-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#468fff"/>
                      <path d="M9.5 16.5l-3.5-3.5 1.41-1.41L9.5 13.67l7.09-7.09L18 8l-8.5 8.5z" fill="white"/>
                    </svg>
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

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="container text-center">
          <h2 className="mb-4 text-[48px] font-bold text-[#080808]">
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-[18px] font-semibold text-[#080808]">
            Selecione os parlamentares que deseja acompanhar e comece a monitorar suas atividades legislativas agora mesmo.
          </p>
          <Link to="/selecao">
            <button className="rounded-full bg-[#468fff] px-8 py-3 text-[15px] font-bold uppercase tracking-wide text-white transition hover:opacity-90">
              SELECIONAR PARLAMENTARES
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <img src={logoMamute} alt="Mamute Político" className="h-8 w-auto" />
          <p className="text-[12px] font-medium text-[#000000]">
            © 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
