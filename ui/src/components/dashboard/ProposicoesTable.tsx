import { useQuery } from '@tanstack/react-query';
import { listPropositions, listPropositionsByParliamentarian } from '@/api/endpoints';
import { mapPropositionOutToProposicao } from '@/api/mappers';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getProposicaoSituacaoBadgeVariant } from '@/lib/proposicaoSituacao';
import { Download, Filter, ArrowUpDown, Loader2 } from 'lucide-react';

interface ProposicoesTableProps {
  limit?: number;
  parliamentarianId?: string;
}

export function ProposicoesTable({ limit = 10, parliamentarianId }: ProposicoesTableProps) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando proposições...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Falha ao carregar proposições.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Ordenar
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div> */}

      <div className="max-h-[400px] w-full overflow-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>Tipo/Número</TableHead>
              <TableHead>Ementa</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposicoes.map((proposicao) => (
              <TableRow
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
                  'hover:bg-muted/50',
                  proposicao.link ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' : 'cursor-default',
                ].join(' ')}
              >
                <TableCell className="font-medium">
                  {proposicao.tipo} {proposicao.numero}/{proposicao.ano}
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                  {proposicao.ementa}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="whitespace-nowrap text-[10px]">
                    {proposicao.tema}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {proposicao.dataApresentacao
                    ? new Date(proposicao.dataApresentacao).toLocaleDateString('pt-BR')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getProposicaoSituacaoBadgeVariant(proposicao.situacao)}
                    className="whitespace-nowrap text-[10px]"
                  >
                    {proposicao.situacao}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {proposicoes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma proposição encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
