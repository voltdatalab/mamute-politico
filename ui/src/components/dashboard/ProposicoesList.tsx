import { useQuery } from '@tanstack/react-query';
import { listPropositions, listPropositionsByParliamentarian } from '@/api/endpoints';
import { mapPropositionOutToProposicao } from '@/api/mappers';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Tag, Loader2 } from 'lucide-react';

interface ProposicoesListProps {
  limit?: number;
  parliamentarianId?: string;
}

export function ProposicoesList({ limit = 5, parliamentarianId }: ProposicoesListProps) {
  const numericId = parliamentarianId != null && parliamentarianId !== '' ? Number(parliamentarianId) : NaN;
  const isParliamentarianScope = Number.isInteger(numericId) && numericId > 0;

  const { data: rawList, isLoading, isError } = useQuery({
    queryKey: ['propositions', isParliamentarianScope ? 'by-parliamentarian' : 'list', numericId, limit],
    queryFn: () =>
      isParliamentarianScope
        ? listPropositionsByParliamentarian(numericId, limit)
        : listPropositions({ limit, offset: 0 }),
  });

  const proposicoes = rawList != null ? rawList.map(mapPropositionOutToProposicao) : [];

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'Aprovado':
        return 'success';
      case 'Em tramitação':
        return 'info';
      case 'Aguardando votação':
        return 'warning';
      case 'Rejeitado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      </ScrollArea>
    );
  }

  if (isError) {
    return (
      <ScrollArea className="h-full">
        <div className="text-center py-8 text-muted-foreground text-sm">
          Falha ao carregar proposições.
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {proposicoes.map((proposicao) => (
          <div
            key={proposicao.id}
            role={proposicao.link ? 'link' : undefined}
            tabIndex={proposicao.link ? 0 : -1}
            onClick={() => {
              if (!proposicao.link) return;
              window.open(proposicao.link, '_blank', 'noopener,noreferrer');
            }}
            onKeyDown={(e) => {
              if (!proposicao.link) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open(proposicao.link, '_blank', 'noopener,noreferrer');
              }
            }}
            className={[
              'p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
              proposicao.link ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' : 'cursor-default',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-sm">
                  {proposicao.tipo} {proposicao.numero}/{proposicao.ano}
                </span>
              </div>
              <Badge variant={getSituacaoBadge(proposicao.situacao) as 'success' | 'destructive' | 'secondary' | 'info' | 'warning'} className="text-[10px] shrink-0">
                {proposicao.situacao}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {proposicao.ementa}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {proposicao.dataApresentacao
                  ? new Date(proposicao.dataApresentacao).toLocaleDateString('pt-BR')
                  : '—'}
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {proposicao.tema}
              </div>
            </div>
          </div>
        ))}
        {proposicoes.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma proposição encontrada.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
