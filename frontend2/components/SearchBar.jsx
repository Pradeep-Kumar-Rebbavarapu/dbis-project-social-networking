import { useRouter } from 'next/router'
import React from 'react'

export default function SearchBar() {
    const [search, setSearch] = React.useState('')
    const router = useRouter()
  return (
    <div  className='w-full h-full flex border-black border-2 p-2'>
        <input  className='w-full h-full outline-none  transition-all fade-in-out ' placeholder='Search A User' onChange={(e)=>{
            setSearch(e.target.value)
        }}></input>
        <button className='text-black font-bold' onClick={()=>{
            router.push(`/SearchPage/${search}`)
        }}>search</button>
    </div>
  )
}
