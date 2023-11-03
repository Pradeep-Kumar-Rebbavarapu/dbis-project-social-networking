import React, { useContext, useEffect } from 'react'
import { useQuery, dehydrate, QueryClient, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Context from '@/Context/context';
export default function Posts() {
  
  
  const {auth} = useContext(Context)
  const UsersPosts = useQuery({ queryKey: ["usersPosts"], queryFn: ()=>{
    return fetchUsersPosts(auth.access)
  } })
  useEffect(()=>{
    if(!auth){
      router.push('/JoinUsPage')
    }
  },[])
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
                          <svg className="w-4 h-4 mr-1" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>{ele.post.post_liked_by.length}
                        </span>
                        <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                          <svg className="w-4 h-4 mr-1" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                          </svg>{ele.post.post_comments.length}
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
