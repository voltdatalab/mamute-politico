import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParlamentarInfo } from '@/components/dashboard/ParlamentarInfo';
import { WordCloud } from '@/components/dashboard/WordCloud';
import { ProposicoesList } from '@/components/dashboard/ProposicoesList';
import { ProposicoesTable } from '@/components/dashboard/ProposicoesTable';
import { VotacoesTable } from '@/components/dashboard/VotacoesTable';
import { TaquigraficasTable } from '@/components/dashboard/TaquigraficasTable';
import { getParliamentarian } from '@/api/endpoints';
import { mapParliamentarianOutToParlamentar } from '@/api/mappers';
import { ApiError } from '@/api/client';
import { ArrowLeft, Cloud, FileText, Vote, Loader2 } from 'lucide-react';

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    if (value.message && value.message !== '[object Object]') return value.message;
    const maybeResponseData = (value as Error & { response?: { data?: unknown } }).response?.data;
    if (maybeResponseData != null && typeof maybeResponseData === 'object') {
      const detail = (maybeResponseData as { detail?: unknown }).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === 'string') {
        return detail[0];
      }
    }
    return 'Falha ao carregar dados do parlamentar.';
  }
  if (typeof value === 'string') return value;
  if (value != null && typeof value === 'object') {
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    try {
      return JSON.stringify(value);
    } catch {
      return 'Falha ao carregar dados do parlamentar.';
    }
  }
  return 'Falha ao carregar dados do parlamentar.';
};

const ParlamentarDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id != null ? Number(id) : NaN;
  const isIdValid = Number.isInteger(numericId) && numericId > 0;

  const { data: raw, isLoading, isError, error } = useQuery({
    queryKey: ['parliamentarian', id],
    queryFn: () => getParliamentarian(numericId),
    enabled: isIdValid,
  });

  const parlamentar = raw != null ? mapParliamentarianOutToParlamentar(raw) : null;
  const parliamentarianCode =
    raw?.parliamentarian_code != null && raw.parliamentarian_code > 0
      ? raw.parliamentarian_code
      : numericId;

  if (!isIdValid) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom,#e0bb3f_0%,#e0bb3f_74%,#3d825b_74%,#3d825b_100%)]">
        <Header />
        <main className="container py-8">
          <div className="mx-auto max-w-xl rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-md">
            <h1 className="mb-3 text-4xl font-extrabold text-[#1f2b44]">Parlamentar não encontrado</h1>
            <p className="mb-6 text-base text-muted-foreground">O identificador informado não é válido para esta rota.</p>
            <Link to="/selecao">
              <Button variant="hero" className="px-8">Voltar à seleção</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom,#e0bb3f_0%,#e0bb3f_74%,#3d825b_74%,#3d825b_100%)]">
        <Header />
        <main className="container py-8">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-[28px] border border-black/10 bg-white p-8 text-muted-foreground shadow-md">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg font-medium">Carregando parlamentar...</span>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !parlamentar) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom,#e0bb3f_0%,#e0bb3f_74%,#3d825b_74%,#3d825b_100%)]">
        <Header />
        <main className="container py-8">
          <div className="mx-auto max-w-xl rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-md">
            <h1 className="mb-3 text-5xl font-extrabold text-[#1f2b44]">
              {notFound ? 'Parlamentar não encontrado' : 'Falha ao carregar'}
            </h1>
            {!notFound && (
              <p className="mb-6 text-base text-muted-foreground">
                {toErrorMessage(error)}
              </p>
            )}
            <Link to="/selecao">
              <Button variant="hero" className="px-8">Voltar à seleção</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#e0bb3f_0%,#e0bb3f_74%,#3d825b_74%,#3d825b_100%)]">
      <Header />
      
      <main className="container py-8 space-y-6">
        {/* Back button */}
        <Link to="/selecao">
          <Button variant="outline" className="gap-2 bg-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Top Row - Info, Word Cloud, Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ParlamentarInfo parlamentar={parlamentar} />
          
          <Card variant="highlight">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Temas dos Discursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WordCloud parliamentarianId={parliamentarianCode} />
            </CardContent>
          </Card>
          
          <Card variant="accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Projetos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <ProposicoesList limit={3} parliamentarianId={id} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Tabs for Propositions, Votes and Stenographic Notes */}
        <Tabs defaultValue="proposicoes" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="proposicoes" className="gap-2">
              <FileText className="h-4 w-4" />
              Proposições
            </TabsTrigger>
            <TabsTrigger value="votacoes" className="gap-2">
              <Vote className="h-4 w-4" />
              Votações
            </TabsTrigger>
            <TabsTrigger value="taquigraficas" className="gap-2">
              <FileText className="h-4 w-4" />
              Taquigráficas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="proposicoes" className="mt-6">
            <Card className="border-black/10 bg-white">
              <CardHeader>
                <CardTitle>Proposições do Parlamentar</CardTitle>
              </CardHeader>
              <CardContent>
                <ProposicoesTable parliamentarianId={id} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="votacoes" className="mt-6">
            <Card className="border-black/10 bg-white">
              <CardHeader>
                <CardTitle>Histórico de Votações</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <VotacoesTable parliamentarianId={numericId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taquigraficas" className="mt-6">
            <Card className="border-black/10 bg-white">
              <CardHeader>
                <CardTitle>Notas Taquigráficas</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <TaquigraficasTable parliamentarianId={numericId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParlamentarDashboard;
