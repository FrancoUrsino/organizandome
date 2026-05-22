import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Bloom Tasks - Organiza tu mundo',
  description: 'Aplicación de gestión de tareas diseñada para mujeres. Organiza tus tareas diarias, semanales y mensuales de forma elegante y eficiente.',
  keywords: ['tareas', 'productividad', 'organización', 'planificación', 'mujeres', 'to-do'],
  authors: [{ name: 'Bloom Tasks' }],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png?v=2', // 👈 Se eliminó el SVG y se agregó ?v=2 para romper la caché
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png?v=2',  // 👈 Se agregó ?v=2 para romper la caché
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png?v=2', // 👈 Forzar el refresco en el acceso directo del celular
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b5dc9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1f3a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}