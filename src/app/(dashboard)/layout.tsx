'use client'

import { Sidebar } from '@/components/shared/Sidebar'
import { useRestaurant } from '@/hooks/useRestaurant'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { restaurant } = useRestaurant()

  return (
    <div className="flex h-screen">
      <Sidebar restaurantName={restaurant?.name} />
      <main className="flex-1 overflow-auto bg-background">
        <div className="container py-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
