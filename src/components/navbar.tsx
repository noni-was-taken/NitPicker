
import Logo from '../assets/picker.svg'
import LogoDark from '../assets/picker-dark.svg'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function NavBar(){
    const { isDark, toggle } = useTheme()

    return (
        <>
        <div className="hidden md:flex w-[95vw] h-auto items-center border-b-1 border-black dark:border-white px-3 py-4 justify-between">
                <Link to="/" className="m-0 text-2xl font-bold text-black dark:text-white duration-300 transition-all hover:scale-110 flex items-center">
                    <img src= {isDark ? LogoDark : Logo} alt="NitPicker logo" className='h-12 w-auto' />   NitPicker
                </Link>

                <div className="flex gap-10 items-center">
                    <div className="px-2 py-1 group hover:bg-black dark:hover:bg-white transition-all duration-300">
                        <Link to="/notes" className="text-sm font-bold group-hover:text-white dark:group-hover:text-black transition-all duration-300">NOTES</Link>
                    </div>
                    <div className="px-2 py-1 group hover:bg-black dark:hover:bg-white transition-all duration-300">
                        <Link to="/mockexam" className="text-sm font-bold group-hover:text-white dark:group-hover:text-black transition-all duration-300">MOCK EXAM</Link>
                    </div>
                    <div className="px-2 py-1 group hover:bg-black dark:hover:bg-white transition-all duration-300">
                        <Link to="/previousexams" className="text-sm font-bold group-hover:text-white dark:group-hover:text-black transition-all duration-300">PREVIOUS EXAMS</Link>
                    </div>

                    <button
                        type="button"
                        onClick={toggle}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="p-1 hover:scale-110 transition-transform duration-200 cursor-pointer text-black dark:text-white"
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </>
    )
}
