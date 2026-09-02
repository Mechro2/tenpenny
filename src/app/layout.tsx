import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Tenpenny AI Operations',
  description: 'Autonomous Voice & Lead Management Engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo/Brand links back home */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                T
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Tenpenny AI</span>
            </Link>
            
            {/* Navigation Links */}
            <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <Link 
                href="/leads" 
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Leads Dashboard
              </Link>
              <Link 
                href="/settings" 
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Agent Settings
              </Link>
            </nav>

          </div>
        </header>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}