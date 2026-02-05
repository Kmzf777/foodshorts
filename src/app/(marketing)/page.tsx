import Link from 'next/link'
import { Play, Smartphone, QrCode, TrendingUp, Zap, Shield, LayoutGrid, BarChart3, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Smartphone,
    title: 'Vídeos verticais 9:16',
    description: 'Experiência de navegação estilo feed do TikTok ou Reels.',
  },
  {
    icon: QrCode,
    title: 'QR Code por mesa',
    description: 'Pedidos identificados automaticamente pela localização da mesa.',
  },
  {
    icon: LayoutGrid,
    title: 'Categorias personalizadas',
    description: 'Organize seu cardápio como preferir para facilitar a escolha.',
  },
  {
    icon: UtensilsCrossed, // Substitute for "Painel de pedidos" icon if specific one isn't better
    title: 'Painel de pedidos',
    description: 'Receba e gerencie todos os pedidos em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Métricas',
    description: 'Visualize visualizações, pedidos e a performance dos seus pratos.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Cardápio digital em vídeo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Substitua fotos estáticas por vídeos curtos dos seus pratos. Para delivery e atendimento presencial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/cadastro">Começar</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-semibold">
              <Link href="/cardapio/pizza-patos">Ver exemplo</Link>
            </Button>
          </div>

          {/* Demo Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center border shadow-sm">
              <div className="text-center text-muted-foreground">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-50 font-medium">Video/Demo embed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE É Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-sm font-semibold text-primary tracking-wider uppercase mb-3">O que é</h2>
          <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-8">
            FoodShorts é uma plataforma de cardápio digital que usa vídeos verticais de 15 segundos no lugar de fotos. Seus clientes navegam pelos pratos como em um feed do TikTok ou Reels.
          </p>
          <p className="text-lg text-muted-foreground">
            Funciona para delivery (compartilhe o link) e para atendimento no salão (QR Code por mesa).
          </p>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Cadastre seu restaurante</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie sua conta e configure as categorias do seu cardápio.
              </p>
            </div>
            <div className="text-center group">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Adicione seus pratos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Faça upload dos vídeos direto pelo navegador. Até 15 segundos cada.
              </p>
            </div>
            <div className="text-center group">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Compartilhe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Use o link para delivery ou gere QR Codes para as mesas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Funcionalidades
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preços / CTA Final */}
      <section className="py-24 bg-background border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Comece agora
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/cadastro">Começar agora</Link>
            </Button>
            <Button variant="link" size="lg" asChild className="text-lg text-muted-foreground hover:text-primary">
              <Link href="/pricing">Ver planos →</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
