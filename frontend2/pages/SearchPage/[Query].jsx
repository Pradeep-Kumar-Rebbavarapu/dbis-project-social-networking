import { useRouter } from 'next/router'
import React, { useContext, useEffect, useReducer, useState,useRef } from 'react'
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Context from '@/Context/context'
import Link from 'next/link'
export default function Query() {
  const router = useRouter()
  const query = router.query.Query
  const { auth } = useContext(Context)
  useEffect(()=>{
    if(!auth){
      router.push('/JoinUsPage')
    }
  },[])
  const data = {
    "access": auth?.access,
    "query": query
  }
  const SearchedUsers = useQuery({
    queryKey: ["searchUsers"], queryFn: () => {
      return searchUsers(data)

    }
  })
  
  let socket = useRef(null)
  useEffect(()=>{
    socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${auth?.user?.pk}`)
    socket.current.onopen = (e)=>{
      console.log(e)
    }
    socket.current.onmessage = (e)=>{
      const data = JSON.parse(e.data)
      if(data.type === "follow_request_sent"){
        //toast
        alert('follow request sent')
      }
    }
    return ()=>{
      socket.current.close()
    }
  },[])

  return (
    <div>
      <h1 className='font-bold text-center my-20 text-3xl'> </h1>
      <section class="text-gray-600 body-font">
        <div class="container px-5 py-24 mx-auto">
          <div class="flex flex-col text-center w-full mb-20">
            <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Found {SearchedUsers?.data?.length} Users On You Search : {query}</h1>
          </div>


          <div class={`flex flex-col items-center justify-center`}>
            {SearchedUsers?.data?.map((user, index) => {
              return (
                <div key={index} class="p-2  w-fit ">
                  <div class="h-full flex items-center border-gray-200 border p-4 rounded-lg bg-white">
                    <img alt="team" class="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4" src="https://dummyimage.com/80x80" />
                    <div class="flex-grow">
                      <h2 class="text-gray-900 title-font font-medium">{user.username}</h2>
                      <p class="text-gray-500">Last Login : {user.last_login?user.last_login:"None"}</p>
                      <p class="text-black font-bold my-2 cursor-pointer hover:text-gray-600 transition-all fade-in-out" onClick={()=>{
                        socket.current.send(JSON.stringify({
                          "type":"follow_request",
                          "data":{
                            "follower":auth.user.pk,
                            "followee":user.id,

                          }
                        }))
                      }}>Follow</p>
                      <Link href={`http://localhost:3000/ProfilePage/${user.username}/${user.id}`} class="text-black font-bold my-2 cursor-pointer hover:text-gray-600 transition-all fade-in-out" >View Profile</Link>
                      
                    </div>
                    
                  </div>
                </div>
              )
            })}

          </div>
        </div>
      </section>
    </div>
  )
}


const searchUsers = async (data) => {
  return axios.get(`http://127.0.0.1:8000/api/v1/__search__user__based__on__username__/?username=${data.query}`, {
    headers: {
      'Authorization': `Bearer ${data.access}`
    }
  }).then((response) => {
    return response.data
  }).catch((error) => {
    console.log(error)
    return []
  })
}

export const getServerSideProps = async (context) => {
  const queryClient = new QueryClient()
  const data = {
    "access": context.req.cookies.access,
    "query": context.query.Query
  
  }
  await queryClient.prefetchQuery(["searchUsers", context.query.query], () => searchUsers(data))
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}