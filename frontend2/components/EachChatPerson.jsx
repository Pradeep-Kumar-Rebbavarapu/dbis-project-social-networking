import React from 'react'

export default function EachChatPerson({ele}) {
    return (
        <div  onClick={()=>{

        }}>
            <div className="list">
                <div id="img" className='!text-center !flex !items-center !justify-center text-white text-xl font-bold bg-purple-500'>{ele.name.slice(0,1)}</div>
                <div className="info">
                    <span className="user">{ele.name}</span>
                    <span className="text">{ele.last_message}</span>
                </div>
                <span className="time">{ele.last_login}</span>
            </div>
        </div>
    )
}
