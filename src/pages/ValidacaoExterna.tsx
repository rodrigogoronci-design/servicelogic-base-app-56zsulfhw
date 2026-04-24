import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'

interface ValidacaoDetails {
  validacao: {
    id: string
    status: string
    chamado_id: string
  }
  chamado: {
    numero: string
    descricao: string
    status: string
  }
  cliente: {
    nome: string
  }
}

export default function ValidacaoExterna() {
  const { chamado_id, token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<ValidacaoDetails | null>(null)
  const [action, setAction] = useState<'Validei' | 'Não funcionou' | null>(null)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const fetchDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await pb.send(`/backend/v1/validacoes/${token}/detalhes`, {
        method: 'GET',
      })
      if (res.validacao.chamado_id !== chamado_id) {
        throw new Error('Link expirado ou inválido.')
      }
      if (res.validacao.status !== 'Pendente') {
        throw new Error('Validação já processada.')
      }
      setDetails(res)
    } catch (err: any) {
      setError('Chamado não encontrado ou link expirado.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && chamado_id) {
      fetchDetails()
    }
  }, [token, chamado_id])

  const handleSubmit = async () => {
    if (action === 'Não funcionou' && !comentario.trim()) {
      return
    }

    try {
      setSubmitting(true)
      await pb.send(`/backend/v1/validacoes/${token}/responder`, {
        method: 'POST',
        body: JSON.stringify({
          resposta: action,
          comentario: action === 'Não funcionou' ? comentario : undefined,
        }),
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/portal')
      }, 3000)
    } catch (err) {
      setError('Erro ao processar validação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-md">
          <CardHeader>
            <AlertCircle className="mx-auto size-12 text-destructive mb-4" />
            <CardTitle className="text-xl">
              {error === 'Erro ao processar validação. Tente novamente.' ? 'Erro' : 'Link Inválido'}
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            {error === 'Erro ao processar validação. Tente novamente.' ? (
              <Button onClick={() => setError(null)} disabled={submitting}>
                Tentar Novamente
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 size-4" />
                Voltar
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-md border-green-200 bg-green-50/50">
          <CardHeader>
            <CheckCircle2 className="mx-auto size-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl text-green-700">Obrigado!</CardTitle>
            <CardDescription className="text-green-600/80 text-base">
              Sua validação foi registrada com sucesso.
              <br />
              Redirecionando para o portal...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in-up space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Validação de Solução</h1>
          <p className="text-muted-foreground">
            Confirme se a solução aplicada resolveu o seu problema.
          </p>
        </div>

        <Card className="border-border shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                Chamado {details.chamado.numero}
              </span>
              <span className="text-sm text-muted-foreground">
                Cliente: <span className="font-medium text-foreground">{details.cliente.nome}</span>
              </span>
            </div>
            <CardTitle className="text-xl">Descrição da Solução</CardTitle>
            <CardDescription className="text-base mt-2">
              {details.chamado.descricao ||
                'Nenhuma descrição fornecida para a solução deste chamado.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {!action ? (
              <div className="space-y-4 text-center">
                <h3 className="font-medium text-lg">A solução proposta funcionou para você?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Button
                    size="lg"
                    className="h-11 sm:w-48 bg-green-600 hover:bg-green-700 text-white text-base"
                    onClick={() => setAction('Validei')}
                  >
                    <CheckCircle2 className="mr-2 size-5" />
                    Sim, funcionou
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 sm:w-48 border-destructive text-destructive hover:bg-destructive/10 text-base"
                    onClick={() => setAction('Não funcionou')}
                  >
                    <XCircle className="mr-2 size-5" />
                    Não funcionou
                  </Button>
                </div>
              </div>
            ) : action === 'Validei' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 text-green-800">
                  <CheckCircle2 className="size-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium">Confirmar Validação</h4>
                    <p className="text-sm text-green-700/80 mt-1">
                      Ao confirmar, o chamado será encerrado com sucesso.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setAction(null)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 h-11"
                  >
                    {submitting ? 'Registrando...' : 'Confirmar e Fechar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive">
                  <AlertCircle className="size-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium">Chamado será reaberto</h4>
                    <p className="text-sm text-destructive/80 mt-1">
                      Por favor, detalhe o que não funcionou para que nossa equipe possa analisar
                      novamente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="comentario"
                    className="text-base font-medium flex items-center gap-1"
                  >
                    Motivo da rejeição <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="comentario"
                    placeholder="Descreva o que aconteceu..."
                    className="min-h-[120px] resize-none text-base"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    required
                  />
                  {!comentario.trim() && (
                    <p className="text-sm text-destructive font-medium">
                      Este campo é obrigatório.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setAction(null)} disabled={submitting}>
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !comentario.trim()}
                    variant="destructive"
                    className="h-11"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Feedback'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
