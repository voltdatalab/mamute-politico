import { Parlamentar } from '@/types/parlamentar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Building2, MapPin } from 'lucide-react';

interface ParlamentarInfoProps {
  parlamentar: Parlamentar;
}

export function ParlamentarInfo({ parlamentar }: ParlamentarInfoProps) {
  return (
    <Card variant="primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Dados Cadastrais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarImage src={parlamentar.foto} alt={parlamentar.nome} />
            <AvatarFallback className="text-2xl">{parlamentar.nome[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-display text-xl font-bold">{parlamentar.nome}</h3>
              {(parlamentar.nome !== parlamentar.nomeCompleto) ? <p className="text-sm text-muted-foreground">{parlamentar.nomeCompleto}</p> : null}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={parlamentar.casa === 'camara' ? 'camara' : 'senado'}>
                {parlamentar.casa === 'camara' ? 'Deputado(a) Federal' : 'Senador(a)'}
              </Badge>
              <Badge variant="secondary">
                {parlamentar.partido.sigla} - {parlamentar.uf}
              </Badge>
              <Badge 
                variant={parlamentar.situacao === 'Exercício' ? 'success' : 'warning'}
              >
                {parlamentar.situacao}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{parlamentar.legislatura}ª Legislatura</span>
              </div>              
              {parlamentar.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{parlamentar.email}</span>
                </div>
              )}
              {parlamentar.telefone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{parlamentar.telefone}</span>
                </div>
              )}
              {parlamentar.gabinete && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{parlamentar.gabinete}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
