import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary border-primary">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FoodShorts Logo"
              width={240}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/pricing"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              Preços
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              Como Funciona
            </Link>
            <Link
              href="/politics"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              asChild
            >
              <Link href="/cadastro">Comecar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2024 FoodShorts. Todos os direitos reservados.
            </p>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Termos de Uso
              </Link>
              <Link href="#" className="hover:text-foreground">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contato
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
