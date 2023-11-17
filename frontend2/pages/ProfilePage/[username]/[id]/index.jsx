import { QueryClient, dehydrate, useQuery,useQueryClient,useMutation } from '@tanstack/react-query';
import React, { useContext,useRef,useEffect, useState } from 'react'
import axios from 'axios';
import Modal from 'react-modal';
import AddPost from '@/components/AddPost';
import { useRouter } from 'next/router';
import Context from '@/Context/context';
import Link from 'next/link';
export default function ProfilePage() {
	
	
	const router = useRouter()
	useEffect(()=>{
		if(router.isFallback || !router.query.id){
			return <div>Loading...</div>
		}
	},[])
    
    const [FollowingIsOpen, setFollowingIsOpen] = React.useState(false);
	const [FollowerIsOpen, setFollowerIsOpen] = React.useState(false);
	const [FollowRequest, setFollowRequest] = React.useState(false);
	const [isModalOpen,setisModalOpen] = useState(false)
	const [title,settitle] = useState(null)
	const [content,setcontent] = useState(null)
	const [image,setimage] = useState(null)
	const [id,setid] =  useState(null)
    const { auth } = useContext(Context)
	useEffect(()=>{
		if(!auth){
		  router.push('/JoinUsPage')
		}
	  },[])
	const customStyles = {
		content: {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
			zIndex:10000000,
			backgroundColor: 'black',
			borderRadius: '10px',
		},
		
	};
	
	// call on every page change
	const data = {
		"id":router.query.id,
		"access":auth?.access
	}
	const UserDetails = useQuery(
		{
			queryKey: ["usersDetails"],
			queryFn: () => fetchUserDetails(data),
            staleTime: 1000, // 1 second
            cacheTime: 0,   // Disable caching
		  }
	)

	console.log(UserDetails)
	let socket = useRef(null)
	useEffect(()=>{
		
		socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${auth?.user?.pk}`)
		socket.current.onopen = (e)=>{
		  console.log(e)
		}
		socket.current.onmessage = (e)=>{
		  const data = JSON.parse(e.data)
		  if(data.type === "follow_request_accepted"){
			UserDetails.refetch()
            setFollowRequest(false)
		  }
          else if(data.type === "follow_request_rejected"){
            UserDetails.refetch()
            setFollowRequest(false)
          }
          else if(data.type === "unfollow_request_sent"){
            UserDetails.refetch()
            setFollowRequest(false)
          }
          else if(data.type === "follow_request_sent"){
            UserDetails.refetch()
            setFollowRequest(false)
          }
		}
		return ()=>{
		  socket.current.close()
		}
	  },[auth?.user?.pk])

	  useEffect(() => {
        // Refetch data when the component becomes visible or when query.id changes
        UserDetails.refetch();
      }, [router.query.id]);

	  const updatepost1 = useUpdatePost()
	  useEffect(()=>{
		  if(updatepost1.isSuccess){
			  setisModalOpen(false)
		  }
	  },[updatepost1.isSuccess])
	
	 const deletepost1 = useDeletePost()
	return (
		<div className='invert'>
			<Modal
				isOpen={FollowerIsOpen}

				onRequestClose={() => setFollowerIsOpen(false)}
				style={customStyles}
				contentLabel="Example Modal"
			>
				{UserDetails?.data?.followers?.map((ele, index) => {
					return (
						<div key={ele.id} className='border-0 border-black my-5 mx-5 p-2 text-black invert font-bold bg-orange-500 rounded-lg'>
							<button onClick={()=>{
								setFollowerIsOpen(false)
								router.push(`/ProfilePage/${ele.username}/${ele.id}`)
							}}  >{ele.username}</button>
						</div>
					)
				})}

			</Modal>

			<Modal
				isOpen={FollowingIsOpen}

				onRequestClose={() => setFollowingIsOpen(false)}
				style={customStyles}
				contentLabel="Example Modal"
			>
				{UserDetails?.data?.followees?.map((ele, index) => {
					return (
						<div key={ele.id} className='border-0 border-black my-5 mx-5 p-2 text-white font-bold'>
							<button onClick={()=>{
								setFollowingIsOpen(false)
								router.push(`/ProfilePage/${ele.username}/${ele.id}`)
							}}  >{ele.username}</button>
						</div>
					)
				})}
			</Modal>

			<Modal
				isOpen={FollowRequest}

				onRequestClose={() => setFollowRequest(false)}
				style={customStyles}
				contentLabel="Example Modal"
			>
				{UserDetails?.data?.followrequests?.map((ele, index) => {
					return (
						<div key={ele.id}>
							<div className='border-0 border-black my-5 mx-5 p-2  text-white font-bold'>
								<button onClick={()=>{
								setFollowRequest(false)
								router.push(`/ProfilePage/${ele.username}/${ele.id}`)
							}}  >{ele.username}</button> wants to follow you <span className='font-bold underline cursor-pointer' onClick={()=>{
                                socket.current.send(JSON.stringify({
                                    "type":"accept_follow_request",
                                    "data":{
                                        "follower":ele.id,
                                        "followee":auth?.user?.pk
                                    }
                                }))
                            }}>Accept</span> or <span className='font-bold underline cursor-pointer' onClick={()=>{
                                socket.current.send(JSON.stringify({
                                    "type":"reject_follow_request",
                                    "data":{
                                        "follower":ele.id,
                                        "followee":auth?.user?.pk
                                    }
                                }))
                            }}>Reject</span>
							</div>
						</div>
					)
				})}
			</Modal>
			<Modal
                isOpen={isModalOpen}

				onRequestClose={() => setisModalOpen(false)}
				style={customStyles}
				contentLabel="Example Modal"
            >
				<div className='cursor-pointer' onClick={()=>{
						setisModalOpen(false)
					}}>Close</div>
                <div className="px-5 z-[1000000] bg-white  mx-auto flex text-center w-full invert">
					
                    <div className=" rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0   ">
                        <h2 className="text-gray-900 text-lg mb-2 font-bold title-font">Update Your Post</h2>
                        
                        <div className=" mb-4">
                            <label for="email" className="leading-7 text-sm text-gray-600">Title</label>
                            <input type="email" id="email" name="email" className="w-full bg-white rounded border-2 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={(e)=>{
								settitle(e.target.value)
							}}/>
                        </div>
						<div className=" mb-4">
                            <label for="file" className="leading-7 text-sm text-gray-600">Title</label>
                            <input type="file" id="email" name="file" className="w-full bg-white rounded border-2 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={(e)=>{
								setimage(e.target.files[0])
							}}/>
                        </div>
                        <div className="relative mb-4">
                            <label for="message" className="leading-7 text-sm text-gray-600">Message</label>
                            <textarea id="message" name="message" className="w-full bg-white rounded border-2 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out" onChange={(e)=>{
								setcontent(e.target.value)
							}}></textarea>
                        </div>
                        <button className="text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 invert rounded text-lg" onClick={()=>{
							const data = {
								"title":title,
								"content":content,
								"image":image,
								"id":id,
								"access":auth?.access
							}
							console.log(data)
							updatepost1.mutate(data)
						}}>{updatepost1.isLoading?"Loading":"Update"}</button>
                       
                    </div>
                </div>
            </Modal>
			<section className="text-gray-600 body-font">
				<div className="flex flex-col items-center justify-center  pt-10 mx-auto">
					<div className="flex flex-col text-center  justify-center w-full mb-12">
						<div className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900  ">
							<div className='text-3xl font-bold mb-10 text-center '>{router.query.username}</div>
							<div className='w-[300px] bg-purple-500 invert bg-cover bg-no-repeat h-[300px] rounded-full border-0 border-red-500 text-center mx-auto  transition-all fade-in-out relative group mb-10 items-center justify-center flex !text-5xl font-bold'>{auth?.user?.username.slice(0,1)}
							{auth?.user?.pk!=router?.query?.id && (
                                UserDetails?.data?.followers?.filter((user)=>user.id===auth?.user?.pk).length!=0?(
                                    <div className='bg-purple-600 p-2 w-fit h-fit mx-auto my-auto text-white group-hover:block hidden transition-all fade-in-out !text-md absolute font-bold top-[45%] left-[25%] rounded-md cursor-pointer' onClick={()=>{
                                        socket.current.send(JSON.stringify({
                                            "type":"unfollow_request",
                                            "data":{
                                              "follower":auth?.user?.pk,
                                              "followee":router.query.id,
                  
                                            }
                                          }))
                                    }}>Unfollow</div>
                                ):(
                                    <div className='bg-purple-600 p-2 w-fit h-fit mx-auto my-auto text-white group-hover:block hidden transition-all fade-in-out !text-md absolute font-bold top-[45%] left-[32%] rounded-md cursor-pointer' onClick={()=>{
                                        socket.current.send(JSON.stringify({
                                            "type":"follow_request",
                                            "data":{
                                              "follower":auth?.user?.pk,
                                              "followee":router.query.id,
                  
                                            }
                                          }))
                                    }}>follow</div>
                                )
                                
							)}
								
							</div>
						</div>
						<div className=" mx-auto leading-relaxed text-base lg:flex justify-between text-center">
							<div className='mx-5'>
								<span onClick={() => {
									if (UserDetails?.data?.followers?.length === 0) {
										return
									}
									setFollowerIsOpen(true)
								}} className='font-bold text-xl border-0 p-2 bg-black text-white rounded-md cursor-pointer'>
									Followers
								</span>
								<div className="font-bold my-2 text-lg ">
									{UserDetails?.data?.followers?.length}
								</div>
							</div>
							<div className='mx-5'>
								<span onClick={() => {
									if (UserDetails?.data?.followees?.length === 0) {
										return
									}
									setFollowingIsOpen(true)
								}} className='font-bold text-xl border-0 p-2 bg-black text-white rounded-md cursor-pointer'>
									Following
								</span>
								<div className="font-bold my-2 text-lg ">
									{UserDetails?.data?.followees?.length}
								</div>
							</div>
							<div className='mx-5'>
								<span className='font-bold text-xl border-0 p-2 bg-black text-white rounded-md cursor-pointer'>
									Posts
								</span>
								<div className="font-bold my-2 text-lg ">
									{UserDetails?.data?.posts?.length || 0}
								</div>
							</div>
							{auth?.user?.pk == router?.query?.id && (
								<div className='mx-5'>
									<span onClick={() => {
										if (UserDetails?.data?.followrequests?.length === 0) {
											return
										}
										setFollowRequest(true)
									}} className='font-bold text-xl border-0 p-2 bg-black text-white rounded-md cursor-pointer'>
										Requests
									</span>
									<div className="font-bold my-2 text-lg ">
										{UserDetails?.data?.followrequests?.length}
									</div>
								</div>
							)}


						</div>
					</div>
					{/* if the current loggged in user is in the followees then u can display the posts page */}
					{auth?.user?.pk == router?.query?.id  && (
						<div className='border-0 border-black'>
							<div>
								<AddPost />
							</div>

							<h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900 text-center my-20">Your Posts</h1>
							<div className="grid lg:grid-cols-2">

								{UserDetails?.data?.posts?.map((ele, index) => {
									return (
										<div key={index}>
											<div className=' my-5  border-0 border-red-500 w-full'>
												<div className=" p-4 w-full">
													<div className="flex relative w-full">
														<img  className="absolute inset-0  h-full !w-full !object-cover object-center invert" src={ele.post_img} />
														<div className="px-8 py-10 relative z-[1] w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
															<h2 className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1">{ele.post_time}</h2>
															<h1 className="title-font text-lg font-medium text-gray-900 mb-3 break-all">{ele.post_title}</h1>
															<h2 className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1">{ele.post_content}</h2>
															<div className="leading-relaxed">
																<div className='font-bold hover:text-gray-500 transition-all fade-in-out cursor-pointer' onClick={()=>{
																	const data = {
																		"id":ele.id,
																		"access":auth?.access
																	}
																	deletepost1.mutate(data)
																}}>{deletepost1.isLoading?"Loading":"Delete"}</div>
																<div className='font-bold hover:text-gray-500 transition-all fade-in-out cursor-pointer' onClick={()=>{
																	setisModalOpen(true)
																	setid(ele.id)
																}}>Edit</div>
															</div>
														</div>
													</div>
												</div>
											</div>


										</div>
									)
								})}

							</div>
						</div>
					)}
					
					{auth?.user?.pk != router.query.id && UserDetails?.data?.followers?.filter((user) => user.id == auth?.user?.pk).length > 0 && UserDetails?.data?.posts?.length>0 &&  (
						<>
							<h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900 text-center ">{router.query.username}s Posts</h1>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 justify-center items-center">

								{UserDetails?.data?.posts?.map((ele, index) => {
									return (
										<div key={index}>
											<div className=' my-5 mx-5 '>
												<div className=" p-4">
													<div className="flex relative">
														<img alt="gallery" className="absolute inset-0 w-full h-full object-cover object-center !z-[-1] invert" src={ele.post_img} />
														<div className="px-8 py-10 relative z-[-10] w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
															<h2 className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1">{ele.post_time}</h2>
															<h1 className="title-font text-lg font-medium text-gray-900 mb-3 break-all">{ele.post_title}</h1>
															<div className="leading-relaxed">

															</div>
														</div>
													</div>
												</div>
											</div>


										</div>
									)
								})}

							</div>
						</>
					)}


				</div>
			</section>
		</div>
	)
}


export const fetchUserDetails = async (data) => {
	return axios.get(`http://127.0.0.1:8000/api/v1/__get__user__details__/${data.id}`, {
		headers: {
			'Authorization': `Bearer ${data.access}`
		}
	}).then((response) => {
		return response.data;
	}).catch((error) => {
		console.log(error)
	})
}

