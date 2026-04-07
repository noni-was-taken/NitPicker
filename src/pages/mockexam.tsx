import NavBar from '../components/navbar';
import Footer from '../components/footer';
import { CaretLeftIcon, CaretRightIcon, PauseCircleIcon, EyeSlashIcon, SmileySadIcon } from '@phosphor-icons/react';


export default function MockExamPage(){
    return (
        <>
        <div className="py-10 md:py-0 md:min-h-screen flex md:w-full flex-col items-center bg-white gap-4 md:gap-10 select-none">
            <NavBar></NavBar>

            {/* TIMER NAVIGATIOn */}
            <div className='w-[79vw] md:w-full flex justify-between md:px-10'>
                <CaretLeftIcon className='h-10 md:h-15 w-auto' weight='bold'></CaretLeftIcon>
                <h1 className='text-3xl md:text-5xl font-light'>
                    54:39
                </h1>
                <CaretRightIcon className='h-10 md:h-15 w-auto' weight='bold'></CaretRightIcon>
            </div>

            <div className="md:min-h-[69vh] flex-col md:flex-row w-full flex items-center justify-between gap-10 md:gap-0 px-4 lg:px-20">
                {/* QUESTION SECTION */}
                <div className="flex flex-col md:w-1/2 md:max-w-5xl border-black md:p-6 gap-5 md:gap-6 bg-white text-black">
                    <div className='flex md:w-full justify-between items-center'>
                        <div className='flex gap-1 items-center'>
                            <h1 className="font-extrabold md:text-3xl text-3xl">
                                Q5
                            </h1>
                            <p className='opacity-85 md:text-lg text-lg'>
                                /80
                            </p>
                        </div>
                        <h1 className='text-lg md:text-3xl opacity-45 font-extrabold'>
                            OPERATING SYSTEMS
                        </h1>
                    </div>

                    <p className="md:text-base text-justify leading-relaxed">
                        The table below shows state transition for character string inspection. During the inspection,
                        if the state changes to E, the string under inspection is rejected. Which of the following is
                        rejected in this inspection? Here, state A is the initial state, strings are inspected from left
                        to right, and symbol &#9651; indicates a blank character.
                    </p>

                    <div className="w-full flex justify-center">
                        <table className="text-sm md:w-full border-collapse text-center">
                            <thead>
                                <tr>
                                    <th className="border-2 border-black p-2" rowSpan={2}>Current state</th>
                                    <th className="border-2 border-black p-2" colSpan={5}>Character</th>
                                </tr>
                                <tr>
                                    <th className="border-2 border-black p-2">Blank</th>
                                    <th className="border-2 border-black p-2">Number</th>
                                    <th className="border-2 border-black p-2">Sign</th>
                                    <th className="border-2 border-black p-2">Radix point</th>
                                    <th className="border-2 border-black p-2">Other</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-2 border-black p-2 font-semibold">A</td>
                                    <td className="border-2 border-black p-2">A</td>
                                    <td className="border-2 border-black p-2">B</td>
                                    <td className="border-2 border-black p-2">C</td>
                                    <td className="border-2 border-black p-2">D</td>
                                    <td className="border-2 border-black p-2">E</td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-2 font-semibold">B</td>
                                    <td className="border-2 border-black p-2">A</td>
                                    <td className="border-2 border-black p-2">B</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">D</td>
                                    <td className="border-2 border-black p-2">E</td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-2 font-semibold">C</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">B</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">D</td>
                                    <td className="border-2 border-black p-2">E</td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-2 font-semibold">D</td>
                                    <td className="border-2 border-black p-2">A</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">E</td>
                                    <td className="border-2 border-black p-2">E</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='flex w-full justify-center'>
                        <div className="grid grid-cols-4 md:grid-cols-1 md:gap-3 md:text-lg gap-5 ">
                            <p>a) +0010</p>
                            <p>b) -1</p>
                            <p>c) 12.2</p>
                            <p>d) 9.&#9651;</p>
                        </div>
                    </div>
                </div>

                {/* TIMER PER QUESTION, HINT BUTTON, GIVE UP BUTTON */}

                {/* ANSWER SECTION */}
                <div className='md:w-1/2 w-full md:px-10 flex flex-col-reverse md:flex-col md:gap-15 gap-10'>
                    {/* TOOLS */}
                    <div className='flex justify-between items-center'>
                        {/* BUTTONS */}
                        <div className='flex md:gap-5 gap-2 flex-col-reverse md:flex-row'>
                            <button className='font-extrabold md:px-3 md:py-2 px-5 py-2 border-2 md:h-15 flex items-center md:gap-2'>
                                FORFEIT
                            </button>
                            <button className='font-extrabold md:px-5 md:py-2 px-5 py-2 border-2 md:h-15'>
                                HINT
                            </button>
                        </div>

                        {/* TIMER AND SETTINGS */}
                        <div className='flex md:gap-5 gap-4'>
                            {/* TIMER PER QUESTION*/}
                            <div className='md:h-36 h-24 aspect-square rounded-full flex items-center justify-center border-3 md:border-5'>
                                <h1 className='md:text-2xl text-2xl font-bold'>
                                    53.67
                                </h1>
                            </div>
                            <div className='flex flex-col justify-center md:gap-5 gap-2'>
                                <EyeSlashIcon className='md:h-8 w-auto h-10' weight='bold'></EyeSlashIcon>
                                <PauseCircleIcon className='md:h-8 w-auto h-10' weight='bold'></PauseCircleIcon>
                            </div>
                        </div>
                    </div>
                    <div className='grid md:grid-cols-2 grid-cols-2 gap-2 md:gap-0'>
                        <button className=' hover:text-black hover:bg-white hover:font-extrabold duration-300 cursor-pointer
                                        text-white bg-black px-5 py-2 md:px-10 md:py-5 md:text-2xl border border-white'> 
                            A
                        </button>
                        <button className=' hover:text-black hover:bg-white hover:font-extrabold duration-300 cursor-pointer
                                        text-white bg-black  px-5 py-2 md:px-10 md:py-5 md:text-2xl border border-white'> 
                            B
                        </button>
                        <button className=' hover:text-black hover:bg-white hover:font-extrabold duration-300 cursor-pointer
                                        text-white bg-black  px-5 py-2 md:px-10 md:py-5 md:text-2xl border border-white'> 
                            C
                        </button>
                        <button className=' hover:text-black hover:bg-white hover:font-extrabold duration-300 cursor-pointer
                                        text-white bg-black  px-5 py-2 md:px-10 md:py-5 md:text-2xl border border-white'> 
                            D
                        </button>
                    </div>

                </div>

            </div>

            <Footer></Footer>
        </div>
        </>
    )
}


// <div className="min-h-[78vh] w-full flex items-center justify-between px-20">
//     <h1 className="-tracking-widest text-8xl">
//         You ready?
//     </h1>

//     <div className="border-2 h-[67vh] w-[36vw] flex flex-col gap-5  ">
//         {/* EXAM TYPE & DEFAULT SETTINGS BUTTON */}
//         <div className="flex">
//             <div className="w-1/2 flex flex-col gap-7">
//                 <h1 className="font-light text-3xl">
//                     Exam Type
//                 </h1>
                
//                 <div className="w-full px-8 flex justify-between">
//                     <button type="button" className="font-medium text-xl px-2 py-2 border-2">
//                         AM EXAM
//                     </button>
//                     <button type="button" className="font-medium text-xl px-2 py-2 border-2">
//                         PM EXAM
//                     </button>
//                 </div>
//             </div>
//             <div className="w-1/2 border-2">

//             </div>
//         </div>
//     </div>
// </div>
