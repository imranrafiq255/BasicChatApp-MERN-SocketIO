import React, { useEffect, useState } from "react";
import "./ChatDashboard.css";
import axios from "axios";
import { io } from "socket.io-client";
// import ReactScrollToBottom from "react-scroll-to-bottom";
import { useNavigate } from "react-router-dom";
const ChatDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await axios.get(
          "/api/v1/user/load-current-user-conversation"
        );
        setConversations(response.data.conversations);
        if (response.data.conversations.length > 0) {
          const firstUser = response.data.conversations[0];
          setReceiver(firstUser);
          loadMessages(firstUser);
        }
      } catch (error) {
        console.log(error.response.data.message);
      }
    };

    const loadCurrentUser = async () => {
      try {
        const response = await axios.get("/api/v1/user/load-current-user");
        setCurrentUser(response.data.currentUser);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };

    loadConversations();
    loadCurrentUser();
  }, []);

  const loadMessages = async (user) => {
    try {
      setReceiver(user);
      const response = await axios.get(
        `/api/v1/user/load-messages/${user.conversationId}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  const sendMessage = async (conversationId, receiverId) => {
    try {
      socket?.emit("sendMessage", {
        conversationId,
        receiverId,
        message: text,
        senderId: currentUser?._id,
      });
      const data = { conversationId, message: text };
      const response = await axios.post("/api/v1/user/send-message", data);
      console.log(response.data.message);
      setText("");
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  // Client Sockets
  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit("addUser", currentUser._id);
      socket.on("getUsers", (users) => {
        console.log("Active users:", users);
        setActiveUsers(users);
      });
      socket.on("getMessage", (data) => {
        console.log(data);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            conversationId: data.conversationId,
            senderId: data.senderId,
            message: data.message,
          },
        ]);
        console.log("Received message:", data);
      });
      return () => {
        socket.off();
      };
    }
  }, [socket, currentUser]);
  useEffect(() => {
    if (receiver) {
      loadMessages(receiver);
    }
  }, [receiver]);
  const checkOnline = (id) => {
    return activeUsers?.some((active) => active.userId === id);
  };

  return (
    <>
      <div className="dashboard-container flex flex-wrap w-screen h-screen">
        <div className="left w-3/12 bg-slate-200 h-full">
          <div className="w-full">
            <div className="logged-user flex justify-center items-center mt-10">
              <img
                src={require("../Assets/woman.png")}
                alt=""
                className="w-20 h-20 rounded-full shadow-lg"
              />
              <div className="flex flex-col ml-3">
                <h1 className="text-xl font-bold">
                  {currentUser && currentUser.fullName}
                </h1>
                <h1>my account</h1>
              </div>
            </div>
            <button
              className="w-3/4 bg-slate-600 text-white h-14 m-10 rounded-xl"
              onClick={() => {
                navigate("/users");
              }}
            >
              Add People
            </button>
            <h1 className="ml-2 mt-10 text-blue-500">Messages</h1>
            {conversations &&
            Array.isArray(conversations) &&
            conversations.length > 0 ? (
              conversations.map((user) => (
                <div
                  key={user._id}
                  onClick={() => loadMessages(user)}
                  className=" cursor-pointer"
                >
                  <div className="flex gap-1 items-center ml-2 mt-2">
                    <img
                      src={require("../Assets/woman.png")}
                      alt=""
                      className="w-10 h-10 rounded-full shadow-lg border-blue-500 border-2"
                    />
                    <div className="flex flex-col ml-1">
                      <h1 className="text-xs">{user?.otherUser.fullName}</h1>
                      <h1 className="text-xs">{user?.otherUser.email}</h1>
                    </div>
                  </div>
                  <div className="w-full h-[0.1px] my-3 bg-slate-400"></div>
                </div>
              ))
            ) : (
              <div>No users</div>
            )}
          </div>
        </div>
        {receiver && (
          <div className="right w-9/12 bg-purple-200 h-full relative">
            <div className="w-full h-full flex flex-col items-center mt-5">
              <div className="chat-header text-center w-10/12 bg-slate-400 h-20 rounded-xl flex justify-between">
                <div className="w-full h-full flex items-center">
                  <img
                    src={require("../Assets/woman.png")}
                    alt=""
                    className="h-[80%] rounded-full shadow-lg border-blue-500 border-2 ml-6"
                  />
                  <div className="flex flex-col ml-4">
                    <h1 className="text-lg font-bold">
                      {receiver?.otherUser?.fullName}
                    </h1>
                    {activeUsers && (
                      <h1 className="text-xs text-start">
                        {checkOnline(receiver?.otherUser?._id)}
                        {checkOnline(receiver?.otherUser?._id)
                          ? "online"
                          : "offline"}
                      </h1>
                    )}
                  </div>
                </div>
                <div className="flex items-center mr-8">
                  <img
                    src={require("../Assets/phone-call.png")}
                    alt=""
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <div className="chat w-10/12 h-[737px] overflow-scroll scrollbar-custom my-5">
                {messages &&
                  currentUser &&
                  Array.isArray(messages) &&
                  messages.map((message) =>
                    message?.senderId?._id === currentUser?._id ||
                    message?.senderId === currentUser?._id ? (
                      <div
                        key={message?._id}
                        className="message bg-green-500 text-white max-w-[40%] my-2 p-3 rounded-b-xl rounded-tl-xl ml-auto mb-6"
                      >
                        {message?.message}
                      </div>
                    ) : (
                      <div
                        key={message._id}
                        className="message bg-slate-200 max-w-[40%] my-2 p-3 rounded-b-xl rounded-tr-xl mb-6"
                      >
                        {message?.message}
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="w-[80%] h-[100px] absolute bottom-0 right-[10%] flex items-center">
              <input
                type="text"
                className="h-[50%] w-[80%] ml-10 rounded-md outline-none px-4"
                placeholder="Type here ..."
                onChange={(e) => setText(e.target.value)}
                value={text}
              />
              {text && (
                <img
                  src={require("../Assets/send.png")}
                  alt=""
                  className="w-10 h-10 ml-8 cursor-pointer"
                  onClick={() =>
                    sendMessage(
                      receiver?.conversationId,
                      receiver?.otherUser?._id
                    )
                  }
                />
              )}
              <img
                src={require("../Assets/add.png")}
                alt=""
                className="w-10 h-10 ml-10 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatDashboard;
