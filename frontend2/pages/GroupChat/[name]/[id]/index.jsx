import Context from '@/Context/context'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function GroupPage() {
	const router = useRouter()
	useEffect(() => {
		if (router.query.id) {
			localStorage.setItem('group_id', router.query.id)
		}
	}, [])
	const [GroupUsersList, setGroupUsersList] = useState([]);
	const [Suggestion, setSuggestion] = useState(null);
	const [searchResults, setSearchResults] = useState([]);
	const UsersChattedWith = useQuery({
		queryKey: ["usersChattedWith"],
		queryFn: () => {
			return fetchUsersChattedWith(auth.access);
		},
	});
	const searchUser = (s) => {
		const searchValue = s.toLowerCase();
		console.log(searchValue);
		if (searchValue === "") {
			setSearchResults([]);
			return;
		}
		// search users which are present in UsersChattedWith and not in GroupDetails?.data?.grp_members
		const filteredUsers = UsersChattedWith?.data?.users.filter((user) => {
			return (
				user.user.username.toLowerCase().includes(searchValue) &&
				!GroupDetails?.data?.grp_members?.some((member) => {
					return member.id === user.user.id;
				})
			);
		});
		setSearchResults(filteredUsers);
	};


	const { auth } = useContext(Context)



	const GroupDetails = useQuery({
		queryKey: ["GroupDetails"],
		queryFn: () => {
			return fetchGroupDetails({ id: localStorage.getItem('group_id'), name: router.query.name, access: auth.access });
		},
	});
	let socket = useRef(null)
	useEffect(() => {

		socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${auth?.user?.pk}`)
		socket.current.onopen = (e) => {
			console.log(e)
		}
		socket.current.onmessage = (e) => {
			const data = JSON.parse(e.data)
			console.log(data)
			if (data['type'] == "user_removed_from_group") {
				//refetch
				GroupDetails.refetch()
				toast.success('User Removed From Group', { position: 'top-right' })
			}
			else if (data['type'] == "user_added_to_group") {
				GroupDetails.refetch()
				toast.success('User Added To Group', { position: 'top-right' })
			}
			else if(data['type'] == "user_left_group"){
				router.push('/Chats')
			}
		}
		return () => {
			socket.current.close()
		}
	}, [auth?.user?.pk])
	return (
		<div className='py-24'>
			<section className="text-gray-600 body-font invert">
				<div className="container px-5 py-24 mx-auto">
					<div className="flex flex-col text-center w-full">
						<h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">{GroupDetails?.data?.grp_details?.grp_name}</h1>
						{GroupDetails?.data?.grp_details?.grp_admin === auth?.user?.pk && (
							<p className="lg:w-2/3 mx-auto leading-relaxed text-base">Add User</p>
						)}
						

					</div>
					{GroupDetails?.data?.grp_details?.grp_admin === auth?.user?.pk && (
						<div>
							<div className="relative mb-4 mx-20">
								<label for="message" className="leading-7 text-sm text-gray-600">
									Search User:
								</label>
								<input
									type="text"
									id="searchInput"
									onChange={(e) => {
										searchUser(e.target.value);
									}}
									className="w-full  rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
								/>

								<div className="grid grid-cols-3  !border-black my-2">
									{searchResults?.map((e,index) => {
										return (
											<div 
												className=" rounded border bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
												key={e.user.id}
											>
												<p className=" font-bold">{e.user.username}</p>
												<p
													onClick={() => {
														setGroupUsersList((prev) => {
															return [...prev, e];
														});
														//remove user from search results
														setSearchResults((prev) => {
															return prev.filter((ele) => {
																return ele.user.id !== e.user.id;
															});
														});
													}}
													className="bg-black !text-xs  my-2 text-white w-fit mx-auto rounded-md p-2"
												>
													Add To Group
												</p>
											</div>
										);
									})}
								</div>
								<div
									className={`text-center mx-auto font-bold my-3 ${GroupUsersList.length === 0 ? "hidden" : ""
										}`}
								>
									Added Users
								</div>
								<div className="grid grid-cols-3  my-2">
									{GroupUsersList?.map((e,index) => {
										return (
											<div
											
												className=" rounded border bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
												key={e.user.id}
											>
												<p className=" font-bold">{e.user.username}</p>
												<p
													onClick={() => {
														//remove user from group user list
														setGroupUsersList((prev) => {
															return prev.filter((ele) => {
																return ele.user.id !== e.user.id;
															});
														});
														//add user to search results
														setSearchResults((prev) => {
															return [...prev, e];
														});
													}}
													className="bg-black !text-xs  my-2 text-white w-fit mx-auto rounded-md p-2"
												>
													Remove
												</p>
											</div>
										);
									})}
								</div>

							</div>
							<button className='border-2 border-black p-2 rounded-md bg-black text-md text-white mx-auto flex justify-center' onClick={() => {
								socket.current.send(JSON.stringify({
									"type": "add_user_to_group",
									"data": {
										"sender": auth.user.pk,
										"users": GroupUsersList.map((e) => {
											return e.user.id
										}),
										"group_id": localStorage.getItem('group_id')
									}

								}))
							}}>Add Selected Users</button>
						</div>
					)}
					{/* leave group button should not be there for admin */}
					{GroupDetails?.data?.grp_details?.grp_admin !== auth?.user?.pk && (
						<button className='border-2 border-black p-2 rounded-md bg-black text-md text-white mx-auto flex justify-center' onClick={() => {
							socket.current.send(JSON.stringify({
								"type": "leave_group",
								"data": {
									"sender": auth.user.pk,
									"group_id": localStorage.getItem('group_id')
								}

							}))
					}}>Leave Group</button>
					)}
					
					<div className="flex flex-wrap -m-2 items-center justify-center">
						{GroupDetails?.data?.grp_members?.map((member,index) => {
							return (
								//if user is admin then show remove button
								<div key={index} className="p-2 bg-white border-2 rounded-lg border-black lg:w-1/3 md:w-1/2 w-full my-10 lg:mx-10">
									<div className="h-full flex items-center   p-4 ">
										<div alt="team" className="w-16 h-16   object-cover object-center flex-shrink-0 rounded-full mr-4 text-center items-center justify-center flex bg-purple-500 invert text-xl text-black font-bold" >p</div>
										<div className="flex-grow">
											<h2 className="text-gray-900 title-font font-medium">{member.username}</h2>
											<p className="text-gray-500">{member.last_login}</p>
										</div>
										<div id="buttons" className='mx-3'>

											{member.id != auth.user.pk && (
												GroupDetails?.data?.grp_details?.grp_admin === auth?.user?.pk && (
													<button className='border-2 border-black p-2 rounded-md bg-black text-md text-white' onClick={() => {
														socket.current.send(JSON.stringify({
															"type": "remove",
															"data": {
																"sender": auth.user.pk,
																"receiver": member.id,
																"group_id": localStorage.getItem('group_id')
															}

														}))
													}}>Remove User</button>
												)
											)}


											<button></button>
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


const fetchGroupDetails = async (data) => {
	console.log(data)
	return axios.get('http://127.0.0.1:8000/api/v1/__get__group__details__/' + data.id + '/', {
		headers: {
			'Authorization': 'Bearer ' + data.access,
		}
	}).then((response) => {
		return response.data
	})
}

export const fetchUsersChattedWith = async (access) => {
	return axios
		.get(
			"http://127.0.0.1:8000/api/v1/__get__users__who__logged__in__user__has__chatted__/",
			{
				headers: {
					Authorization: `Bearer ${access}`,
				},
			}
		)
		.then((response) => {
			return response.data;
		})
		.catch((error) => {
			console.log(error);
			return [];
		});
};