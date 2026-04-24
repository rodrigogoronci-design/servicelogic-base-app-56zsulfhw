import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function ClienteLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
    <nav className={cn('flex gap-6', mobile && 'flex-col gap-4 mt-6')}>
      <Link
        to="/portal"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          location.pathname === '/portal' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        Meu Portal
      </Link>
      <Link
        to="/validacao"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          location.pathname === '/validacao' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        Validação
      </Link>
    </nav>
  )

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/portal" className="flex items-center gap-2 font-bold text-primary text-xl">
              <div className="size-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
                SL
              </div>
              <span className="hidden sm:inline-block">Servicelogic</span>
            </Link>
            <div className="hidden md:flex">
              <NavLinks />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex gap-2">
                  <User className="size-4" />
                  <span className="truncate max-w-[150px]">{user?.name || 'Usuário'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <NavLinks mobile />
                <div className="mt-auto absolute bottom-8 left-6 right-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  )
}
