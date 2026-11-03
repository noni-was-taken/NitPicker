import type { ReactNode } from 'react'
import NavBar from './navbar'
import Footer from './footer'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen flex w-full flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100">
      <NavBar />
      <div className={`flex-1 flex flex-col w-full ${className}`}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
