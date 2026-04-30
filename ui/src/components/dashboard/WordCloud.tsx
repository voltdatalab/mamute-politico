import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listParliamentarianSpeechAnalysis } from '@/api/endpoints';
import type { SpeechAnalysisSummaryOut } from '@/api/types';
import { Loader2 } from 'lucide-react';

// TODO: Extract to a config file
const STOPWORDS = new Set(
  'aprovação projeto aprovamos pec relator presidente obrigado sessão senador senadora a o e de da do em um uma os as dos das ao aos no na nos nas pelo pela pelos pelas que para por com sem sob sobre até durante'.split(' ')
);

interface CloudWord {
  text: string;
  frequency: number;
  rank: number;
}

function extractWordsFromAnalysis(
  analysisSummaries: SpeechAnalysisSummaryOut[],
  maxWords = 20
): CloudWord[] {
  const aggregated = new Map<string, { frequency: number; rank: number }>();

  for (const analysis of analysisSummaries) {
    const keyword = analysis.primary_keyword;
    if (!keyword) continue;

    const rawTerm = keyword.term || keyword.keyword;
    if (!rawTerm) continue;

    const term = rawTerm
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .trim();

    if (!term || STOPWORDS.has(term) || term.length <= 2) continue;

    const current = aggregated.get(term);
    if (current) {
      current.frequency += keyword.frequency ?? 0;
      current.rank = Math.min(current.rank, keyword.rank ?? Number.MAX_SAFE_INTEGER);
    } else {
      aggregated.set(term, {
        frequency: keyword.frequency ?? 0,
        rank: keyword.rank ?? Number.MAX_SAFE_INTEGER,
      });
    }
  }

  return Array.from(aggregated.entries())
    .map(([text, values]) => ({
      text,
      frequency: values.frequency,
      rank: Number.isFinite(values.rank) ? values.rank : 999,
    }))
    .sort((a, b) => b.frequency - a.frequency || a.rank - b.rank)
    .slice(0, maxWords);
}

interface WordCloudProps {
  parliamentarianId?: number;
}

export function WordCloud({ parliamentarianId }: WordCloudProps) {
  const { data: analysisSummaries, isLoading, isError } = useQuery({
    queryKey: ['analysis-parliamentarian', parliamentarianId],
    queryFn: () =>
      listParliamentarianSpeechAnalysis(parliamentarianId!, {
        page: 1,
        page_size: 100,
      }),
    enabled: parliamentarianId != null && parliamentarianId > 0,
  });

  const words = useMemo(() => {
    if (!analysisSummaries?.length) return [];
    return extractWordsFromAnalysis(analysisSummaries);
  }, [analysisSummaries]);

  if (parliamentarianId == null || parliamentarianId <= 0) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 p-4 text-muted-foreground text-sm">
        Selecione um parlamentar para ver os temas dos discursos.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (isError || !words.length) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 p-4 text-muted-foreground text-sm">
        Nenhuma análise de discurso encontrada para este parlamentar.
      </div>
    );
  }

  const maxFrequency = Math.max(...words.map((p) => p.frequency));
  const minFrequency = Math.min(...words.map((p) => p.frequency));
  const frequencyRange = maxFrequency - minFrequency || 1;
  const maxRank = Math.max(...words.map((p) => p.rank));
  const minRank = Math.min(...words.map((p) => p.rank));
  const rankRange = maxRank - minRank || 1;

  const getWeight = (frequency: number, rank: number) => {
    const normalizedFrequency = (frequency - minFrequency) / frequencyRange;
    const normalizedRank = (maxRank - rank) / rankRange;
    return normalizedFrequency * 0.75 + normalizedRank * 0.25;
  };

  const getFontSize = (frequency: number, rank: number) => {
    const weight = getWeight(frequency, rank);
    return 14 + weight * 30;
  };

  // const getOpacity = (frequency: number, rank: number) => {
  //   const weight = getWeight(frequency, rank);
  //   return 0.45 + weight * 0.55;
  // };

  const colors = [
    'text-primary',
    'text-accent',
    'text-info',
    'text-warning',
    'text-success',
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4">
      {words.map((word, index) => (
        <span
          key={word.text}
          className={`${colors[index % colors.length]} font-medium uppercase hover:scale-110 transition-transform cursor-default`}
          style={{
            fontSize: `${getFontSize(word.frequency, word.rank)}px`,
            // opacity: getOpacity(word.frequency, word.rank),
          }}
        >
          {word.text}{' '}
          <small>
            <small>
              <small>
                <small>({word.frequency})</small>
              </small>
            </small>
          </small>
        </span>
      ))}
    </div>
  );
}
