import React, { useContext, useState } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Context from '@/Context/context'
import Modal from 'react-modal';
export default function AddPost() {
    const [title, settitle] = useState(null)
    const [content, setcontent] = useState(null)
    const [image, setimage] = useState(null)
    const { auth } = useContext(Context)
    const post1 = useAddPost()
    const [isModalOpen,setisModalOpen] = useState(false)
    const customStyles = {
		content: {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
		},
	};
    return (
        <div>
            
            <section className="text-gray-600 body-font relative">
                <div className="container px-5 mx-auto">
                    <div className="flex flex-col text-center w-full mb-12">
                        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Add Post</h1>
                        <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Add A post And Let People Get To Know Whats Around You.</p>
                    </div>
                    <div className="lg:w-1/2 md:w-2/3 mx-auto">
                        <div className="flex flex-wrap -m-2">
                            <div className="p-2 w-1/2">
                                <div className="relative">
                                    <label for="name" className="leading-7 text-sm text-gray-600">Title</label>
                                    <input type="text" id="name" name="name" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={(e) => {
                                        settitle(e.target.value)
                                    }} />
                                </div>
                            </div>
                            <div className="p-2 w-1/2">
                                <div className="relative">
                                    <label for="email" className="leading-7 text-sm text-gray-600">Image</label>
                                    <input type="file" id="email" name="image" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={(e) => {
                                        setimage(e.target.files[0])
                                    }} />
                                </div>
                            </div>
                            <div className="p-2 w-full">
                                <div className="relative">
                                    <label for="message" className="leading-7 text-sm text-gray-600">Description</label>
                                    <textarea id="message" name="message" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out" onChange={(e) => {
                                        setcontent(e.target.value)
                                    }}></textarea>
                                </div>
                            </div>
                            <div className="p-2 w-full">
                                <button className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={() => {
                                    const data = {
                                        title: title,
                                        content: content,
                                        image: image,
                                        user: auth.user.pk,
                                        access: auth.access
                                    }
                                    post1.mutate(data)
                                }}>Add Post</button>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}


const AddUsersPost = async (data) => {
    let formData = new FormData()
    formData.append('post_title', data.title)
    formData.append('post_content', data.content)
    formData.append('post_img', data.image)
    formData.append('user', data.user)
    return axios.post(`http://127.0.0.1:8000/api/v1/__create__post__/`, formData, {
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

const useAddPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: AddUsersPost,
        onSuccess: (data) => {

            queryClient.invalidateQueries(['usersDetails'])

        },
        onError: (context) => {
            queryClient.setQueryData(['usersDetails'], context.previousData)
        }
    })
}