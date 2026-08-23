import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MetricsLayout } from '@/components/admin/MetricsLayout';
import { useMamutometro, useParliamentarians } from '@/hooks/useMetrics';
import { num } from '@/lib/adminFormat';

const houseLabel = (h: string) => (h === 'senado' ? 'Senado' : 'Câmara');

/** As três leituras do ranking do mamutômetro (agregado, nunca "quem marcou"). */
const VISOES = [
  { chave: 'people', rotulo: 'Pessoas' },
  { chave: 'total', rotulo: 'Mamutinhos' },
  { chave: 'average', rotulo: 'Média' },
] as const;

type Visao = (typeof VISOES)[number]['chave'];

export default function AdminParliamentariansPage() {
  const { data, isLoading } = useParliamentarians();
  const mamutometro = useMamutometro();
  const [visao, setVisao] = useState<Visao>('people');

  const rankingMamutometro = useMemo(() => {
    const linhas = [...(mamutometro.data?.top ?? [])];
    linhas.sort((a, b) => b[visao] - a[visao]);
    return linhas;
  }, [mamutometro.data, visao]);

  return (
    <MetricsLayout
      title="Parlamentares"
      subtitle="Mais monitorados e ranking do mamutômetro, por casa e por estado."
    >
      {isLoading && (
        <div className="mp-card flex items-center gap-2 bg-white p-6 text-[#383838]/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando…
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="mp-card bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#383838]/50">Câmara</p>
              <p className="mt-1 text-[26px] font-bold text-[#1b76ff]">{num(data.by_house.camara)}</p>
            </div>
            <div className="mp-card bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#383838]/50">Senado</p>
              <p className="mt-1 text-[26px] font-bold text-[#09a03b]">{num(data.by_house.senado)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="mp-card overflow-x-auto bg-white p-6">
              <h2 className="mb-4 text-[18px] font-bold text-[#090909]">Mais monitorados</h2>
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#383838]/10 text-[11px] uppercase tracking-wide text-[#383838]/50">
                    <th className="py-2 pr-3 font-semibold">Parlamentar</th>
                    <th className="py-2 pr-3 font-semibold">Casa</th>
                    <th className="py-2 pr-3 font-semibold">UF</th>
                    <th className="py-2 pr-3 text-right font-semibold">Monitores</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((p) => (
                    <tr key={p.parliamentarian_id} className="border-b border-[#383838]/5">
                      <td className="py-2 pr-3 text-[#090909]">{p.name || `#${p.parliamentarian_id}`}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                            p.house === 'senado' ? 'bg-[#09a03b]' : 'bg-[#1b76ff]'
                          }`}
                        >
                          {houseLabel(p.house)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[#383838]">{p.state || '—'}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{num(p.monitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mp-card bg-white p-6">
              <h2 className="mb-4 text-[18px] font-bold text-[#090909]">Por estado</h2>
              <ul className="space-y-2">
                {data.by_state.map((s) => (
                  <li key={s.state} className="flex items-center justify-between text-[14px]">
                    <span className="text-[#383838]">{s.state}</span>
                    <span className="font-semibold text-[#090909]">{num(s.monitors)}</span>
                  </li>
                ))}
                {data.by_state.length === 0 && (
                  <li className="text-[13px] text-[#383838]/50">Sem monitoramento ainda.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Ranking completo do mamutômetro — agregado por parlamentar; "quem
              marcou" continua irrespondível (SPEC-001, exceção de 23/08). */}
          <div className="mp-card overflow-x-auto bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[18px] font-bold text-[#090909]">Mamutômetro</h2>
              <div className="flex gap-1" role="tablist" aria-label="Visão do ranking do mamutômetro">
                {VISOES.map((v) => (
                  <button
                    key={v.chave}
                    type="button"
                    role="tab"
                    aria-selected={visao === v.chave}
                    onClick={() => setVisao(v.chave)}
                    className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${
                      visao === v.chave
                        ? 'bg-[#1b76ff] text-white'
                        : 'bg-[#1b76ff]/10 text-[#1b76ff] hover:bg-[#1b76ff]/20'
                    }`}
                  >
                    {v.rotulo}
                  </button>
                ))}
              </div>
            </div>
            {mamutometro.data && (
              <p className="mb-3 text-[12px] text-[#383838]/60">
                {num(mamutometro.data.totals.marks)} marcações ·{' '}
                {num(mamutometro.data.totals.mamutinhos)} mamutinhos em{' '}
                {num(mamutometro.data.totals.parliamentarians)} parlamentares. O nível é privado
                por assinante — aqui só o agregado.
              </p>
            )}
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#383838]/10 text-[11px] uppercase tracking-wide text-[#383838]/50">
                  <th className="py-2 pr-3 font-semibold">Parlamentar</th>
                  <th className="py-2 pr-3 font-semibold">Casa</th>
                  <th className="py-2 pr-3 font-semibold">UF</th>
                  <th className="py-2 pr-3 text-right font-semibold">Pessoas</th>
                  <th className="py-2 pr-3 text-right font-semibold">Mamutinhos</th>
                  <th className="py-2 pr-3 text-right font-semibold">Média</th>
                </tr>
              </thead>
              <tbody>
                {rankingMamutometro.map((p) => (
                  <tr key={p.parliamentarian_id} className="border-b border-[#383838]/5">
                    <td className="py-2 pr-3 text-[#090909]">{p.name || `#${p.parliamentarian_id}`}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                          p.house === 'senado' ? 'bg-[#09a03b]' : 'bg-[#1b76ff]'
                        }`}
                      >
                        {houseLabel(p.house)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-[#383838]">{p.state}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{num(p.people)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{num(p.total)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {p.average.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {rankingMamutometro.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-[13px] text-[#383838]/50">
                      Nenhuma marcação ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MetricsLayout>
  );
}
