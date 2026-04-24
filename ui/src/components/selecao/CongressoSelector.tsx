import { CasaLegislativa } from '@/types/parlamentar';
import congressoSelecao from '@/assets/congresso-selecao.png';
import logoMamute from '@/assets/logo-mamute.png';

interface CongressoSelectorProps {
  onSelect: (casa: CasaLegislativa) => void;
  selected: CasaLegislativa | null;
}

export function CongressoSelector({ onSelect, selected }: CongressoSelectorProps) {
  const options: Array<{ key: CasaLegislativa; label: string }> = [
    { key: 'senado', label: 'SENADO FEDERAL' },
    { key: 'ambas', label: 'AMBAS AS CASAS' },
    { key: 'camara', label: 'CÂMARA DOS DEPUTADOS' },
  ];

  return (
    <>
    <section className="relative min-h-[calc(800px)] overflow-hidden bg-[#e6c54a]">
      <div className="absolute inset-0 h-full w-[101.25%]">
      <img
        src={congressoSelecao}
        alt="Congresso Nacional"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />

      </div>

      <div className="absolute inset-0 bg-[#e6c54a]/0" /> 

      <div className="relative flex min-h-[calc(100vh-88px)] flex-col py-14 px-6">
        <div className="space-y-3 text-center">
          <h2 className="text-[56px] font-bold text-[#393939]">
            Selecione a Casa Legislativa
          </h2>
          <p className="mx-auto max-w-2xl text-[18px] font-normal text-[#383838]">
            Escolha qual casa legislativa você deseja acompanhar.
            <br />
            Você pode selecionar a Câmara dos Deputados, o Senado Federal, ou ambas.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {options.map((option) => {
            const isActive = selected === option.key;
            const responsiveOrder =
              option.key === 'camara'
                ? 'order-2 md:order-3'
                : option.key === 'ambas'
                  ? 'order-3 md:order-2'
                  : 'order-1 md:order-1';
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelect(option.key)}
                className={`${responsiveOrder} w-[194px] rounded-[76px] py-2.5 text-[13px] font-semibold uppercase tracking-wide shadow-sm transition ${
                  isActive ? 'bg-[#1b76ff] text-white' : 'bg-white text-[#383838] hover:bg-[#1b76ff] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

      </div>

    </section>
    <div className="relative flex h-[185px] items-center bg-[#447b55]">
    <div className="container">
          <div className="flex items-center justify-between px-2 text-[12px] font-medium text-[#ffffff] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
            <img src={logoMamute} alt="Mamute Político" className="h-[47px] w-auto brightness-0 invert" />
            <span>© 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.</span>
          </div>
        </div>
        </div>
    </>
  );
}
