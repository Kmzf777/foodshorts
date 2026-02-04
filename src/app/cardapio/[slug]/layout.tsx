import { Toaster } from '@/components/ui/sonner'

export default function CardapioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  )
}
