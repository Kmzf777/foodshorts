'use client'

import Image from 'next/image'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/dashboard/pedidos', icon: ClipboardList },
  { name: 'Cardapio', href: '/dashboard/cardapio', icon: UtensilsCrossed },
  { name: 'Conta', href: '/dashboard/conta', icon: Settings },
]

interface SidebarProps {
  restaurantName?: string
}

export function Sidebar({ restaurantName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b px-6 bg-[#FF0000]">
        <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full">
          <Image
            src="/logo.png"
            alt="FoodShorts Logo"
            width={180}
            height={60}
            className="h-14 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Restaurant Name */}
      {restaurantName && (
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-muted-foreground">Restaurante</p>
          <p className="font-medium truncate">{restaurantName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
