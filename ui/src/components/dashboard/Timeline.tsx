import { useQueries } from '@tanstack/react-query';
import { listPropositions, listRollCallVotes } from '@/api/endpoints';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Vote, Loader2 } from 'lucide-react';

interface TimelineItem {
  id: string;
  tipo: 'proposicao' | 'votacao';
  titulo: string;
  descricao: string;
  data: string;
  autor: string;
  autorFoto: string;
  status: string;
}

// TODO: Remove this
const PLACEHOLDER_AVATAR = 'https://api.dicebear.com/7.x/personas/svg?seed=';

export function Timeline() {
  const [propositionsQuery, votesQuery] = useQueries({
    queries: [
      {
        queryKey: ['propositions', 'timeline'],
        queryFn: () => listPropositions({ limit: 20, offset: 0 }),
      },
      {
        queryKey: ['roll-call-votes', 'timeline'],
        queryFn: () => listRollCallVotes({ limit: 20, offset: 0 }),
      },
    ],
  });

  const propositions = propositionsQuery.data ?? [];
  const votes = votesQuery.data ?? [];

  const timelineItems: TimelineItem[] = [
    ...propositions.map((p) => ({
      id: `p-${p.id}`,
      tipo: 'proposicao' as const,
      titulo: `${p.proposition_acronym ?? 'PL'} ${p.proposition_number ?? ''}/${p.presentation_year ?? ''}`.trim(),
      descricao: p.proposition_description ?? p.summary ?? '—',
      data: p.presentation_date ?? p.created_at?.slice(0, 10) ?? '',
      autor: '—',
      autorFoto: PLACEHOLDER_AVATAR + p.id,
      status: p.current_status ?? '—',
    })),
    ...votes.map((v) => ({
      id: `v-${v.id}`,
      tipo: 'votacao' as const,
      titulo: `Votação #${v.proposition_id}`,
      descricao: v.description ?? `Voto: ${v.vote ?? '—'}`,
      data: v.created_at?.slice(0, 10) ?? '',
      autor: '—',
      autorFoto: PLACEHOLDER_AVATAR + v.id,
      status: v.vote ?? '—',
    })),
  ]
    .filter((i) => i.data)
    .sort((a, b) => (b.data > a.data ? 1 : -1))
    .slice(0, 15);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'success';
      case 'Apresentado':
        return 'info';
      case 'Em tramitação':
        return 'warning';
      case 'Rejeitado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const isLoading = propositionsQuery.isLoading || votesQuery.isLoading;
  const isError = propositionsQuery.isError || votesQuery.isError;

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando linha do tempo...</span>
        </div>
      </ScrollArea>
    );
  }

  if (isError) {
    return (
      <ScrollArea className="h-full">
        <div className="text-center py-8 text-muted-foreground text-sm">
          Falha ao carregar a linha do tempo.
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="relative pl-8 space-y-0">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

        {timelineItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum item na linha do tempo.
          </div>
        ) : (
          timelineItems.map((item) => (
            <div key={item.id} className="relative pb-6 last:pb-0">
              <div
                className={`absolute left-[-20px] w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  item.tipo === 'proposicao'
                    ? 'bg-primary border-primary'
                    : 'bg-accent border-accent'
                }`}
              >
                {item.tipo === 'proposicao' ? (
                  <FileText className="h-3 w-3 text-primary-foreground" />
                ) : (
                  <Vote className="h-3 w-3 text-accent-foreground" />
                )}
              </div>

              <div className="ml-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{item.titulo}</span>
                      <Badge
                        variant={item.tipo === 'proposicao' ? 'default' : 'accent'}
                        className="text-[10px]"
                      >
                        {item.tipo === 'proposicao' ? 'Projeto' : 'Votação'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.descricao}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusBadge(item.status) as 'success' | 'destructive' | 'secondary' | 'info' | 'warning'}
                    className="text-[10px] shrink-0"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={item.autorFoto} alt={item.autor} />
                      <AvatarFallback>{item.autor[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{item.autor}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
