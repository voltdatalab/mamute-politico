import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CongressoSelector } from '@/components/selecao/CongressoSelector';
import { ParlamentarSelector } from '@/components/selecao/ParlamentarSelector';
import { CasaLegislativa, Parlamentar } from '@/types/parlamentar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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

  return (
    <div className={`min-h-screen ${casaSelecionada ? 'bg-[linear-gradient(to_bottom,#e6c54a_0%,#e6c54a_68%,#3d825b_68%,#3d825b_100%)]' : 'bg-[#ececec]'}`}>
      <Header />
      
      <main className={`${casaSelecionada ? 'container py-8' : ''}`}>
        {!casaSelecionada ? (
          <div>
            <CongressoSelector 
              onSelect={handleSelectCasa} 
              selected={casaSelecionada} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-center text-5xl font-extrabold text-foreground">
                {casaSelecionada === 'senado' ? 'Senado Federal' : casaSelecionada === 'camara' ? 'Camara dos Deputados' : 'Ambas as Casas'}
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={handleBack} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" />
                Voltar à seleção de casa
              </Button>
              
              {parlamentaresSelecionados.length > 0 && (
                <Button variant="hero" className="gap-2 bg-foreground hover:bg-foreground/90">
                  Ver Dashboard Geral
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              </div>
            </div>
            
            <ParlamentarSelector
              casaSelecionada={casaSelecionada}
              parlamentaresSelecionados={parlamentaresSelecionados}
              onAddParlamentar={handleAddParlamentar}
              onRemoveParlamentar={handleRemoveParlamentar}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default SelecaoPage;
