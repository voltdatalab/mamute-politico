import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, PlusCircle, Send } from 'lucide-react';
import {
  streamChat,
  ChatbotStreamError,
  type ChatMessagePayload,
} from '@/api/chatbot';
import logoMamute from '@/assets/logo-mamute.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const exampleQuestions = [
  'Quais foram os projetos de lei sobre educação apresentados em 2024?',
  'Como votou o Deputado João Silva na reforma tributária?',
  'Quantas proposições foram aprovadas este mês?',
  'Quais senadores mais discursaram sobre meio ambiente?',
];

const MIN_QUESTION_LEN = 3;

const PesquisaIAPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Olá! Sou o assistente de pesquisa legislativa do Mamute Político. Posso ajudá-lo a encontrar informações sobre parlamentares, proposições, votações e discursos. Como posso ajudar você hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    if (question.length < MIN_QUESTION_LEN) {
      toast.error(`Digite pelo menos ${MIN_QUESTION_LEN} caracteres.`);
      return;
    }

    abortRef.current?.abort();

    const historyForApi: ChatMessagePayload[] = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    const userMessage: Message = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    const assistantId = `${Date.now()}-a`;

    setInput('');
    setMessages((prev) => {
      let next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === 'assistant' && last.content === '') {
        next = next.slice(0, -1);
      }
      return [
        ...next,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ];
    });

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    let pending = '';
    let rafId = 0;

    const flushPending = () => {
      if (!pending) return;
      const chunk = pending;
      pending = '';
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
      );
    };

    const scheduleFlush = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        flushPending();
      });
    };

    try {
      await streamChat({
        question,
        history: historyForApi,
        signal: controller.signal,
        onToken: (t) => {
          pending += t;
          scheduleFlush();
        },
      });
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      flushPending();
    } catch (e) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      pending = '';
      if (e instanceof DOMException && e.name === 'AbortError') {
        setMessages((prev) =>
          prev.filter((m) => !(m.id === assistantId && m.role === 'assistant' && !m.content))
        );
        return;
      }
      const msg =
        e instanceof ChatbotStreamError
          ? e.message
          : 'Falha ao contactar o assistente. Tente novamente.';
      toast.error(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.role === 'assistant' && !m.content
            ? { ...m, content: 'Não foi possível obter uma resposta agora.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = input.trim().length >= MIN_QUESTION_LEN;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #efeeee 0%, #efeeee 72%, #1b76ff 72%, #1b76ff 100%)' }}>
      <Header />

      <main className="container py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-[56px] font-bold text-[#393939]">Pesquisa IA</h1>
          <p className="mt-2 max-w-4xl text-[18px] font-normal leading-snug text-[#383838]">
            Consulte dados legislativos em linguagem natural. Acesse um banco de dados com as proposições, votações e discursos.
            Combine SQL + processamento de linguagem natural para uma abordagem híbrida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perguntas sugeridas */}
          <div className="mp-card bg-[#efeeee] p-6">
            <h2 className="mb-4 text-[48px] font-bold text-[#090909]">Perguntas sugeridas</h2>
            <div className="space-y-3">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setInput(question)}
                  className="mp-card w-full border border-black/10 bg-white p-4 text-left transition hover:bg-[#f5f5f5]"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-[15px] font-semibold text-[#383838] leading-tight">
                      {question}
                    </span>
                    <PlusCircle className="h-8 w-8 shrink-0 text-[#09e03b]" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat bot */}
          <div className="mp-card flex flex-col bg-[#efeeee]">
            <div className="flex items-center gap-3 border-b px-6 py-4">
              <Bot className="h-8 w-8 text-[#383838]" />
              <h2 className="text-[48px] font-bold text-[#090909]">Chat Bot</h2>
            </div>

            <ScrollArea className="flex-1 p-4" style={{ height: '360px' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-[#1b76ff] text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-[16px] p-4 ${
                        message.role === 'user' ? 'bg-[#09e03b] text-white' : 'bg-[#f5f5f5] text-[#383838]'
                      }`}
                    >
                      {message.role === 'assistant' && message.content === '' ? (
                        <div className="flex gap-1 py-1">
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="h-2 w-2 rounded-full bg-[#1b76ff] animate-bounce"
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className={`mt-2 text-xs ${message.role === 'user' ? 'text-white/70' : 'text-[#383838]/50'}`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-[#383838] text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta sobre dados legislativos..."
                  className="flex-1 rounded-full border-black/10 bg-[#efeeee]"
                  minLength={MIN_QUESTION_LEN}
                />
                <button
                  type="submit"
                  disabled={!canSend || isLoading}
                  className="flex items-center gap-2 rounded-full bg-[#1b76ff] px-6 py-2 text-[13px] font-bold uppercase text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  ENVIAR
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6">
        <div className="container flex items-center justify-between">
          <img src={logoMamute} alt="Mamute Político" className="h-[47px] w-auto brightness-0 invert" />
          <span className="text-[12px] font-medium text-white">
            © 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PesquisaIAPage;
