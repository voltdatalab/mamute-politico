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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {!casaSelecionada ? (
          <div className="animate-fade-in">
            <CongressoSelector 
              onSelect={handleSelectCasa} 
              selected={casaSelecionada} 
            />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar à seleção de casa
              </Button>
              
              {parlamentaresSelecionados.length > 0 && (
                <Button variant="hero" className="gap-2">
                  Ver Dashboard Geral
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
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
