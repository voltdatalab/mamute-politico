import { http, HttpResponse } from "msw";
import {
  authorshipsByParliamentarian,
  dashboardStats,
  findParliamentarian,
  findProposition,
  parliamentarians,
  propositions,
  projectFavorites,
  rollCallVotes,
  speechAnalysisDetail,
  speechAnalysisSummary,
  speeches,
} from "@/storybook/fixtures/api";

function normPath(url: string): string {
  return new URL(url).pathname.replace(/\/+$/, "");
}

/** Exact `/api/...` segment path (normalized, no trailing slash). */
function exactApi(request: Request, restPath: string): boolean {
  const p = normPath(request.url);
  const r = restPath.startsWith("/") ? restPath.slice(1) : restPath;
  return p === `/api/${r}`;
}

export const storybookHandlers = [
  http.get(({ request }) => /\/api\/parliamentarians\/\d+$/.test(normPath(request.url)), ({ request }) => {
    const m = normPath(request.url).match(/\/parliamentarians\/(\d+)/);
    const id = m ? Number(m[1]) : NaN;
    const row = findParliamentarian(id);
    return row
      ? HttpResponse.json(row)
      : HttpResponse.json({ detail: "not found" }, { status: 404 });
  }),

  http.get(({ request }) => exactApi(request, "parliamentarians"), () =>
    HttpResponse.json(parliamentarians)
  ),

  http.get(({ request }) => /\/api\/propositions\/\d+/.test(normPath(request.url)), ({ request }) => {
    void request;
    const m = normPath(request.url).match(/\/propositions\/(\d+)/);
    const id = m ? Number(m[1]) : NaN;
    const row = findProposition(id);
    return row
      ? HttpResponse.json(row)
      : HttpResponse.json({ detail: "not found" }, { status: 404 });
  }),

  http.get(({ request }) => exactApi(request, "propositions"), () => HttpResponse.json(propositions)),

  http.get(({ request }) => exactApi(request, "authors-proposition"), ({ request }) => {
    const u = new URL(request.url);
    const pid = u.searchParams.get("parliamentarian_id");
    if (!pid) return HttpResponse.json([]);
    const list = authorshipsByParliamentarian[Number(pid)] ?? [];
    return HttpResponse.json(list);
  }),

  http.get(({ request }) => /\/api\/roll-call-votes\/\d+/.test(normPath(request.url)), ({ request }) => {
    const m = normPath(request.url).match(/\/roll-call-votes\/(\d+)/);
    const id = m ? Number(m[1]) : NaN;
    const row = rollCallVotes.find((r) => r.id === id);
    return row
      ? HttpResponse.json(row)
      : HttpResponse.json({ detail: "not found" }, { status: 404 });
  }),

  http.get(({ request }) => exactApi(request, "roll-call-votes"), () =>
    HttpResponse.json(rollCallVotes)
  ),

  http.get(({ request }) => /\/api\/speeches-transcripts\/\d+/.test(normPath(request.url)), ({ request }) => {
    const m = normPath(request.url).match(/\/speeches-transcripts\/(\d+)/);
    const id = m ? Number(m[1]) : NaN;
    const row = speeches.find((s) => s.id === id);
    return row
      ? HttpResponse.json(row)
      : HttpResponse.json({ detail: "not found" }, { status: 404 });
  }),

  http.get(({ request }) => exactApi(request, "speeches-transcripts"), () =>
    HttpResponse.json(speeches)
  ),

  http.get(({ request }) => /\/api\/analysis\/parliamentarian\/\d+/.test(normPath(request.url)), () =>
    HttpResponse.json(speechAnalysisSummary)
  ),

  http.get(({ request }) => {
    const p = normPath(request.url);
    if (p.includes("parliamentarian")) return false;
    return /\/api\/analysis\/\d+$/.test(p);
  }, () => HttpResponse.json(speechAnalysisDetail)),

  http.get(
    ({ request }) => /\/api\/projects\/\d+\/favorites/.test(normPath(request.url)),
    () => HttpResponse.json(projectFavorites)
  ),

  http.post(({ request }) => exactApi(request, "projects/me/favorites"), async ({ request }) => {
    try {
      const body = (await request.json()) as { parliamentarian_id?: number };
      const pid = body.parliamentarian_id ?? 0;
      const row: (typeof projectFavorites)[number] = {
        id: 999,
        projeto_id: 1,
        parliamentarian_id: pid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(row);
    } catch {
      return HttpResponse.json({ detail: "invalid" }, { status: 400 });
    }
  }),

  http.delete(({ request }) => /\/api\/projects\/me\/favorites\/\d+/.test(normPath(request.url)), () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get(({ request }) => exactApi(request, "projects/me/favorites"), () =>
    HttpResponse.json(projectFavorites)
  ),

  http.get(({ request }) => exactApi(request, "projects/me/dashboard-stats"), () =>
    HttpResponse.json(dashboardStats)
  ),
];
