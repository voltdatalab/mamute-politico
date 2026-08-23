import { Loader2 } from 'lucide-react';
import { MetricsLayout } from '@/components/admin/MetricsLayout';
import { useCandidacyMonitors } from '@/hooks/useMetrics';
import { num } from '@/lib/adminFormat';

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="mp-card bg-white p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#383838]/50">{label}</p>
      <p className="mt-1 text-[26px] font-bold leading-none text-[#090909]">{value}</p>
    </div>
  );
}

export default function AdminCandidaciesPage() {
  const { data, isLoading } = useCandidacyMonitors();

  return (
    <MetricsLayout
      title="Candidatos acompanhados"
      subtitle="Quem os assinantes escolheram acompanhar na eleição de 2026 — por candidato, cargo e estado."
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
            <Kpi label="Assinantes acompanhando" value={num(data.totals.users)} />
            <Kpi label="Acompanhamentos" value={num(data.totals.links)} />
            <Kpi label="Candidaturas distintas" value={num(data.totals.candidacies)} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="mp-card overflow-x-auto bg-white p-6">
              <h2 className="mb-4 text-[18px] font-bold text-[#090909]">Mais acompanhados</h2>
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#383838]/10 text-[11px] uppercase tracking-wide text-[#383838]/50">
                    <th className="py-2 pr-3 font-semibold">Candidato</th>
                    <th className="py-2 pr-3 font-semibold">Cargo</th>
                    <th className="py-2 pr-3 font-semibold">Partido</th>
                    <th className="py-2 pr-3 font-semibold">UF</th>
                    <th className="py-2 pr-3 text-right font-semibold">Acompanham</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((c) => (
                    <tr key={c.candidacy_id} className="border-b border-[#383838]/5">
                      <td className="py-2 pr-3 text-[#090909]">{c.name || `#${c.candidacy_id}`}</td>
                      <td className="py-2 pr-3">
                        <span className="rounded-full bg-[#09a03b] px-2 py-0.5 text-[10px] font-bold text-white">
                          {c.office || '—'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[#383838]">{c.party || '—'}</td>
                      <td className="py-2 pr-3 text-[#383838]">{c.state}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{num(c.monitors)}</td>
                    </tr>
                  ))}
                  {data.top.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-[13px] text-[#383838]/50">
                        Nenhuma candidatura acompanhada ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-6">
              <div className="mp-card bg-white p-6">
                <h2 className="mb-4 text-[18px] font-bold text-[#090909]">Por cargo</h2>
                <ul className="space-y-2">
                  {data.by_office.map((o) => (
                    <li key={o.office} className="flex items-center justify-between text-[14px]">
                      <span className="text-[#383838]">{o.office}</span>
                      <span className="font-semibold text-[#090909]">{num(o.monitors)}</span>
                    </li>
                  ))}
                  {data.by_office.length === 0 && (
                    <li className="text-[13px] text-[#383838]/50">Sem acompanhamentos ainda.</li>
                  )}
                </ul>
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
                    <li className="text-[13px] text-[#383838]/50">Sem acompanhamentos ainda.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </MetricsLayout>
  );
}
