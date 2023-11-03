import React from 'react'

export default function EachMessage({ele,key}) {
    const user = 1;
    return (
        <div>
            <div className={`message-list ${user!==ele.sender?"me":""}`}>
                <div className="msg">
                    <p>
                        {ele.message}
                    </p>
                </div>
                <div className="time">{ele.created_at}</div>
            </div>
        </div>
    )
}
