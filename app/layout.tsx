import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Transparência - Condomínio',
  description: 'Acesso às informações, atas, comunicados e documentos do condomínio.',
  openGraph: {
    title: 'Portal de Transparência - Condomínio',
    description: 'Acesso às informações, atas, comunicados e documentos do condomínio.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
