import { useEffect, useRef, useState } from "react";
import { createContext } from "react"
import Cookies from 'js-cookie'
import { useRouter } from "next/router";
const Context = createContext()

export default Context;

export const ContextProvider = ({ children }) => {
    const [EachUsersMessages, setEachUsersMessages] = useState(null)
    const [user, setuser] = useState({
        "id": 1,
        "username": "pradeepkumar",
    })
    const UsersChattedWith = useRef([])
    let socket = useRef(null)
    const router = useRouter()
    const [auth, setauth] = useState(() => Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null)
    const Logout = () => {
        setauth(null)
        Cookies.remove('auth')
        localStorage.clear()
        router.push('/JoinUsPage')
    }
    useEffect(() => {
        if (!auth && router.pathname !== '/JoinUsPage' && router.pathname !== '/' && router.pathname !== '/AboutUsPage') {
            router.push('/JoinUsPage')
        }
    }, [router,auth])

    const ContextData = {
        EachUsersMessages,
        setEachUsersMessages,
        socket,
        user,
        setuser,
        auth,
        setauth,
        Logout,
        UsersChattedWith

    }
    return (
        <Context.Provider value={ContextData}>
            {children}
        </Context.Provider>
    )
}