// server side rendering
export async function getServerSideProps(context) {
	try {
	  const queryClient = new QueryClient();
	  const data = {
		"id":context.params.id,
		"access":context.req.cookies.access
	  }
	  await queryClient.prefetchQuery(
		{
		  queryKey: ["usersDetails"],
		  queryFn: () => fetchUserDetails(data),
		}
	  );
  
	  return {
		props: {
		  dehydratedState: dehydrate(queryClient),
		},
	  };
	} catch (error) {
	  // Handle any errors that occur during the prefetch
	  console.error('Error during prefetch:', error);
	  return {
		props: {
		  dehydratedState: null, // or an appropriate error state
		},
	  };
	}
}

const UpdateUsersPost = async (data) => {
    let formData = new FormData()
	if(data.title){
		formData.append('post_title', data.title)
	}
	if(data.content){
		formData.append('post_content', data.content)
	}
	if(data.image){
		formData.append('post_img', data.image)
	}
	console.log(formData)
    return axios.patch(`http://127.0.0.1:8000/api/v1/__update__post__/${data.id}/`, formData, {
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

const useUpdatePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: UpdateUsersPost,
        onSuccess: (data) => {

            queryClient.invalidateQueries(['usersDetails'])

        },
        onError: (context) => {
            queryClient.setQueryData(['usersDetails'], context.previousData)
        }
    })
}


const DeleteUsersPosts = async (data) =>{
	return axios.delete(`http://127.0.0.1:8000/api/v1/__delete__post__/${data.id}/`,{
		headers:{
			'Authorization': `Bearer ${data.access}`
		}
	})
}

const useDeletePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: DeleteUsersPosts,
        onSuccess: (data) => {

            queryClient.invalidateQueries(['usersDetails'])

        },
        onError: (context) => {
            queryClient.setQueryData(['usersDetails'], context.previousData)
        }
    })
}