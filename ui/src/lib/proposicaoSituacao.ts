/** Normalize proposition status strings from the API for classification. */
function normalizeSituacao(situacao: string): string {
  return situacao
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export type ProposicaoSituacaoTone = 'success' | 'destructive' | 'warning' | 'info' | 'neutral';

/**
 * Maps API status text to a tone. Uses substring checks so values like
 * "Encerrada (Aprovado)" or "APROVADO" still classify correctly.
 */
export function getProposicaoSituacaoTone(situacao: string): ProposicaoSituacaoTone {
  const s = normalizeSituacao(situacao);
  if (!s || s === '—' || s === '-') return 'neutral';

  if (s.includes('aprov')) return 'success';
  if (s.includes('rejeit') || s.includes('nao aprov') || s.includes('não aprov') || s.includes('vetad')) {
    return 'destructive';
  }
  if (s.includes('arquiv') || s.includes('retirad')) return 'neutral';
  if (s.includes('aguard') || s.includes('pendent')) return 'neutral'; //was warning
  if (s.includes('tramit') || s.includes('em analise') || s.includes('em análise') || s.includes('apresentad')) {
    //return 'info';
    return 'neutral';
  }
  if (s.includes('sancao') || s.includes('sanção')) return 'warning';

  return 'neutral';
}

export function getProposicaoSituacaoBadgeVariant(
  situacao: string
): 'success' | 'destructive' | 'secondary' | 'info' | 'warning' {
  switch (getProposicaoSituacaoTone(situacao)) {
    case 'success':
      return 'success';
    case 'destructive':
      return 'destructive';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'secondary';
  }
}

/** Text color classes aligned with `Timeline` status styling (Dashboard geral). */
export function getProposicaoSituacaoTextClass(situacao: string): string {
  switch (getProposicaoSituacaoTone(situacao)) {
    case 'success':
      return 'text-[#09e03b]';
    case 'destructive':
      return 'text-[#ff0004]';
    case 'warning':
      return 'text-[#c2410c]';
    case 'info':
      return 'text-[#1b76ff]';
    default:
      return 'text-[#383838]';
  }
}
