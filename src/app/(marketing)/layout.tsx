import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-primary border-b border-primary shadow-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FoodShorts Logo"
              width={175}
              height={50}
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Center: Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Preços
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Como Funciona
            </Link>
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              size="sm"
              className="bg-white text-red-600 hover:bg-white/90 font-semibold"
              asChild
            >
              <Link href="/cadastro">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="block mb-4">
                <Image
                  src="/logo.png"
                  alt="FoodShorts Logo"
                  width={120}
                  height={35}
                  className="h-8 w-auto opacity-80"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                Cardápio digital em vídeo para restaurantes modernos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/sobre" className="hover:text-primary transition-colors">Como funciona</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Preços</Link></li>
                <li><Link href="/cardapio/pizza-patos" className="hover:text-primary transition-colors">Exemplo</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
                <li><Link href="mailto:contato@foodshorts.com" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FoodShorts. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
