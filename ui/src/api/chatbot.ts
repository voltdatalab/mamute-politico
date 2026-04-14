/** Client for Mamute Político chatbot (FastAPI); same-origin POST to `/chat/chatbot/stream` (proxy routes /chat to the chatbot). Do not use the main API `request()` helper (different base, JWT). */

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChatBody {
  question: string;
  history: ChatMessagePayload[];
}

export class ChatbotStreamError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ChatbotStreamError';
  }
}

type SsePayload =
  | { type: 'token'; value: string }
  | { type: 'end' }
  | { type: 'error'; message: string }
  | { type: 'cancel' };

/** Relative URL; browser resolves against the page origin. */
export const CHATBOT_STREAM_PATH = '/chat/chatbot/stream';

export function getChatbotStreamUrl(): string {
  return CHATBOT_STREAM_PATH;
}

export interface StreamChatOptions extends StreamChatBody {
  signal?: AbortSignal;
  onToken: (chunk: string) => void;
}

/**
 * POST stream endpoint; parses SSE `data: {...}` lines from the chatbot backend.
 */
export async function streamChat(options: StreamChatOptions): Promise<void> {
  const { question, history, signal, onToken } = options;

  const res = await fetch(getChatbotStreamUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ question, history }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText || `Erro ${res.status}`;
    try {
      const body = JSON.parse(text) as { detail?: unknown; message?: unknown };
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) {
        message = body.detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join('; ');
      } else if (body.message != null) message = String(body.message);
    } catch {
      /* use message as text */
    }
    throw new ChatbotStreamError(message, res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new ChatbotStreamError('Resposta sem corpo');
  }

  const decoder = new TextDecoder();
  let carry = '';

  const handleEventBlock = (block: string) => {
    for (const line of block.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const json = line.startsWith('data: ') ? line.slice(6) : line.slice(5).trimStart();
      if (!json) continue;
      let payload: SsePayload;
      try {
        payload = JSON.parse(json) as SsePayload;
      } catch {
        continue;
      }
      if (payload.type === 'token' && typeof payload.value === 'string') {
        onToken(payload.value);
      } else if (payload.type === 'error') {
        throw new ChatbotStreamError(
          typeof payload.message === 'string' ? payload.message : 'Erro no fluxo do assistente'
        );
      } else if (payload.type === 'cancel') {
        throw new ChatbotStreamError('Resposta cancelada');
      }
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      carry += decoder.decode(value, { stream: true });
      const chunks = carry.split('\n\n');
      carry = chunks.pop() ?? '';
      for (const block of chunks) {
        if (block.trim()) handleEventBlock(block);
      }
    }
    if (carry.trim()) handleEventBlock(carry);
  } finally {
    reader.releaseLock();
  }
}
