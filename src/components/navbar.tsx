import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu, X } from 'lucide-react'
import Logo from '../assets/picker.svg'
import LogoDark from '../assets/picker-dark.svg'
import { useTheme } from '../hooks/useTheme'

export default function NavBar() {
  const { isDark, toggle } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  const isMockExamActive = ['/mockexamprep', '/mockexam', '/mockexamresults'].includes(location.pathname)
  const isNotesActive = location.pathname === '/notes'
  const isPreviousExamsActive = location.pathname.startsWith('/previousexams')

  const navLinks = [
    { label: 'NOTES', to: '/notes', isActive: isNotesActive },
    { label: 'MOCK EXAM', to: '/mockexamprep', isActive: isMockExamActive },
    { label: 'PREVIOUS EXAMS', to: '/previousexams', isActive: isPreviousExamsActive },
  ]

  return (
    <header className="w-full sticky top-0 z-40 border-b-2 border-zinc-950 dark:border-zinc-200 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 font-heading font-black text-xl tracking-tight text-zinc-950 dark:text-zinc-100 hover:opacity-85 transition-opacity"
        >
          <img src={isDark ? LogoDark : Logo} alt="NitPicker logo" className="h-8 w-auto" />
          <span>NitPicker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <nav className="flex items-center gap-2" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 ${
                  item.isActive
                    ? 'border-2 border-zinc-950 dark:border-zinc-100 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5]'
                    : 'border-2 border-transparent text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" aria-hidden="true" />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5] transition-all cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="p-2 border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5] transition-all cursor-pointer"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Conditionally rendered Mobile Menu (prevents hidden link keyboard focus leakage) */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-950 px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-150"
        >
          <nav className="flex flex-col gap-2.5" aria-label="Mobile Navigation">
            <Link
              to="/"
              onClick={closeMenu}
              className={`px-4 py-2.5 text-sm font-mono font-bold tracking-wider uppercase border-2 transition-all ${
                location.pathname === '/'
                  ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5]'
                  : 'border-zinc-950/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              HOME
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={`px-4 py-2.5 text-sm font-mono font-bold tracking-wider uppercase border-2 transition-all ${
                  item.isActive
                    ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-[2px_2px_0px_0px_#09090b] dark:shadow-[2px_2px_0px_0px_#f4f4f5]'
                    : 'border-zinc-950/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
