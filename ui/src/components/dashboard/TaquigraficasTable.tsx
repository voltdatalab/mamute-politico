import { useQueries, useQuery } from '@tanstack/react-query';
import { getSpeechAnalysis, listSpeechesTranscripts } from '@/api/endpoints';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface TaquigraficasTableProps {
  limit?: number;
  parliamentarianId?: number;
}

export function TaquigraficasTable({ limit = 20, parliamentarianId }: TaquigraficasTableProps) {
  const { data: speeches, isLoading, isError } = useQuery({
    queryKey: ['speeches-transcripts', limit, parliamentarianId],
    queryFn: () =>
      listSpeechesTranscripts({
        limit,
        offset: 0,
        parliamentarian_id: parliamentarianId,
      }),
  });

  const analysisQueries = useQueries({
    queries: (speeches ?? []).map((speech) => ({
      queryKey: ['speech-analysis', speech.id],
      queryFn: () => getSpeechAnalysis(speech.id),
    })),
  });

  const analysisBySpeechId = new Map(
    (speeches ?? []).map((speech, index) => [speech.id, analysisQueries[index]?.data])
  );

  if (isLoading) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando notas taquigráficas...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="text-center py-8 text-muted-foreground text-sm">
          Falha ao carregar notas taquigráficas.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Sessão</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Resumo</TableHead>
            <TableHead>Análise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(speeches ?? []).map((speech) => (
            <TableRow
              key={speech.id}
              role={speech.speech_link ? 'link' : undefined}
              tabIndex={speech.speech_link ? 0 : -1}
              onClick={() => {
                if (!speech.speech_link) return;
                window.open(speech.speech_link, '_blank', 'noopener,noreferrer');
              }}
              onKeyDown={(e) => {
                if (!speech.speech_link) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.open(speech.speech_link, '_blank', 'noopener,noreferrer');
                }
              }}
              className={[
                'hover:bg-muted/50',
                speech.speech_link
                  ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  : 'cursor-default',
              ].join(' ')}
            >
              <TableCell className="text-sm text-muted-foreground">
                {speech.date ? new Date(speech.date).toLocaleDateString('pt-BR') : '—'}
              </TableCell>
              <TableCell className="text-sm">{speech.session_number ?? '—'}</TableCell>
              <TableCell className="text-sm">{speech.type ?? '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[360px] truncate">
                {speech.summary ?? speech.speech_text ?? '—'}
              </TableCell>
              <TableCell>
                {analysisQueries.some((q) => q.isLoading) ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : analysisBySpeechId.get(speech.id) ? (
                  <div className="flex flex-wrap items-center gap-1">
                    {/* <Badge variant="secondary" className="text-[10px]">
                      KW: {analysisBySpeechId.get(speech.id)?.keywords.length ?? 0}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      ENT: {analysisBySpeechId.get(speech.id)?.entities.length ?? 0}
                    </Badge> */}
                    {(analysisBySpeechId.get(speech.id)?.keywords[0]?.term ??
                      analysisBySpeechId.get(speech.id)?.keywords[0]?.keyword) && (
                      <Badge variant="info" className="text-[10px]">
                        {(analysisBySpeechId.get(speech.id)?.keywords[0]?.term ??
                          analysisBySpeechId.get(speech.id)?.keywords[0]?.keyword) as string}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sem análise</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(speeches ?? []).length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhuma nota taquigráfica encontrada.
        </div>
      )}
    </div>
  );
}
