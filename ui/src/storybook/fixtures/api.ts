import type {
  AuthorsPropositionOut,
  DashboardStatsOut,
  ParliamentarianOut,
  ProjectFavoriteOut,
  PropositionOut,
  RollCallVoteOut,
  SpeechesTranscriptOut,
  SpeechAnalysisOut,
  SpeechAnalysisSummaryOut,
} from "@/api/types";

const ts = "2025-01-15T12:00:00.000Z";

export const parliamentarians: ParliamentarianOut[] = [
  {
    id: 1001,
    type: "deputado",
    name: "Maria Silva",
    full_name: "Maria Silva Santos",
    party: "PT",
    state_elected: "SP",
    status: "Exercício",
    email: "maria@example.org",
    details: { UrlFotoParlamentar: "https://via.placeholder.com/80" },
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 1002,
    type: "senador",
    name: "João Costa",
    full_name: "João Costa Lima",
    party: "PSDB",
    state_elected: "RJ",
    status: "Exercício",
    details: null,
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 1003,
    type: "deputado",
    name: "Ana Souza",
    full_name: "Ana Souza",
    party: "MDB",
    state_elected: "MG",
    status: "Licenciado",
    details: null,
    created_at: ts,
    updated_at: ts,
  },
];

const propDetails: Record<string, unknown> = {
  processo: {
    documento: {
      autoria: [{ autor: "Maria Silva", siglaPartido: "PT", uf: "SP" }],
    },
  },
};

export const propositions: PropositionOut[] = [
  {
    id: 5001,
    proposition_acronym: "PL",
    proposition_number: 1234,
    presentation_year: 2025,
    title: "Institui o Programa Exemplo",
    proposition_description: "Dispõe sobre política pública de exemplo para Storybook.",
    presentation_date: "2025-01-10",
    current_status: "Tramitando",
    details: propDetails,
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 5002,
    proposition_acronym: "PEC",
    proposition_number: 45,
    presentation_year: 2024,
    title: "Altera dispositivo constitucional de teste",
    proposition_description: "Texto fictício para mock visual.",
    presentation_date: "2024-12-01",
    current_status: "Arquivada",
    details: propDetails,
    created_at: ts,
    updated_at: ts,
  },
];

export const authorshipsByParliamentarian: Record<number, AuthorsPropositionOut[]> = {
  1001: [
    {
      id: 1,
      parliamentarian_id: 1001,
      proposition_id: 5001,
      created_at: ts,
      updated_at: ts,
    },
    {
      id: 2,
      parliamentarian_id: 1001,
      proposition_id: 5002,
      created_at: ts,
      updated_at: ts,
    },
  ],
};

export const rollCallVotes: RollCallVoteOut[] = [
  {
    id: 9001,
    parliamentarian_id: 1001,
    proposition_id: 5001,
    proposition_title: "PL 1234/2025 — Programa Exemplo",
    vote: "Sim",
    description: "Votação simbólica",
    date_vote: "2025-01-12T18:00:00.000Z",
    parliamentarian_name: "Maria Silva",
    parliamentarian_party: "PT",
    parliamentarian_state_elected: "SP",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 9002,
    parliamentarian_id: 1001,
    proposition_id: 5002,
    proposition_title: "PEC 45/2024",
    vote: "Não",
    description: "Rejeitada em turno",
    date_vote: "2024-12-15T16:00:00.000Z",
    parliamentarian_name: "Maria Silva",
    parliamentarian_party: "PT",
    parliamentarian_state_elected: "SP",
    created_at: ts,
    updated_at: ts,
  },
];

export const speeches: SpeechesTranscriptOut[] = [
  {
    id: 7001,
    parliamentarian_id: 1001,
    date: "2025-01-05",
    session_number: "123",
    type: "Ordinária",
    summary: "Discurso resumido sobre educação e orçamento.",
    speech_link: "https://example.org/speech/7001",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 7002,
    parliamentarian_id: 1001,
    date: "2025-01-06",
    session_number: "124",
    type: "Extraordinária",
    summary: "Comentários sobre projeto em tramitação.",
    speech_link: null,
    created_at: ts,
    updated_at: ts,
  },
];

export const speechAnalysisSummary: SpeechAnalysisSummaryOut[] = [
  {
    id: 1,
    date: "2025-01-05",
    analysis_types: ["spacy"],
    keywords_count: 5,
    entities_count: 3,
    primary_keyword: {
      id: 1,
      keyword: "educação",
      term: "educação",
      frequency: 12,
      rank: 1,
      is_primary: true,
      analysis_type: "spacy",
    },
  },
  {
    id: 2,
    date: "2025-01-06",
    analysis_types: ["spacy"],
    keywords_count: 4,
    entities_count: 2,
    primary_keyword: {
      id: 2,
      keyword: "orçamento",
      term: "orçamento",
      frequency: 8,
      rank: 1,
      is_primary: true,
      analysis_type: "spacy",
    },
  },
];

export const speechAnalysisDetail: SpeechAnalysisOut = {
  speech_id: 7001,
  keywords: [
    {
      id: 1,
      keyword: "educação",
      term: "educação",
      frequency: 12,
      rank: 1,
      is_primary: true,
      analysis_type: "spacy",
    },
  ],
  entities: [
    {
      id: 1,
      label: "ORG",
      text: "Ministério",
      start_char: 0,
      end_char: 10,
      analysis_type: "spacy",
    },
  ],
};

export const projectFavorites: ProjectFavoriteOut[] = [
  {
    id: 1,
    projeto_id: 1,
    parliamentarian_id: 1001,
    created_at: ts,
    updated_at: ts,
  },
];

export const dashboardStats: DashboardStatsOut = {
  propositions_this_week: 3,
  attendance_avg_percent: 88.5,
  recent_votes_count: 12,
  speeches_count: 4,
};

export function findParliamentarian(id: number): ParliamentarianOut | undefined {
  return parliamentarians.find((p) => p.id === id);
}

export function findProposition(id: number): PropositionOut | undefined {
  return propositions.find((p) => p.id === id);
}
