import { useQuery } from '@tanstack/react-query';
import { listRollCallVotes } from '@/api/endpoints';
import { mapRollCallVoteOutToVotacao } from '@/api/mappers';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ThumbsUp, ThumbsDown, Minus, Ban, UserX, Loader2 } from 'lucide-react';

interface VotacoesTableProps {
  limit?: number;
  parliamentarianId?: number;
}

export function VotacoesTable({ limit = 10, parliamentarianId }: VotacoesTableProps) {
  const { data: rawList, isLoading, isError } = useQuery({
    queryKey: ['roll-call-votes', limit, parliamentarianId],
    queryFn: () =>
      listRollCallVotes({
        limit,
        offset: 0,
        parliamentarian_id: parliamentarianId,
      }),
  });

  const votacoes = rawList != null ? rawList.map(mapRollCallVoteOutToVotacao) : [];

  const getVotoIcon = (voto: string) => {
    switch (voto) {
      case 'Sim':
        return <ThumbsUp className="h-4 w-4 text-success" />;
      case 'Não':
        return <ThumbsDown className="h-4 w-4 text-destructive" />;
      case 'Abstenção':
        return <Minus className="h-4 w-4 text-warning" />;
      case 'Obstrução':
        return <Ban className="h-4 w-4 text-muted-foreground" />;
      case 'Ausente':
        return <UserX className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getVotoBadge = (voto: string) => {
    switch (voto) {
      case 'Sim':
        return 'success';
      case 'Não':
        return 'destructive';
      case 'Abstenção':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'Aprovado':
        return 'success';
      case 'Rejeitado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando votações...</span>
        </div>
      </ScrollArea>
    );
  }

  if (isError) {
    return (
      <ScrollArea className="h-full">
        <div className="text-center py-8 text-muted-foreground text-sm">
          Falha ao carregar votações.
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proposição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Voto</TableHead>
            <TableHead>Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {votacoes.map((votacao) => (
            <TableRow key={votacao.id}>
              <TableCell className="font-medium text-sm max-w-[200px] truncate">
                {votacao.proposicao}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {votacao.data ? new Date(votacao.data).toLocaleDateString('pt-BR') : '—'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getVotoIcon(votacao.voto)}
                  <Badge variant={getVotoBadge(votacao.voto) as 'success' | 'destructive' | 'warning' | 'secondary'} className="text-[10px]">
                    {votacao.voto}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getResultadoBadge(votacao.resultado) as 'success' | 'destructive' | 'secondary'} className="text-[10px]">
                  {votacao.resultado}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {votacoes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhuma votação encontrada.
        </div>
      )}
    </ScrollArea>
  );
}
