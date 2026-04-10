import { BookOpenTextIcon, ExamIcon, NoteIcon, type IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import NavBar from '../components/navbar';
import Footer from '../components/footer';

export default function HomePage(){
    const navigate = useNavigate()

    useEffect(() => {
        const lenis = new Lenis({
            smoothWheel: true,
            syncTouch: true,
        })

        let rafId = 0

        const raf = (time: number) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    return(
        <>
        <div className="min-h-screen flex w-full flex-col items-center bg-white dark:bg-zinc-950 py-10 md:py-0 select-none">
            {/* NAV BAR */}
            <NavBar></NavBar>
            
            {/* HERO */}
            <div className="w-[95vw] h-[40vh] md:flex items-end justify-end px-8 py-4 border-r-5 border-black dark:border-white hidden ">
                <div className="absolute h-[40vh] w-[90vw] flex items-center justify-start">
                    <h1 className="text-5xl lg:text-9xl opacity-30 text-black dark:text-white">
                        KAKAYANIN
                    </h1>
                </div>
                <h1 className="text-4xl text-black dark:text-white">
                    April 26 is almost here
                </h1>
            </div>

            {/* INFORMATION */}
            <div className="w-full min-h-[20vh] flex-col items-center hidden md:flex">
                <h1 className="text-3xl font-bold mb-5 text-black dark:text-white">
                    What is NitPicker?
                </h1>
                <div className="w-74">
                    <p className="text-center text-black dark:text-white">
                        Essentially, This is a haven of everything one might need to study for the Philnits exams
                    </p>
                </div>
                <div className="w-[71vw] h-[50vh] flex justify-between items-center px-10">
                    <IconWithDesc
                        content="STUDY NOTES"
                        Icon={BookOpenTextIcon}
                        onClick={() => navigate('/notes')}
                    ></IconWithDesc>
                    <IconWithDesc
                        content="MOCK EXAM"
                        Icon={ExamIcon}
                        onClick={() => navigate('/mockexamprep')}
                    ></IconWithDesc>
                    <IconWithDesc
                        content="PREVIOUS EXAM"
                        Icon={NoteIcon}
                        onClick={() => navigate('/previousexams')}
                    ></IconWithDesc>

                </div>
            </div>

            <div className="h-[90vh] w-screen flex md:hidden items-center justify-center flex-col">
                <h1 className="text-3xl px-10 text-center font-light text-black dark:text-white">
                    Features such as previous exams and notes are not available on mobile devices 
                </h1>
                <h1 className="text-xl font-bold opacity-50 text-black dark:text-white">
                    yet... :)
                </h1>

                <button className="text-2xl font-light text-white bg-black dark:text-black dark:bg-white h-20 w-40 mt-10" onClick={() => navigate('/mockexamprep')}>
                    PROCEED TO MOCK EXAM
                </button>   
            </div>

            <div className="">

            </div>

            {/* FOOTER */}
            <Footer></Footer>
        </div>
        </>
    )
}


type IconWithDescProps = {
    content: string
    Icon: ComponentType<IconProps>
    onClick: () => void
}

export function IconWithDesc({ content, Icon, onClick }: IconWithDescProps) {
    return (
        <div className="group relative flex flex-col items-center">
            <button
                type="button"
                onClick={onClick}
                className="h-50 aspect-square bg-black dark:bg-white duration-300 transition-all cursor-pointer flex items-center justify-center group-hover:rotate-45"
            >
                <Icon className="h-14 w-auto text-white dark:text-black group-hover:opacity-0 transition-all duration-300"></Icon>
            </button>
            <div className="
            pointer-events-none absolute top-full mt-4 w-44 px-3 py-2 text-center text-sm opacity-0 -translate-y-49 transition-all -translate-x-22 duration-300 group-hover:opacity-100 group-hover:translate-x-0 flex item-center h-100">
                <h1 className="text-7xl text-white dark:text-black font-extrabold [-webkit-text-stroke:1px_black] dark:[-webkit-text-stroke:1px_white]">
                    { content }
                </h1>
            </div>
        </div>
    )
}