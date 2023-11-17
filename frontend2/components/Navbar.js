import Link from 'next/link'
import React, { useContext, useEffect,useRef } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import SearchBar from './SearchBar'
import Context from '@/Context/context'
import OffCanvasNavbar from './OffCanvasNavbar'
import dynamic from 'next/dynamic'
import { FaBars } from "react-icons/fa";
function Navbar() {
  const { auth, Logout } = useContext(Context)
  const ref = useRef(null);

  const OpenOffCanvas = () => {
    
    if (document?.getElementById("offcanvas")?.classList.contains("left-[-1000px]")) {
      document?.querySelector("#offcanvas")?.classList.remove('left-[-1000px]');
    } else {
      document?.querySelector("#offcanvas")?.classList.add("left-[-1000px]");
    }
  };
  useEffect(() => {
    const handleClicKOutsideOffcanvas = (e) => {
      if (ref.current && !ref?.current?.contains(e.target)) {
        document.querySelector("#offcanvas")?.classList.add("left-[-1000px]");
      }
    };
    document.addEventListener("click", handleClicKOutsideOffcanvas, true);
    return () => {
      document.removeEventListener("click", handleClicKOutsideOffcanvas, true);
    };
  }, []);
  
  return (
    <div id="Navbar" className='w-full h-[80px] lg:h-[100px] !z-[1000000]   grid grid-cols-[100px_auto] bg-white bg-opacity-20 '>
      <div></div>
      <div className='items-center hidden justify-center  lg:flex '>
        <ul className='flex relative overflow-hidden'>
          <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href="/" >Home</Link></li>

          {auth ? (
            <div className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'>
              <p className='hover:border-b-2 hover:border-black transition-all fade-in-out ' onClick={() => {
                Logout()
              }} >Logout</p>
            </div>
          ) : (
            <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href="/JoinUsPage" >Join Us</Link></li>
          )}

          <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href={auth ? "/Chats" : "/JoinUsPage"}  >Chats</Link></li>
          <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href={auth ? "/Posts" : "JoinUsPage"} >Posts</Link></li>
          <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href="/AboutUsPage" >About Us</Link></li>

          <li className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><Link className='hover:border-b-2 hover:border-black transition-all fade-in-out ' href={auth ? `/ProfilePage/${auth?.user?.username}/${auth?.user?.pk}` : "JoinUsPage"} >Profile</Link></li>
          <div id="search" className='absolute left-[1000px] z-[10]  w-full h-full bg-white  transition-all fade-in-out'><SearchBar /></div>
        </ul>
        <div onClick={() => {
          console.log(document.getElementById('search').style.left)
          if (document.getElementById('search').classList.contains('left-[1000px]')) {
            document.getElementById('search').className = "absolute left-[0px] z-[10]  w-full h-full bg-white  transition-all fade-in-out"
          }
          else {
            document.getElementById('search').className = "absolute left-[1000px] z-[10]  w-full h-full bg-white  transition-all fade-in-out"
          }
        }} className='mx-5 cursor-pointer p-2 font-semibold text-lg bg-opacity-50 hover:scale-105 transition-all fade-in-out'><p className='hover:border-b-2 hover:border-black transition-all fade-in-out '  ><AiOutlineSearch className='w-8 h-8' /></p></div>
      </div>
      <div
            onClick={OpenOffCanvas}
            id="Bars"
            className="flex justify-end items-center lg:hidden cursor-pointer "
          >
            <FaBars className="w-8 h-8 mx-3   my-4" />
      </div>
      <div ref={ref} className="lg:hidden overflow-hidden text-white">
        <OffCanvasNavbar />
      </div>
    </div>
  )
}

//no SSR for this component
export default dynamic(() => Promise.resolve(Navbar), {
  ssr: false
})