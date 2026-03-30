import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Database,
  Search,
  Lightbulb,
} from 'lucide-react';
import {
  streamChat,
  ChatbotStreamError,
  type ChatMessagePayload,
} from '@/api/chatbot';

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
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
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
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        )
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
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      flushPending();
    } catch (e) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
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
            ? {
                ...m,
                content:
                  'Não foi possível obter uma resposta agora. Verifique se o serviço de chat está disponível.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const canSend =
    input.trim().length >= MIN_QUESTION_LEN && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            <Card variant="primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Pesquisa por IA
                </CardTitle>
                <CardDescription>
                  Consulte dados legislativos em linguagem natural
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Banco de Dados</p>
                    <p className="text-xs text-muted-foreground">
                      Acesso a proposições, votações e discursos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Search className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Abordagem Híbrida</p>
                    <p className="text-xs text-muted-foreground">
                      Combina SQL + processamento de linguagem natural
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Perguntas Sugeridas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExampleClick(question)}
                      disabled={isLoading}
                      className="w-full text-left p-3 rounded-lg text-sm bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat com Assistente Legislativo
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.role === 'assistant' && message.content === '' ? (
                            <div className="flex gap-1 py-1">
                              <span
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <span
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <span
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          <p
                            className={`text-xs mt-2 ${
                              message.role === 'user'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-accent text-accent-foreground">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Digite sua pergunta sobre dados legislativos..."
                      className="flex-1"
                      disabled={isLoading}
                      minLength={MIN_QUESTION_LEN}
                    />
                    <Button type="submit" disabled={!canSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  {input.trim().length > 0 && input.trim().length < MIN_QUESTION_LEN && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Mínimo de {MIN_QUESTION_LEN} caracteres.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PesquisaIAPage;
