import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MetricsLayout } from '@/components/admin/MetricsLayout';
import { UsersTable } from '@/components/admin/UsersTable';
import {
  useCandidacyMonitors,
  useMamutometro,
  useMetricsOverview,
  useMetricsUsers,
  useParliamentarians,
  useTools,
} from '@/hooks/useMetrics';
import { brl, num } from '@/lib/adminFormat';

/**
 * As três leituras do ranking do mamutômetro. "Pessoas" conta quantos
 * assinantes marcaram (3 mamutes de um + 2 de outro = 2 pessoas); "mamutinhos"
 * soma os níveis (= 5); "média" divide um pelo outro (= 2,5).
 */
const VISOES_MAMUTOMETRO = [
  { chave: 'people', rotulo: 'Pessoas' },
  { chave: 'total', rotulo: 'Mamutinhos' },
  { chave: 'average', rotulo: 'Média' },
] as const;

type VisaoMamutometro = (typeof VISOES_MAMUTOMETRO)[number]['chave'];

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className="mp-card bg-white p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#383838]/50">{label}</p>
      <p className={`mt-1 text-[26px] font-bold leading-none ${tone === 'warn' ? 'text-[#ff0004]' : 'text-[#090909]'}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdminMetricsPage() {
  const overview = useMetricsOverview();
  const usersQuery = useMetricsUsers({ limit: 20 });
  const tools = useTools();
  const parl = useParliamentarians();
  const mamutometro = useMamutometro();
  const candidacies = useCandidacyMonitors();
  const users = usersQuery.data?.users ?? [];

  const [visaoMamutometro, setVisaoMamutometro] = useState<VisaoMamutometro>('people');
  const topMamutometro = useMemo(() => {
    const linhas = [...(mamutometro.data?.top ?? [])];
    linhas.sort((a, b) => b[visaoMamutometro] - a[visaoMamutometro]);
    return linhas.slice(0, 5);
  }, [mamutometro.data, visaoMamutometro]);

  return (
    <MetricsLayout
      title="Métricas & Insights"
      subtitle="Visão geral do uso do sistema no mês corrente."
    >
      {overview.isLoading && (
        <div className="mp-card flex items-center gap-2 bg-white p-6 text-[#383838]/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando métricas…
        </div>
      )}

      {overview.data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Kpi label="Usuários" value={num(overview.data.usuarios)} />
          <Kpi label="Consultas IA (mês)" value={num(overview.data.consultas_mes)} />
          <Kpi label="Receita (mês)" value={brl(overview.data.receita_mes)} />
          <Kpi label="Margem (mês)" value={brl(overview.data.margem_mes)} />
          <Kpi label="Custo IA (mês)" value={brl(overview.data.custo_mes_brl)} />
          <Kpi label="Parlamentares monitorados" value={num(overview.data.parlamentares_monitorados)} />
          <Kpi label="Tokens (mês)" value={num(overview.data.tokens_mes)} />
          <Kpi
            label="Acima do plano"
            value={num(overview.data.usuarios_acima_do_plano)}
            tone={overview.data.usuarios_acima_do_plano > 0 ? 'warn' : undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ferramentas mais usadas (resumo) */}
        <div className="mp-card bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#090909]">Ferramentas mais usadas</h2>
            <Link to="/admin/metrics/ferramentas" className="text-[12px] font-semibold text-[#1b76ff] no-underline hover:underline">
              ver tudo
            </Link>
          </div>
          <ul className="space-y-2">
            {(tools.data?.tools ?? []).slice(0, 5).map((t) => (
              <li key={t.tool} className="flex items-center justify-between text-[14px]">
                <span className="text-[#383838]">{t.tool}</span>
                <span className="font-semibold text-[#090909]">{num(t.uses)}</span>
              </li>
            ))}
            {tools.data && tools.data.tools.length === 0 && (
              <li className="text-[13px] text-[#383838]/50">Sem uso registrado ainda.</li>
            )}
          </ul>
        </div>

        {/* Parlamentares mais monitorados (resumo) */}
        <div className="mp-card bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#090909]">Parlamentares monitorados</h2>
            <Link to="/admin/metrics/parlamentares" className="text-[12px] font-semibold text-[#1b76ff] no-underline hover:underline">
              ver tudo
            </Link>
          </div>
          {parl.data && (
            <>
              <div className="mb-3 flex gap-2 text-[12px]">
                <span className="rounded-full bg-[#1b76ff]/10 px-3 py-1 font-bold text-[#1b76ff]">
                  Câmara {num(parl.data.by_house.camara)}
                </span>
                <span className="rounded-full bg-[#09a03b]/10 px-3 py-1 font-bold text-[#09a03b]">
                  Senado {num(parl.data.by_house.senado)}
                </span>
              </div>
              <ul className="space-y-2">
                {parl.data.top.slice(0, 5).map((p) => (
                  <li key={p.parliamentarian_id} className="flex items-center justify-between text-[14px]">
                    <span className="text-[#383838]">
                      {p.name || `#${p.parliamentarian_id}`}
                      <span className="text-[#383838]/40"> · {p.state || '—'}</span>
                    </span>
                    <span className="font-semibold text-[#090909]">{num(p.monitors)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mamutômetro — três leituras do mesmo ranking */}
        <div className="mp-card bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#090909]">Mamutômetro</h2>
            <div className="flex items-center gap-3">
            <Link to="/admin/metrics/parlamentares" className="text-[12px] font-semibold text-[#1b76ff] no-underline hover:underline">
              ver tudo
            </Link>
            <div className="flex gap-1" role="tablist" aria-label="Visão do ranking do mamutômetro">
              {VISOES_MAMUTOMETRO.map((visao) => (
                <button
                  key={visao.chave}
                  type="button"
                  role="tab"
                  aria-selected={visaoMamutometro === visao.chave}
                  onClick={() => setVisaoMamutometro(visao.chave)}
                  className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${
                    visaoMamutometro === visao.chave
                      ? 'bg-[#1b76ff] text-white'
                      : 'bg-[#1b76ff]/10 text-[#1b76ff] hover:bg-[#1b76ff]/20'
                  }`}
                >
                  {visao.rotulo}
                </button>
              ))}
            </div>
            </div>
          </div>
          {mamutometro.data && (
            <>
              <p className="mb-3 text-[12px] text-[#383838]/60">
                {num(mamutometro.data.totals.marks)} marcações de assinantes ·{' '}
                {num(mamutometro.data.totals.mamutinhos)} mamutinhos em{' '}
                {num(mamutometro.data.totals.parliamentarians)} parlamentares
              </p>
              <ul className="space-y-2">
                {topMamutometro.map((p) => (
                  <li key={p.parliamentarian_id} className="flex items-center justify-between text-[14px]">
                    <span className="text-[#383838]">
                      {p.name || `#${p.parliamentarian_id}`}
                      <span className="text-[#383838]/40"> · {p.state}</span>
                    </span>
                    <span className="font-semibold text-[#090909]">
                      {visaoMamutometro === 'average'
                        ? p.average.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                        : num(p[visaoMamutometro])}
                    </span>
                  </li>
                ))}
                {topMamutometro.length === 0 && (
                  <li className="text-[13px] text-[#383838]/50">Nenhuma marcação ainda.</li>
                )}
              </ul>
            </>
          )}
        </div>

        {/* Candidaturas mais acompanhadas (eleição 2026) */}
        <div className="mp-card bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#090909]">Candidatos acompanhados</h2>
            <div className="flex items-center gap-3">
              {candidacies.data && (
                <span className="text-[12px] text-[#383838]/60">
                  {num(candidacies.data.totals.users)} assinantes ·{' '}
                  {num(candidacies.data.totals.links)} acompanhamentos
                </span>
              )}
              <Link to="/admin/metrics/candidatos" className="text-[12px] font-semibold text-[#1b76ff] no-underline hover:underline">
                ver tudo
              </Link>
            </div>
          </div>
          {candidacies.data && (
            <>
              <div className="mb-3 flex flex-wrap gap-2 text-[12px]">
                {candidacies.data.by_office.map((o) => (
                  <span key={o.office} className="rounded-full bg-[#09a03b]/10 px-3 py-1 font-bold text-[#09a03b]">
                    {o.office} {num(o.monitors)}
                  </span>
                ))}
                {candidacies.data.by_state.slice(0, 5).map((s) => (
                  <span key={s.state} className="rounded-full bg-[#1b76ff]/10 px-3 py-1 font-bold text-[#1b76ff]">
                    {s.state} {num(s.monitors)}
                  </span>
                ))}
              </div>
              <ul className="space-y-2">
                {candidacies.data.top.slice(0, 5).map((c) => (
                  <li key={c.candidacy_id} className="flex items-center justify-between text-[14px]">
                    <span className="text-[#383838]">
                      {c.name || `#${c.candidacy_id}`}
                      <span className="text-[#383838]/40">
                        {' '}· {[c.office, c.party, c.state].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="font-semibold text-[#090909]">{num(c.monitors)}</span>
                  </li>
                ))}
                {candidacies.data.top.length === 0 && (
                  <li className="text-[13px] text-[#383838]/50">
                    Nenhuma candidatura acompanhada ainda.
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#090909]">Top 20 usuários por custo</h2>
        <Link to="/admin/metrics/por-usuario" className="text-[13px] font-semibold text-[#1b76ff] no-underline hover:underline">
          ver todos / filtrar →
        </Link>
      </div>
      {users.length > 0 ? (
        <UsersTable users={users} rate={usersQuery.data?.usd_brl_rate} />
      ) : (
        <div className="mp-card bg-white p-6 text-[#383838]/60">
          Sem dados de uso ainda (o registro depende da quota estar ligada).
        </div>
      )}
    </MetricsLayout>
  );
}
