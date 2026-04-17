import { useQueries, useQuery } from '@tanstack/react-query';
import { getSpeechAnalysis, listSpeechesTranscripts } from '@/api/endpoints';
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
      <ScrollArea className="h-full">
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando notas taquigráficas...</span>
        </div>
      </ScrollArea>
    );
  }

  if (isError) {
    return (
      <ScrollArea className="h-full">
        <div className="text-center py-8 text-muted-foreground text-sm">
          Falha ao carregar notas taquigráficas.
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <Table>
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
            <TableRow key={speech.id}>
              <TableCell className="text-sm text-muted-foreground">
                {speech.date ? new Date(speech.date).toLocaleDateString('pt-BR') : '—'}
              </TableCell>
              <TableCell className="text-sm">{speech.session_number ?? '—'}</TableCell>
              <TableCell className="text-sm">{speech.type ?? '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[360px] truncate">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{speech.summary ?? speech.speech_text ?? '—'}</span>
                  {speech.speech_link && (
                    <a
                      href={speech.speech_link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="shrink-0 text-primary hover:underline"
                    >
                      Link
                    </a>
                  )}
                </div>
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
    </ScrollArea>
  );
}
