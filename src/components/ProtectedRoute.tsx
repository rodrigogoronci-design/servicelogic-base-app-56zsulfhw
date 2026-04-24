import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Perfil } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  allowedProfiles?: Perfil[]
}

export function ProtectedRoute({ allowedProfiles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedProfiles && !allowedProfiles.includes(user.perfil)) {
    return <Navigate to={user.perfil === 'Atendente' ? '/dashboard' : '/portal'} replace />
  }

  return <Outlet />
}
