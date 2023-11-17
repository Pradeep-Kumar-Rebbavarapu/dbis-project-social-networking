import React, { useContext } from "react";
import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai";
import useWindowSize from "@rooks/use-window-size";
import Context from "@/Context/context";
export default function OffCanvasNavbar() {
    const { innerWidth } = useWindowSize();
    const {auth,Logout} = useContext(Context)
    const handleToggleNavbar = () => {
            document.querySelector("#offcanvas")?.classList.add('left-[-1000px]')
    };
    return (
        <div>
            <div className="">
                <div className="overflow-hidden ">
                    <div
                        id="offcanvas"
                        className="absolute left-[-1000px] h-fit pb-28 w-full overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 transition-all fade-in-out bg-opacity-100 invert"
                    >
                        <button className=" mx-10 mt-10 border-2 rounded-full p-2 bg-white text-black cursour-pointer ">
                            <AiOutlineClose
                                onClick={() => {
                                    document
                                        .querySelector("#offcanvas")
                                        ?.classList.add('left-[-1000px]');
                                }}
                                className=""
                            />
                        </button>
                        <h1 className="text-center text-white font-bold mx-5  text-3xl my-10">
                            Nexus Net
                        </h1>
                        <ul className=" w-fit mx-auto ">
                            <Link
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className="h-fit"
                                href="/"
                            >
                                <li className="my-2 mx-auto border-2 p-2 rounded-md hover:invert transition-all fade-in-out focus:invert text-center  w-[200px] bg-black text-white">
                                    Home
                                </li>
                            </Link>
                            {auth && (
                                <div
                                onClick={() => {
                                    
                                    Logout()

                                }}
                                className=""
                                
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    Logout
                                </li>
                            </div>
                            )}
                            {!auth && (
                                <div
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className=""
                                href="/JoinUsPage"
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    Join Us
                                </li>
                            </div>
                            )}
                            
                            <Link
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className=""
                                href="/Chats"
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    Chats
                                </li>
                            </Link>

                            <Link
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className=""
                                href="/Posts"
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    Posts
                                </li>
                            </Link>
                            <Link
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className=""
                                href="/AboutUsPage"
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    About Us
                                </li>
                            </Link>
                            {auth && (
                                <Link
                                onClick={() => {
                                    setTimeout(() => {
                                        handleToggleNavbar();
                                    }, 200);
                                }}
                                className=""
                                href={`/ProfilePage/${auth.user.username}/${auth.user.pk}`}
                            >
                                <li className="my-2 mx-auto border-2 hover:invert transition-all fade-in-out focus:invert p-2 rounded-md text-center w-[200px] bg-black text-white">
                                    Profile Page
                                </li>
                            </Link>
                            )}
                            
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}