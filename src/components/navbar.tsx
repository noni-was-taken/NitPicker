export default function NavBar(){
    return (
        <>
        <div className="hidden md:flex w-[95vw] h-auto items-center border-b-1 border-black px-3 py-4 justify-between">
                <a href="/" className="m-0 text-2xl font-bold text-black duration-300 transition-all hover:scale-110">
                    NitPicker
                </a>

                <div className="flex gap-10">
                    <div className="px-2 py-1 group hover:bg-black transition-all duration-300">
                        <a href="/notes" className="text-sm font-bold group-hover:text-white transition-all duration-300">NOTES</a>
                    </div>
                    <div className="px-2 py-1 group hover:bg-black transition-all duration-300">

                        <a href="/mockexam" className="text-sm font-bold group-hover:text-white transition-all duration-300">MOCK EXAM</a>
                    </div>
                    <div className="px-2 py-1 group hover:bg-black transition-all duration-300">

                    <a href="" className="text-sm font-bold group-hover:text-white transition-all duration-300">PREVIOUS EXAMS</a>
                    </div>
                </div>

            </div>
        </>
    )
}