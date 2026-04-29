import { useState } from 'react';
import { CasaLegislativa } from '@/types/parlamentar';
import texturaBackground from '@/assets/textura.png';
import congressoRecorte from '@/assets/banner2-semfundo.png';
import logoMamute from '@/assets/logo-mamute.png';

interface CongressoSelectorProps {
  onSelect: (casa: CasaLegislativa) => void;
  selected: CasaLegislativa | null;
}

export function CongressoSelector({ onSelect, selected }: CongressoSelectorProps) {
  const PERSPECTIVE_PX = 1200;
  const MAX_ROTATE_Y_DEG = 2;
  const MAX_TRANSLATE_X_PX = 20;
  const BACKGROUND_SCALE = 1.02;

  const buildTransform = (centered: number) =>
    `perspective(${PERSPECTIVE_PX}px) rotateY(${(centered * -MAX_ROTATE_Y_DEG).toFixed(2)}deg) translateX(${(centered * -MAX_TRANSLATE_X_PX).toFixed(2)}px) scale(${BACKGROUND_SCALE})`;

  const [imageTransform, setImageTransform] = useState(buildTransform(0));

  // -1 = full left tilt, 0 = centered, 1 = full right tilt
  const tiltMap: Record<CasaLegislativa, number> = {
    senado: -1,
    ambas: 0,
    camara: 1,
  };

  const options: Array<{ key: CasaLegislativa; label: string }> = [
    { key: 'senado', label: 'SENADO FEDERAL' },
    { key: 'ambas', label: 'AMBAS AS CASAS' },
    { key: 'camara', label: 'CÂMARA DOS DEPUTADOS' },
  ];

  return (
    <>
    <section
      className="relative min-h-[calc(800px)] overflow-hidden bg-textura-gold"
    >
      <img
        src={texturaBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div
        className="absolute inset-0 h-full w-[101.25%] transition-transform duration-500 ease-in-out"
        style={{ transform: imageTransform, transformOrigin: 'center bottom' }}
      >
        <img
          src={congressoRecorte}
          alt="Congresso Nacional"
          className="absolute bottom-0 left-0 w-full object-contain object-bottom"
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

        <div className="mx-auto mt-14 flex w-fit flex-wrap items-center justify-center gap-3">
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
                onMouseEnter={() => setImageTransform(buildTransform(tiltMap[option.key]))}
                onMouseLeave={() => setImageTransform(buildTransform(0))}
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
