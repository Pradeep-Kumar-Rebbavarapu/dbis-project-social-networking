"use client";
import EachChatPerson from "@/components/EachChatPerson";
import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import axios from "axios";
import {
  useQuery,
  dehydrate,
  QueryClient,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import EachMessage from "@/components/EachMessage";
import { useContext } from "react";
import Context from "@/Context/context";
import w3cwebsocket from "websocket";
import { useRouter } from "next/router";
import { OpenAI } from "openai";

const api_key = "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";

export default function Chats() {
  let [Message, setMessage] = useState(null);
  const [Receiver, setReceiver] = useState(null);
  const [ReceiverName, setReceiverName] = useState(null);
  const { EachUsersMessages, setEachUsersMessages, auth } = useContext(Context);
  console.log(EachUsersMessages);
  let socket = useRef(null);
  const router = useRouter();
  useEffect(() => {
    //scroll the chat area to the bottom
    const msgBody = document.getElementById("msg-body");
    const ul = document.querySelector("#msg-body ul");
    ul.scrollTop = ul.scrollHeight;
    msgBody.scrollTop = msgBody.scrollHeight;
  }, [EachUsersMessages]);

  useEffect(() => {
    if (!auth) {
      router.push("/JoinUsPage");
    }
    socket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${auth.user.pk}`
    );

    socket.current.onopen = () => {
      console.log("ws opened");
    };
    socket.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(e);
      console.log(data);
      if (data["type"] === "sent_message") {
        console.log(data);
        const new_data = {
          sender: data["sender"],
          message: data["message"],
          receiver: data["receiver"],
          id: data["id"],
          created_at: data["created_at"],
        };
        setEachUsersMessages((prev) => {
          return [...prev, new_data];
        });
      } else if (data["type"] === "receive_message") {
        const new_data = {
          sender: data["sender"],
          message: data["message"],
          receiver: data["receiver"],
          id: data["id"],
          created_at: data["created_at"],
        };
        setEachUsersMessages((prev) => {
          return [...prev, new_data];
        });
      }
      //auto scroll the message-wrapper to the bottom when message recieved
    };
    socket.current.onclose = () => {
      console.log("ws closed");
    };
    socket.current.onerror = (e) => {
      console.log(e);
    };
  }, [socket.current]);

  const UsersChattedWith = useQuery({
    queryKey: ["usersChattedWith"],
    queryFn: () => {
      return fetchUsersChattedWith(auth.access);
    },
  });

  const post1 = useGetUsersChats();

  return (
    <div className="flex justify-center items-center w-full h-full">
      {/* <!-- char-area --> */}
      <section className="message-area ">
        <div className="">
          <div className="row">
            <div className="col-12">
              <div className="chat-area ">
                <div className="chatlist">
                  <div className="modal-dialog-scrollable">
                    <div className="modal-content ">
                      <div className="chat-header ">
                        <div className="msg-search">
                          <input
                            type="text"
                            className="form-control"
                            id="inlineFormInputGroup"
                            placeholder="Search"
                            aria-label="search"
                          />
                          <a className="add" href="#">
                            <img
                              className="!mx-2"
                              src="https://mehedihtml.com/chatbox/assets/img/add.svg"
                              alt="add"
                            />
                          </a>
                        </div>
                      </div>

                      <div className="modal-body !overflow-scroll !h-full !p-0 !m-0">
                        {/* <!-- chat-list --> */}
                        <div className="chat-lists !overflow-scroll !h-full !p-0 !m-0">
                          <div
                            className="tab-content !overflow-scroll !h-full !p- !m-0"
                            id="myTabContent"
                          >
                            <div
                              className="tab-pane fade show active !overflow-scroll !h-full !p-0 !m-0"
                              id="Open"
                              role="tabpanel"
                              aria-labelledby="Open-tab"
                            >
                              {/* <!-- chat-list --> */}
                              <div className="chat-list !overflow-scroll !h-screen !p-0 !m-0">
                                {UsersChattedWith?.data?.map((ele, index) => {
                                  return (
                                    <div
                                      id={`${ele.name}-${index}`}
                                      className="flex items-center !py-3 cursor-pointer"
                                      key={index}
                                      onClick={() => {
                                        setReceiver(ele.user.id);
                                        setReceiverName(ele.user.username);
                                        post1.mutate({
                                          receiver: ele.user.id,
                                          access: auth.access,
                                        });
                                      }}
                                    >
                                      <div className="flex-shrink-0 relative">
                                        <img
                                          className="!mx-2"
                                          src="https://mehedihtml.com/chatbox/assets/img/user.png"
                                          alt="user img"
                                        />
                                        <span className="active absolute"></span>
                                      </div>
                                      <div className="flex-grow-1 ms-3">
                                        <h3>{ele.user.username}</h3>
                                        <p>front end developer</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {/* <!-- chat-list --> */}
                            </div>
                          </div>
                        </div>
                        {/* <!-- chat-list --> */}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- chatlist --> */}

                {/* <!-- chatbox --> */}
                <div className="chatbox">
                  <div className="modal-dialog-scrollable ">
                    <div className="modal-content h-full">
                      <div className="msg-head ">
                        <div className="row">
                          <div className="col-8">
                            <div className="flex items-center !py-3">
                              <span className="chat-icon">
                                <img
                                  className="!mx-2"
                                  src="https://mehedihtml.com/chatbox/assets/img/arroleftt.svg"
                                  alt="image title"
                                />
                              </span>
                              <div className="flex-shrink-0">
                                <img
                                  className="!mx-2"
                                  src="https://mehedihtml.com/chatbox/assets/img/user.png"
                                  alt="user img"
                                />
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h3>{ReceiverName}</h3>
                                <p>front end developer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="modal-body !overflow-scroll !h-full !pb-10">
                        <div
                          id="msg-body"
                          className="msg-body !overflow-scroll !h-full"
                        >
                          <ul className=" !overflow-scroll !h-full">
                            {EachUsersMessages?.map((ele, index) => {
                              return (
                                <div className="" key={index}>
                                  <li
                                    className={`${
                                      auth.user.pk === ele.sender
                                        ? "sender"
                                        : "repaly"
                                    }`}
                                  >
                                    <p> {ele.message} </p>
                                    <span className="time">
                                      {ele.created_at}
                                    </span>
                                  </li>
                                </div>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="send-box flex">
                <input
                  type="text"
                  className="form-control"
                  aria-label="message…"
                  placeholder="Write message…"
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    console.log(socket);
                    var Filter = require("bad-words"),
                    filter = new Filter();
                    Message = filter.clean(Message);
                    setMessage(Message);
                    console.log(Message)
                    socket.current.send(
                      JSON.stringify({
                        type: "send_message_to_user",
                        data: {
                          sender: String(auth.user.pk),
                          message: Message,
                          receiver: Receiver,
                        },
                      })
                    );
                  }}
                >
                  <i className="fa fa-paper-plane" aria-hidden="true"></i> Send
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const openai = new OpenAI({
                      apiKey: api_key,
                      dangerouslyAllowBrowser: true,
                    });
                    const response = openai.chat.completions.create({
                      model: "gpt-3.5-turbo",
                      message: [
                        {
                          role: "user",
                          content:
                            "Tell me a sutable response for the message: '" +
                            EachUsersMessages[EachUsersMessages.length - 1]
                              .Message +
                            "'. Only the message and remove the quotes.",
                        },
                      ],
                    });
                    // const suggestion = response['choices']['message']['content'];
                    console.log(response);
                  }}
                >
                  <i className="fa fa-paper-plane" aria-hidden="true"></i>{" "}
                  Suggest Response{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style jsx>
        {`
          /* **********************************
        Reset CSS
        ************************************** */

          html,
          body,
          div,
          span,
          applet,
          object,
          iframe,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6,
          p,
          blockquote,
          pre,
          a,
          abbr,
          acronym,
          address,
          big,
          cite,
          code,
          del,
          dfn,
          em,
          img,
          ins,
          kbd,
          q,
          s,
          samp,
          small,
          strike,
          strong,
          sub,
          sup,
          tt,
          var,
          b,
          u,
          i,
          center,
          dl,
          dt,
          dd,
          ol,
          ul,
          li,
          fieldset,
          form,
          label,
          legend,
          table,
          caption,
          tbody,
          tfoot,
          thead,
          tr,
          th,
          td,
          article,
          aside,
          canvas,
          details,
          embed,
          figure,
          figcaption,
          footer,
          header,
          hgroup,
          menu,
          nav,
          output,
          ruby,
          section,
          summary,
          time,
          mark,
          audio,
          video {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
          }

          /* HTML5 display-role reset for older browsers */

          article,
          aside,
          details,
          figcaption,
          figure,
          footer,
          header,
          hgroup,
          menu,
          nav,
          section {
            display: block;
          }

          body {
            line-height: 1.5;
          }

          ol,
          ul {
            list-style: none;
          }

          blockquote,
          q {
            quotes: none;
          }

          blockquote:before,
          blockquote:after,
          q:before,
          q:after {
            content: "";
            content: none;
          }

          table {
            border-collapse: collapse;
            border-spacing: 0;
          }

          /********************************
         Typography Style
        ******************************** */

          body {
            margin: 0;
            font-family: "Open Sans", sans-serif;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          html {
            min-height: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1 {
            font-size: 36px;
          }

          h2 {
            font-size: 30px;
          }

          h3 {
            font-size: 26px;
          }

          h4 {
            font-size: 22px;
          }

          h5 {
            font-size: 18px;
          }

          h6 {
            font-size: 16px;
          }

          p {
            font-size: 15px;
          }

          a {
            text-decoration: none;
            font-size: 15px;
          }

          * {
            margin-bottom: 0;
          }

          /* *******************************
        message-area
        ******************************** */

          .message-area {
            width: 90%;
            overflow: hidden;
            margin: 40px 0px 40px 0px;
          }

          .chat-area {
            position: relative;
            width: 100%;
            background-color: #fff;
            border-radius: 0.3rem;
            height: 100vh;
            overflow: hidden;
            min-height: calc(100% - 1rem);
          }

          .chatlist {
            outline: 0;
            height: 100%;
            overflow: hidden;
            width: 300px;
            float: left;
            padding: 15px;
          }

          .chat-area .modal-content {
            border: none;
            border-radius: 0;
            outline: 0;
            height: 100%;
          }

          .chat-area .modal-dialog-scrollable {
            height: 100% !important;
          }

          .chatbox {
            width: auto;
            overflow: hidden;
            height: 100%;
            border-left: 1px solid #ccc;
          }

          .chatbox .modal-dialog,
          .chatlist .modal-dialog {
            max-width: 100%;
            margin: 0;
          }

          .msg-search {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .chat-area .form-control {
            display: block;
            width: 80%;
            padding: 0.375rem 0.75rem;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            color: #222;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid #ccc;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border-radius: 0.25rem;
            transition: border-color 0.15s ease-in-out,
              box-shadow 0.15s ease-in-out;
          }

          .chat-area .form-control:focus {
            outline: 0;
            box-shadow: inherit;
          }

          a.add img {
            height: 36px;
          }

          .chat-area .nav-tabs {
            border-bottom: 1px solid #dee2e6;
            align-items: center;
            justify-content: space-between;
            flex-wrap: inherit;
          }

          .chat-area .nav-tabs .nav-item {
            width: 100%;
          }

          .chat-area .nav-tabs .nav-link {
            width: 100%;
            color: #180660;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            text-transform: capitalize;
            margin-top: 5px;
            margin-bottom: -1px;
            background: 0 0;
            border: 1px solid transparent;
            border-top-left-radius: 0.25rem;
            border-top-right-radius: 0.25rem;
          }

          .chat-area .nav-tabs .nav-item.show .nav-link,
          .chat-area .nav-tabs .nav-link.active {
            color: #222;
            background-color: #fff;
            border-color: transparent transparent #000;
          }

          .chat-area .nav-tabs .nav-link:focus,
          .chat-area .nav-tabs .nav-link:hover {
            border-color: transparent transparent #000;
            isolation: isolate;
          }

          .chat-list h3 {
            color: #222;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.5;
            text-transform: capitalize;
            margin-bottom: 0;
          }

          .chat-list p {
            color: #343434;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            text-transform: capitalize;
            margin-bottom: 0;
          }

          .chat-list a.d-flex {
            margin-bottom: 15px;
            position: relative;
            text-decoration: none;
          }

          .chat-list .active {
            display: block;
            content: "";
            clear: both;
            position: absolute;
            bottom: 3px;
            left: 34px;
            height: 12px;
            width: 12px;
            background: #00db75;
            border-radius: 50%;
            border: 2px solid #fff;
          }

          .msg-head h3 {
            color: #222;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.5;
            margin-bottom: 0;
          }

          .msg-head p {
            color: #343434;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            text-transform: capitalize;
            margin-bottom: 0;
          }

          .msg-head {
            padding: 15px;
            border-bottom: 1px solid #ccc;
          }

          .moreoption {
            display: flex;
            align-items: center;
            justify-content: end;
          }

          .moreoption .navbar {
            padding: 0;
          }

          .moreoption li .nav-link {
            color: #222;
            font-size: 16px;
          }

          .moreoption .dropdown-toggle::after {
            display: none;
          }

          .moreoption .dropdown-menu[data-bs-popper] {
            top: 100%;
            left: auto;
            right: 0;
            margin-top: 0.125rem;
          }

          .msg-body ul {
            overflow: scroll;
            padding: 15px;
          }

          .msg-body ul li {
            list-style: none;
            margin: 15px 0;
          }

          .msg-body ul li.sender {
            display: block;
            width: 100%;
            position: relative;
          }

          .msg-body ul li.sender:before {
            display: block;
            clear: both;
            content: "";
            position: absolute;
            top: -6px;
            left: -7px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 12px 15px 12px;
            border-color: transparent transparent #f5f5f5 transparent;
            -webkit-transform: rotate(-37deg);
            -ms-transform: rotate(-37deg);
            transform: rotate(-37deg);
          }

          .msg-body ul li.sender p {
            color: #000;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 400;
            padding: 15px;
            background: #f5f5f5;
            display: inline-block;
            border-bottom-left-radius: 10px;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
            margin-bottom: 0;
          }

          .msg-body ul li.sender p b {
            display: block;
            color: #180660;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 500;
          }

          .msg-body ul li.repaly {
            display: block;
            width: 100%;
            text-align: right;
            position: relative;
          }

          .msg-body ul li.repaly:before {
            display: block;
            clear: both;
            content: "";
            position: absolute;
            bottom: 15px;
            right: -7px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 12px 15px 12px;
            border-color: transparent transparent #4b7bec transparent;
            -webkit-transform: rotate(37deg);
            -ms-transform: rotate(37deg);
            transform: rotate(37deg);
          }

          .msg-body ul li.repaly p {
            color: #fff;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 400;
            padding: 15px;
            background: #4b7bec;
            display: inline-block;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            border-bottom-left-radius: 10px;
            margin-bottom: 0;
          }

          .msg-body ul li.repaly p b {
            display: block;
            color: #061061;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 500;
          }

          .msg-body ul li.repaly:after {
            display: block;
            content: "";
            clear: both;
          }

          .time {
            display: block;
            color: #000;
            font-size: 12px;
            line-height: 1.5;
            font-weight: 400;
          }

          li.repaly .time {
            margin-right: 20px;
          }

          .divider {
            position: relative;
            z-index: 1;
            text-align: center;
          }

          .msg-body h6 {
            text-align: center;
            font-weight: normal;
            font-size: 14px;
            line-height: 1.5;
            color: #222;
            background: #fff;
            display: inline-block;
            padding: 0 5px;
            margin-bottom: 0;
          }

          .divider:after {
            display: block;
            content: "";
            clear: both;
            position: absolute;
            top: 12px;
            left: 0;
            border-top: 1px solid #ebebeb;
            width: 100%;
            height: 100%;
            z-index: -1;
          }

          .send-box {
            padding: 15px;
            border-top: 1px solid #ccc;
          }

          .send-box form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
          }

          .send-box .form-control {
            display: block;
            width: 85%;
            padding: 0.375rem 0.75rem;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            color: #222;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid #ccc;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border-radius: 0.25rem;
            transition: border-color 0.15s ease-in-out,
              box-shadow 0.15s ease-in-out;
          }

          .send-box button {
            border: none;
            background: #3867d6;
            padding: 0.375rem 5px;
            color: #fff;
            border-radius: 0.25rem;
            font-size: 14px;
            font-weight: 400;
            width: 24%;
            margin-left: 1%;
          }

          .send-box button i {
            margin-right: 5px;
          }

          .send-btns .button-wrapper {
            position: relative;
            width: 125px;
            height: auto;
            text-align: left;
            margin: 0 auto;
            display: block;
            background: #f6f7fa;
            border-radius: 3px;
            padding: 5px 15px;
            float: left;
            margin-right: 5px;
            margin-bottom: 5px;
            overflow: hidden;
          }

          .send-btns .button-wrapper span.label {
            position: relative;
            z-index: 1;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            width: 100%;
            cursor: pointer;
            color: #343945;
            font-weight: 400;
            text-transform: capitalize;
            font-size: 13px;
          }

          #upload {
            display: inline-block;
            position: absolute;
            z-index: 1;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            opacity: 0;
            cursor: pointer;
          }

          .send-btns .attach .form-control {
            display: inline-block;
            width: 120px;
            height: auto;
            padding: 5px 8px;
            font-size: 13px;
            font-weight: 400;
            line-height: 1.5;
            color: #343945;
            background-color: #f6f7fa;
            background-clip: padding-box;
            border: 1px solid #f6f7fa;
            border-radius: 3px;
            margin-bottom: 5px;
          }

          .send-btns .button-wrapper span.label img {
            margin-right: 5px;
          }

          .button-wrapper {
            position: relative;
            width: 100px;
            height: 100px;
            text-align: center;
            margin: 0 auto;
          }

          button:focus {
            outline: 0;
          }

          .add-apoint {
            display: inline-block;
            margin-left: 5px;
          }

          .add-apoint a {
            text-decoration: none;
            background: #f6f7fa;
            border-radius: 8px;
            padding: 8px 8px;
            font-size: 13px;
            font-weight: 400;
            line-height: 1.2;
            color: #343945;
          }

          .add-apoint a svg {
            margin-right: 5px;
          }

          .chat-icon {
            display: none;
          }

          .closess i {
            display: none;
          }

          @media (max-width: 767px) {
            .chat-icon {
              display: block;
              margin-right: 5px;
            }
            .chatlist {
              width: 100%;
            }
            .chatbox {
              width: 100%;
              position: absolute;
              left: 1000px;
              right: 0;
              background: #fff;
              transition: all 0.5s ease;
              border-left: none;
            }
            .showbox {
              left: 0 !important;
              transition: all 0.5s ease;
            }
            .msg-head h3 {
              font-size: 14px;
            }
            .msg-head p {
              font-size: 12px;
            }
            .msg-head .flex-shrink-0 img {
              height: 30px;
            }
            .send-box button {
              width: 28%;
            }
            .send-box .form-control {
              width: 70%;
            }
            .chat-list h3 {
              font-size: 14px;
            }
            .chat-list p {
              font-size: 12px;
            }
            .msg-body ul li.sender p {
              font-size: 13px;
              padding: 8px;
              border-bottom-left-radius: 6px;
              border-top-right-radius: 6px;
              border-bottom-right-radius: 6px;
            }
            .msg-body ul li.repaly p {
              font-size: 13px;
              padding: 8px;
              border-top-left-radius: 6px;
              border-top-right-radius: 6px;
              border-bottom-left-radius: 6px;
            }
          }
        `}
      </style>
    </div>
  );
}

const fetchUsersChats = async (data) => {
  return axios
    .post(
      `http://127.0.0.1:8000/api/v1/__get__chats__related__to__user__and__receiver__/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${data.access}`,
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

const useGetUsersChats = () => {
  const queryClient = useQueryClient();
  const { EachUsersMessages, setEachUsersMessages } = useContext(Context);
  return useMutation({
    mutationFn: fetchUsersChats,
    onSuccess: (data) => {
      setEachUsersMessages(data);
      queryClient.invalidateQueries(["UsersMessages"]);
    },
    onError: (context) => {
      queryClient.setQueryData(["UsersMessages"], context.previousData);
    },
  });
};

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

export async function getServerSideProps(context) {
  const queryClient = new QueryClient();
  const access = context.req.cookies.access;
  await queryClient.prefetchQuery({
    queryKey: ["usersChattedWith"],
    queryFn: () => {
      return fetchUsersChattedWith(auth.access);
    },
  });
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
