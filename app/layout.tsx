import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orçamento Familiar',
  description: 'Controle simples de proventos, despesas e fluxo de caixa.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
