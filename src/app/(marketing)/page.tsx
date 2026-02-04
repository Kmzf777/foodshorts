import Link from 'next/link'
import { Play, Smartphone, QrCode, TrendingUp, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Smartphone,
    title: 'Videos Verticais',
    description: 'Experiencia imersiva estilo TikTok para seus clientes navegarem pelo cardapio.',
  },
  {
    icon: QrCode,
    title: 'QR Code por Mesa',
    description: 'Cada mesa tem seu QR Code unico para rastreamento preciso dos pedidos.',
  },
  {
    icon: TrendingUp,
    title: 'Metricas em Tempo Real',
    description: 'Acompanhe vendas, pedidos e performance do seu restaurante.',
  },
  {
    icon: Zap,
    title: 'Pedidos Instantaneos',
    description: 'Receba pedidos diretamente no painel sem necessidade de garcom.',
  },
  {
    icon: Shield,
    title: 'Pagamento Seguro',
    description: 'Integrado com AbacatePay para pagamentos via PIX seguros.',
  },
  {
    icon: Play,
    title: 'Upload Facil',
    description: 'Grave videos de ate 15s e faca upload direto pelo navegador.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Cardapio Digital
            <span className="text-primary"> em Video</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transforme seu cardapio em uma experiencia visual imersiva.
            Videos curtos verticais que vendem mais, igual TikTok e Reels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/cadastro">Comecar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Ver Precos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-50">Video Demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que voce precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar seu cardapio digital
              e receber pedidos de forma eficiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastre seu Restaurante</h3>
              <p className="text-muted-foreground">
                Crie sua conta e configure seu restaurante em minutos.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Adicione Videos</h3>
              <p className="text-muted-foreground">
                Grave videos dos seus pratos e faca upload direto no painel.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba Pedidos</h3>
              <p className="text-muted-foreground">
                Compartilhe o link e comece a receber pedidos instantaneamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para aumentar suas vendas?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Comece agora com 7 dias gratis. Sem compromisso, cancele quando quiser.
          </p>
          <Button size="lg" asChild>
            <Link href="/cadastro">Criar Conta Gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
