import { useState } from 'react';
import { CasaLegislativa } from '@/types/parlamentar';
import { Badge } from '@/components/ui/badge';
// Foto do Congresso Nacional: Agência Senado / Senado Federal
// Fonte: https://www12.senado.leg.br/fotos/fotodestaque/?id-52722654292
import congressoImage from '@/assets/congresso-nacional.jpg';

interface CongressoSelectorProps {
  onSelect: (casa: CasaLegislativa) => void;
  selected: CasaLegislativa | null;
}

export function CongressoSelector({ onSelect, selected }: CongressoSelectorProps) {
  const [hovered, setHovered] = useState<CasaLegislativa | null>(null);

  const getHighlightClass = (area: CasaLegislativa) => {
    if (selected === area || hovered === area) {
      return 'opacity-100 scale-105';
    }
    if (selected === 'ambas' || hovered === 'ambas') {
      return 'opacity-100';
    }
    return 'opacity-70';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Selecione a Casa Legislativa
        </h2>
        <p className="text-muted-foreground max-w-md">
          Escolha qual casa legislativa você deseja acompanhar. Você pode selecionar 
          a Câmara dos Deputados, o Senado Federal, ou ambas.
        </p>
      </div>

      {/* Building Image with Interactive Areas */}
      <div className="relative w-full max-w-2xl">
        <img
          src={congressoImage}
          alt="Congresso Nacional do Brasil"
          className="w-full h-auto rounded-lg shadow-lg grayscale"
        />
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Foto: Agência Senado
        </div>
        
        {/* Overlay Areas */}
        <div className="absolute inset-0 flex">
          {/* Senado - Left dome */}
          <button
            className={`absolute left-[10%] top-[20%] w-[25%] h-[50%] rounded-full transition-all duration-300 cursor-pointer ${getHighlightClass('senado')}`}
            style={{
              background: hovered === 'senado' || selected === 'senado' 
                ? 'radial-gradient(circle, hsla(152, 55%, 35%, 0.3) 0%, transparent 70%)' 
                : 'transparent',
            }}
            onMouseEnter={() => setHovered('senado')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('senado')}
            aria-label="Selecionar Senado Federal"
          />
          
          {/* Centro - Both */}
          <button
            className={`absolute left-[35%] top-[30%] w-[30%] h-[50%] transition-all duration-300 cursor-pointer ${getHighlightClass('ambas')}`}
            style={{
              background: hovered === 'ambas' || selected === 'ambas'
                ? 'radial-gradient(circle, hsla(45, 90%, 50%, 0.3) 0%, transparent 70%)'
                : 'transparent',
            }}
            onMouseEnter={() => setHovered('ambas')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('ambas')}
            aria-label="Selecionar Ambas as Casas"
          />
          
          {/* Câmara - Right dome */}
          <button
            className={`absolute right-[10%] top-[20%] w-[25%] h-[50%] rounded-full transition-all duration-300 cursor-pointer ${getHighlightClass('camara')}`}
            style={{
              background: hovered === 'camara' || selected === 'camara'
                ? 'radial-gradient(circle, hsla(220, 60%, 25%, 0.3) 0%, transparent 70%)'
                : 'transparent',
            }}
            onMouseEnter={() => setHovered('camara')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('camara')}
            aria-label="Selecionar Câmara dos Deputados"
          />
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-8">
          <div className="text-center">
            <Badge 
              variant={selected === 'senado' || hovered === 'senado' ? 'senado' : 'secondary'}
              className="text-sm px-4 py-1.5 cursor-pointer transition-all"
              onClick={() => onSelect('senado')}
              onMouseEnter={() => setHovered('senado')}
              onMouseLeave={() => setHovered(null)}
            >
              Senado Federal
            </Badge>
          </div>
          <div className="text-center">
            <Badge 
              variant={selected === 'ambas' || hovered === 'ambas' ? 'highlight' : 'secondary'}
              className="text-sm px-4 py-1.5 cursor-pointer transition-all"
              onClick={() => onSelect('ambas')}
              onMouseEnter={() => setHovered('ambas')}
              onMouseLeave={() => setHovered(null)}
            >
              Ambas as Casas
            </Badge>
          </div>
          <div className="text-center">
            <Badge 
              variant={selected === 'camara' || hovered === 'camara' ? 'camara' : 'secondary'}
              className="text-sm px-4 py-1.5 cursor-pointer transition-all"
              onClick={() => onSelect('camara')}
              onMouseEnter={() => setHovered('camara')}
              onMouseLeave={() => setHovered(null)}
            >
              Câmara dos Deputados
            </Badge>
          </div>
        </div>
      </div>

      {selected && (
        <div className="animate-fade-in">
          <Badge variant={selected === 'camara' ? 'camara' : selected === 'senado' ? 'senado' : 'highlight'} className="text-base px-6 py-2">
            {selected === 'camara' && '📍 Câmara dos Deputados selecionada'}
            {selected === 'senado' && '📍 Senado Federal selecionado'}
            {selected === 'ambas' && '📍 Ambas as Casas selecionadas'}
          </Badge>
        </div>
      )}
    </div>
  );
}
