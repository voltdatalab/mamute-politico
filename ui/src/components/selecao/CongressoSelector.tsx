import { CasaLegislativa } from '@/types/parlamentar';
import { Badge } from '@/components/ui/badge';
import congressoImage from '@/assets/figma-hero.png';

interface CongressoSelectorProps {
  onSelect: (casa: CasaLegislativa) => void;
  selected: CasaLegislativa | null;
}

export function CongressoSelector({ onSelect, selected }: CongressoSelectorProps) {
  const options: Array<{ key: CasaLegislativa; label: string; subtitle: string }> = [
    { key: 'senado', label: 'Senado Federal', subtitle: '81 senadores/as' },
    { key: 'ambas', label: 'Ambas as Casas', subtitle: 'Monitoramento completo' },
    { key: 'camara', label: 'Camara dos Deputados', subtitle: '513 deputados/as' },
  ];

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      <img src={congressoImage} alt="Congresso Nacional" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-transparent" />

      <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-between py-14">
        <div className="space-y-3 text-center">
          <h2 className="text-5xl font-extrabold text-[#1f2b44] drop-shadow-[0_1px_0_rgba(255,255,255,0.25)] md:text-6xl">
          Selecione a Casa Legislativa
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-[#273349]">
            Escolha qual casa legislativa voce deseja acompanhar.
            <br />
            Voce pode selecionar a Camara dos Deputados, o Senado Federal, ou ambas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {options.map((option) => {
            const isActive = selected === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={`rounded-full px-8 py-2 text-sm font-semibold uppercase shadow-sm transition ${isActive ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-white/90'}`}
                onClick={() => onSelect(option.key)}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-6xl space-y-6">
          {selected && (
            <div className="animate-fade-in text-center">
              <Badge variant={selected === 'camara' ? 'camara' : selected === 'senado' ? 'senado' : 'highlight'} className="px-6 py-2 text-base">
                {selected === 'camara' && 'Camara dos Deputados selecionada'}
                {selected === 'senado' && 'Senado Federal selecionado'}
                {selected === 'ambas' && 'Ambas as Casas selecionadas'}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between px-2 text-sm font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
            <span>MAMUTE POLITICO</span>
            <span>© 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
