import './globals.css'

export const metadata = {
  title: 'Echo - Racing Analytics Platform',
  description: 'AI-powered racing performance analytics with pre-trained ML models',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-f1-dark text-white">{children}</body>
    </html>
  )
}

