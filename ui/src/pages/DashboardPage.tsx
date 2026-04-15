import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/dashboard/Timeline';
import { ProposicoesList } from '@/components/dashboard/ProposicoesList';
import { VotacoesTable } from '@/components/dashboard/VotacoesTable';
import { Badge } from '@/components/ui/badge';
import { listParliamentarians, listProjectFavorites, getParliamentarian } from '@/api/endpoints';
import { mapParliamentarianOutToParlamentar } from '@/api/mappers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  FileText,
  Users,
  Vote,
  TrendingUp,
  Loader2,
} from 'lucide-react';

// TODO: Remove this once we have a project ID
const projectId = undefined;

const DashboardPage = () => {
  const favoritesQuery = useQuery({
    queryKey: ['project-favorites', projectId],
    queryFn: () => listProjectFavorites(projectId!),
    enabled: projectId != null && !isNaN(projectId),
  });

  const favoriteIds = favoritesQuery.data?.map((f) => f.parliamentarian_id) ?? [];
  const parliamentarianQueries = useQueries({
    queries: favoriteIds.map((id) => ({
      queryKey: ['parliamentarian', id],
      queryFn: () => getParliamentarian(id),
    })),
  });

  const fallbackListQuery = useQuery({
    queryKey: ['parliamentarians', 'dashboard-fallback'],
    queryFn: () => listParliamentarians({ limit: 4, offset: 0 }),
    enabled: projectId == null || !favoritesQuery.isSuccess || favoriteIds.length === 0,
  });

  const monitorados =
    projectId != null && favoriteIds.length > 0
      ? parliamentarianQueries
          .filter((q) => q.data != null)
          .map((q) => mapParliamentarianOutToParlamentar(q.data!))
      : fallbackListQuery.data != null
        ? fallbackListQuery.data.map(mapParliamentarianOutToParlamentar)
        : [];

  const isLoadingMonitorados =
    projectId != null
      ? favoritesQuery.isLoading || parliamentarianQueries.some((q) => q.isLoading)
      : fallbackListQuery.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard Geral</h1>
            <p className="text-muted-foreground">
              Acompanhe a atividade dos parlamentares monitorados
            </p>
          </div>
          <Badge variant="accent" className="gap-2 px-4 py-2">
            <Users className="h-4 w-4" />
            {monitorados.length} parlamentares monitorados
          </Badge>
        </div>

        {/* Monitored Parliamentarians */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Parlamentares Monitorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMonitorados ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
            <div className="flex gap-4 flex-wrap">
              {monitorados.map((parlamentar) => (
                <Link
                  key={parlamentar.id}
                  to={`/parlamentar/${parlamentar.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={parlamentar.foto} alt={parlamentar.nome} />
                    <AvatarFallback>{parlamentar.nome[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{parlamentar.nome}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={parlamentar.casa === 'camara' ? 'camara' : 'senado'} className="text-[10px] px-1.5 py-0">
                        {parlamentar.casa === 'camara' ? 'Câmara' : 'Senado'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {parlamentar.partido.sigla}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {monitorados.length === 0 && !isLoadingMonitorados && (
                <p className="text-sm text-muted-foreground py-4">
                  Nenhum parlamentar monitorado.
                </p>
              )}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Linha do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <Timeline />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card className="h-[290px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Últimos Projetos
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <ProposicoesList limit={3} />
              </CardContent>
            </Card>

            <Card className="h-[290px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Remove hardcoded values */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">23</p>
                    <p className="text-xs text-muted-foreground">Projetos esta semana</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-accent">15</p>
                    <p className="text-xs text-muted-foreground">Votações recentes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-success">87%</p>
                    <p className="text-xs text-muted-foreground">Presença média</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-warning">12</p>
                    <p className="text-xs text-muted-foreground">Discursos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voting History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Últimas Votações
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <VotacoesTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;
