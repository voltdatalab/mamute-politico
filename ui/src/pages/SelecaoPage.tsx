import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CongressoSelector } from '@/components/selecao/CongressoSelector';
import { ParlamentarSelector } from '@/components/selecao/ParlamentarSelector';
import { CasaLegislativa, Parlamentar } from '@/types/parlamentar';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import logoMamute from '@/assets/logo-mamute.png';

const SelecaoPage = () => {
  const [casaSelecionada, setCasaSelecionada] = useState<CasaLegislativa | null>(null);
  const [parlamentaresSelecionados, setParlamentaresSelecionados] = useState<Parlamentar[]>([]);

  const handleSelectCasa = (casa: CasaLegislativa) => {
    setCasaSelecionada(casa);
  };

  const handleAddParlamentar = (parlamentar: Parlamentar) => {
    setParlamentaresSelecionados((prev) => [...prev, parlamentar]);
  };

  const handleRemoveParlamentar = (id: string) => {
    setParlamentaresSelecionados((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBack = () => {
    setCasaSelecionada(null);
  };

  const casaLabel =
    casaSelecionada === 'senado'
      ? 'Senado Federal'
      : casaSelecionada === 'camara'
        ? 'Câmara dos Deputados'
        : 'Ambas as Casas';

  return (
    <div className="min-h-screen bg-[#e6c54a]">
      <Header />

      {!casaSelecionada ? (
        <CongressoSelector onSelect={handleSelectCasa} selected={casaSelecionada} />
      ) : (
        <main className="min-h-[calc(100vh-64px)]">
          {/* Yellow top section with title */}
          <div className="bg-[#e6c54a] px-6 py-10">
            <div className="container">
              <h1 className="text-center text-[48px] font-bold text-[#383838]">{casaLabel}</h1>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-2 text-[13px] font-semibold text-[#383838] shadow-sm transition hover:opacity-90"
                >
                  <ArrowLeft className="h-4 w-4" />
                  VOLTAR À SELEÇÃO DE CASA
                </button>
                {parlamentaresSelecionados.length > 0 && (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-[#383838] px-6 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    VER DASHBOARD GERAL
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Gray bottom section with parlamentar selector */}
          <div className="bg-[#ececec] px-6 py-8">
            <div className="container">
              <ParlamentarSelector
                casaSelecionada={casaSelecionada}
                parlamentaresSelecionados={parlamentaresSelecionados}
                onAddParlamentar={handleAddParlamentar}
                onRemoveParlamentar={handleRemoveParlamentar}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#ececec] px-6 py-6 border-t border-black/10">
            <div className="container flex items-center justify-between">
              <img src={logoMamute} alt="Mamute Político" className="h-7 w-auto" />
              <span className="text-[12px] font-medium text-[#383838]">
                © 2026 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
              </span>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default SelecaoPage;
