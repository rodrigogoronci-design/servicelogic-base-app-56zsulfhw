import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AtendenteLayout } from './components/layouts/AtendenteLayout'
import { ClienteLayout } from './components/layouts/ClienteLayout'

import Login from './pages/Login'
import RecuperarSenha from './pages/RecuperarSenha'
import Dashboard from './pages/Dashboard'
import Auditoria from './pages/Auditoria'
import ConfiguracaoWhatsApp from './pages/ConfiguracaoWhatsApp'
import ConfiguracaoMovideskJira from './pages/ConfiguracaoMovideskJira'
import Portal from './pages/Portal'
import Validacao from './pages/Validacao'
import ValidacaoExterna from './pages/ValidacaoExterna'
import NotFound from './pages/NotFound'

function RootRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user) {
    return <Navigate to={user.perfil === 'Atendente' ? '/dashboard' : '/portal'} replace />
  }
  return <Login />
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Rotas Públicas */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/validacao/:chamado_id/:token" element={<ValidacaoExterna />} />

            {/* Rotas Atendente */}
            <Route element={<ProtectedRoute allowedProfiles={['Atendente']} />}>
              <Route element={<AtendenteLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route
                  path="/configuracoes/integracao-whatsapp"
                  element={<ConfiguracaoWhatsApp />}
                />
                <Route
                  path="/configuracoes/integracao-movidesk-jira"
                  element={<ConfiguracaoMovideskJira />}
                />
              </Route>
            </Route>

            {/* Rotas Cliente */}
            <Route element={<ProtectedRoute allowedProfiles={['Cliente']} />}>
              <Route element={<ClienteLayout />}>
                <Route path="/portal" element={<Portal />} />
                <Route path="/validacao" element={<Validacao />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
