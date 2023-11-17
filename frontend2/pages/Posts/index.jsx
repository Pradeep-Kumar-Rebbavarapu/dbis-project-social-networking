import React, { useContext, useEffect,useRef } from 'react'
import { useQuery, dehydrate, QueryClient, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Context from '@/Context/context';
import { FcLike } from "react-icons/fc";
// import toast
import { toast } from 'react-hot-toast';
import { CiHeart } from "react-icons/ci";
export default function Posts() {
  
  
  const {auth} = useContext(Context)
  const UsersPosts = useQuery({ queryKey: ["usersPosts"], queryFn: ()=>{
    return fetchUsersPosts(auth.access)
  } })
  let socket = useRef(null)
	useEffect(()=>{
		
		socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${auth?.user?.pk}`)
		socket.current.onopen = (e)=>{
		  console.log(e)
		}
		socket.current.onmessage = (e)=>{
		  const data = JSON.parse(e.data)
      if(data.type === "post_liked"){
        UsersPosts.refetch()
            toast.success("Post Liked",{position:"top-right"})
      }
      else if(data.type === "post_unliked"){
        UsersPosts.refetch()
          toast.success("Post Unliked",{position:"top-right"})
      }
		}
		return ()=>{
		  socket.current.close()
		}
	  },[auth?.user?.pk])
  return (
    <div className='flex flex-col justify-center items-center w-full px-20 '>
      {UsersPosts?.data?.map((ele, index) => {
        return (
          <section key={index} className="text-gray-600 body-font max-w-[800px]  ">
            <div className="container px-5  py-10 mx-auto">
              <div className="flex flex-wrap -m-4">


                <div className="p-4 w-full h-full">
                  <div className="h-full w-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white">
                    <img className=" w-full  object-cover object-center " src={ele.post.post_img} alt="blog" />
                    <div className="p-6 h-full">
                      <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1 break-all">{ele.user.username}</h2>
                      <h1 className="title-font text-lg font-medium text-gray-900 mb-3 break-all">{ele.post.post_title}</h1>
                      <p className="leading-relaxed mb-3 break-all">{ele.post.post_content}</p>
                      <div className="flex items-center flex-wrap ">
                        <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">{ele.post.post_time}
                          
                        </a>
                        <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                          {/* if the auth.user.pk is present in post_liked_by the show FCLike else show CIHeart */}
                          {ele.post.post_liked_by.includes(auth.user.pk) ? <FcLike className='w-[20px] h-[20px] mx-2' onClick={()=>{
                            socket.current.send(JSON.stringify({
                              'type':'unlike',
                              "data":{
                                'post_id':ele.post.id,
                              "user_id":auth.user.pk
                              }
                              
                            }))
                          }} /> : <CiHeart onClick={()=>{
                            socket.current.send(JSON.stringify({
                              'type':'like',
                              "data":{
                                'post_id':ele.post.id,
                              "user_id":auth.user.pk
                              }
                              
                            }))
                          }} className='w-[20px] h-[20px] mx-2' />}
                        
                        {ele.post.post_liked_by.length}
                        </span>
                        
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </section>
        )
      })}



    </div>
  )
}

export const fetchUsersPosts = async (access) => {
  return axios.get('http://127.0.0.1:8000/api/v1/__get__posts__of__all__the__users__who__the__logged__in__user__follows__or__is__following__', {
    headers: {
      'Authorization': `Bearer ${access}`
    }
  }).then((response) => {
    return response.data
  }).catch((error) => {
    console.log(error)
    return []
  })
}

export async function getServerSideProps(context) {
  const queryClient = new QueryClient()
  const access = context.req.cookies.access
  await queryClient.prefetchQuery({ queryKey: ["usersPosts"], queryFn: ()=>{
    return fetchUsersPosts(access)
  } })
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }

}
