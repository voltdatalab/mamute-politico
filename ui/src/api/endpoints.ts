import { request } from './client';
import type {
  ParliamentarianOut,
  PropositionOut,
  RollCallVoteOut,
  SpeechesTranscriptOut,
  ProjectFavoriteOut,
  AuthorsPropositionOut,
  SpeechAnalysisSummaryOut,
  SpeechAnalysisOut,
} from './types';

export interface ListParliamentariansParams {
  limit?: number;
  offset?: number;
  party?: string;
}

export function listParliamentarians(
  params: ListParliamentariansParams = {}
): Promise<ParliamentarianOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.party) sp.set('party', params.party);
  const q = sp.toString();
  return request<ParliamentarianOut[]>(`/parliamentarians/${q ? `?${q}` : ''}`);
}

export function getParliamentarian(id: number): Promise<ParliamentarianOut> {
  return request<ParliamentarianOut>(`/parliamentarians/${id}`);
}

export interface ListPropositionsParams {
  limit?: number;
  offset?: number;
  year?: number;
  acronym?: string;
}

export function listPropositions(
  params: ListPropositionsParams = {}
): Promise<PropositionOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.year != null) sp.set('year', String(params.year));
  if (params.acronym) sp.set('acronym', params.acronym);
  const q = sp.toString();
  return request<PropositionOut[]>(`/propositions/${q ? `?${q}` : ''}`);
}

export function getProposition(id: number): Promise<PropositionOut> {
  return request<PropositionOut>(`/propositions/${id}`);
}

/** Fetches propositions for which the given parliamentarian is an author (via authors-proposition). */
export async function listPropositionsByParliamentarian(
  parliamentarianId: number,
  limit = 500
): Promise<PropositionOut[]> {
  const authorships = await listAuthorsPropositions({
    parliamentarian_id: parliamentarianId,
    limit,
    offset: 0,
  });
  const propositionIds = [...new Set(authorships.map((a) => a.proposition_id))];
  const propositions = await Promise.all(propositionIds.map((id) => getProposition(id)));
  return propositions;
}

export interface ListRollCallVotesParams {
  limit?: number;
  offset?: number;
  parliamentarian_id?: number;
  proposition_id?: number;
}

export function listRollCallVotes(
  params: ListRollCallVotesParams = {}
): Promise<RollCallVoteOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.parliamentarian_id != null)
    sp.set('parliamentarian_id', String(params.parliamentarian_id));
  if (params.proposition_id != null)
    sp.set('proposition_id', String(params.proposition_id));
  const q = sp.toString();
  return request<RollCallVoteOut[]>(`/roll-call-votes/${q ? `?${q}` : ''}`);
}

export function getRollCallVote(id: number): Promise<RollCallVoteOut> {
  return request<RollCallVoteOut>(`/roll-call-votes/${id}`);
}

export interface ListSpeechesTranscriptsParams {
  limit?: number;
  offset?: number;
  parliamentarian_id?: number;
  date_from?: string;
  date_to?: string;
}

export function listSpeechesTranscripts(
  params: ListSpeechesTranscriptsParams = {}
): Promise<SpeechesTranscriptOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.parliamentarian_id != null)
    sp.set('parliamentarian_id', String(params.parliamentarian_id));
  if (params.date_from) sp.set('date_from', params.date_from);
  if (params.date_to) sp.set('date_to', params.date_to);
  const q = sp.toString();
  return request<SpeechesTranscriptOut[]>(`/speeches-transcripts/${q ? `?${q}` : ''}`);
}

export function getSpeechesTranscript(id: number): Promise<SpeechesTranscriptOut> {
  return request<SpeechesTranscriptOut>(`/speeches-transcripts/${id}`);
}

export function getSpeechAnalysis(speechId: number): Promise<SpeechAnalysisOut> {
  return request<SpeechAnalysisOut>(`/analysis/${speechId}`);
}

export function listProjectFavorites(
  projectId: number,
  params: { limit?: number; offset?: number } = {}
): Promise<ProjectFavoriteOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  const q = sp.toString();
  return request<ProjectFavoriteOut[]>(
    `/projects/${projectId}/favorites${q ? `?${q}` : ''}`
  );
}

export interface ListAuthorsPropositionParams {
  limit?: number;
  offset?: number;
  parliamentarian_id?: number;
  proposition_id?: number;
}

export function listAuthorsPropositions(
  params: ListAuthorsPropositionParams = {}
): Promise<AuthorsPropositionOut[]> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.parliamentarian_id != null)
    sp.set('parliamentarian_id', String(params.parliamentarian_id));
  if (params.proposition_id != null)
    sp.set('proposition_id', String(params.proposition_id));
  const q = sp.toString();
  return request<AuthorsPropositionOut[]>(`/authors-proposition/${q ? `?${q}` : ''}`);
}

export interface ListParliamentarianSpeechAnalysisParams {
  analysis_type?: 'spacy' | 'chatgpt';
  page?: number;
  page_size?: number;
}

export function listParliamentarianSpeechAnalysis(
  parliamentarianCode: number,
  params: ListParliamentarianSpeechAnalysisParams = {}
): Promise<SpeechAnalysisSummaryOut[]> {
  const sp = new URLSearchParams();
  if (params.analysis_type) sp.set('analysis_type', params.analysis_type);
  // if (params.page != null) sp.set('page', String(params.page));
  // if (params.page_size != null) sp.set('page_size', String(params.page_size));
  const q = sp.toString();
  return request<SpeechAnalysisSummaryOut[]>(
    `/analysis/parliamentarian/${parliamentarianCode}${q ? `?${q}` : ''}`
  );
}
