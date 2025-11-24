BEGIN;

-- =====================================
-- Tabela principal de parlamentares
-- =====================================
CREATE TABLE parliamentarian (
    id                      BIGSERIAL PRIMARY KEY,
    type                    TEXT,           -- Deputado ou Senador
    parliamentarian_code    BIGINT,         -- id/codParlamentar
    name                    TEXT,
    full_name               TEXT,
    email                   TEXT,
    telephone               TEXT,
    cpf                     TEXT,
    status                  TEXT,
    party                   TEXT,
    state_of_birth          TEXT,
    city_of_birth           TEXT,
    state_elected           TEXT,
    site                    TEXT,
    education               TEXT,
    office_name             TEXT,
    office_building         TEXT,
    office_number           TEXT,
    office_floor            TEXT,
    office_email            TEXT,
    biography_link          TEXT,
    biography_text          TEXT,
    details                 JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Redes sociais
-- =====================================
CREATE TABLE social_network (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT,
    url         TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parliamentarian_social_network (
    id                  BIGSERIAL PRIMARY KEY,
    parliamentarian_id  BIGINT REFERENCES parliamentarian(id),
    social_network_id   BIGINT REFERENCES social_network(id),
    profile_url         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Presença em plenário
-- =====================================
CREATE TABLE plenary_attendance (
    id                              BIGSERIAL PRIMARY KEY,
    parliamentarian_id              BIGINT REFERENCES parliamentarian(id),
    date                            DATE,
    description                     TEXT,
    session_attendance              TEXT,
    daily_attendance_justification  TEXT,
    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Comissões
-- =====================================
CREATE TABLE committee (
    id              BIGSERIAL PRIMARY KEY,
    committee_code  TEXT,   -- código próprio
    name            TEXT,
    acronym         TEXT,
    summary         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE committee_attendance (
    id              BIGSERIAL PRIMARY KEY,
    parliamentarian_id  BIGINT REFERENCES parliamentarian(id),
    committee_id    BIGINT REFERENCES committee(id),
    date            DATE,
    description     TEXT,
    type            TEXT,
    link            TEXT,
    frequency       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Tipos de proposição
-- =====================================
CREATE TABLE proposition_type (
    id                      BIGSERIAL PRIMARY KEY,
    type                    TEXT,       -- senado ou camara
    proposition_type_code   TEXT,       -- pode ficar nulo
    acronym                 TEXT,
    name                    TEXT,
    description             TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Situações de proposição
-- =====================================
CREATE TABLE proposition_status (
    id                      BIGSERIAL PRIMARY KEY,
    proposition_status_code TEXT,
    acronym                 TEXT,
    name                    TEXT,
    description             TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Órgãos (agency)
-- =====================================
CREATE TABLE agency (
    id                  BIGSERIAL PRIMARY KEY,
    agency_code         BIGINT,
    agency_type_code    TEXT,
    agency_type         TEXT,
    acronym             TEXT,
    name                TEXT,
    alias               TEXT,
    publication_name    TEXT,
    short_name          TEXT,
    uri                 TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Proposições
-- =====================================
CREATE TABLE proposition (
    id                      BIGSERIAL PRIMARY KEY,
    proposition_code        BIGINT,
    title                   TEXT,
    link                    TEXT,
    proposition_acronym     TEXT,
    proposition_number      INTEGER,
    presentation_year       INTEGER,
    agency_id               BIGINT REFERENCES agency(id),
    proposition_type_id     BIGINT REFERENCES proposition_type(id),
    proposition_status_id   BIGINT REFERENCES proposition_status(id),
    current_status          TEXT,
    proposition_description TEXT,
    presentation_date       DATE,
    presentation_month      INTEGER,
    summary                 TEXT,
    details                 JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Autores de proposição
-- =====================================
CREATE TABLE authors_proposition (
    id                  BIGSERIAL PRIMARY KEY,
    parliamentarian_id  BIGINT REFERENCES parliamentarian(id),
    proposition_id      BIGINT REFERENCES proposition(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Votações nominais
-- =====================================
CREATE TABLE roll_call_votes (
    id                  BIGSERIAL PRIMARY KEY,
    parliamentarian_id  BIGINT REFERENCES parliamentarian(id),
    proposition_id      BIGINT REFERENCES proposition(id),
    vote                TEXT,
    description         TEXT,
    link                TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Discursos / notas taquigráficas
-- =====================================
CREATE TABLE speeches_transcripts (
    id                  BIGSERIAL PRIMARY KEY,
    parliamentarian_id  BIGINT REFERENCES parliamentarian(id),
    date                DATE,
    session_number      TEXT,
    type                TEXT,
    speech_link         TEXT,
    speech_text         TEXT,
    summary             TEXT,
    hour_minute         TEXT,
    publication_link    TEXT,
    publication_text    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE speeches_transcripts_proposition (
    id                      BIGSERIAL PRIMARY KEY,
    speeches_transcripts_id BIGINT REFERENCES speeches_transcripts(id),
    proposition_id          BIGINT REFERENCES proposition(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Vídeos e áudios (Câmara)
-- =====================================
CREATE TABLE videos_audios (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT,       -- video ou audio
    title       TEXT,
    url         TEXT,
    date        DATE,
    hour_minute TEXT,
    place       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;
