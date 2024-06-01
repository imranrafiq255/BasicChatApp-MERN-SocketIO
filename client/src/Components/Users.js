import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get("/api/v1/user/load-all-users");
        setUsers(response.data.users);
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
    loadUsers();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newFilteredUsers = users.filter(
        (item) => item._id !== currentUser._id
      );
      setFilteredUsers(newFilteredUsers);
    }
  }, [currentUser, users]);

  const addConversationHandler = async (id) => {
    try {
      const response = await axios.get(`/api/v1/user/conversation/${id}`);
      console.log(response.data.message);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };
  return (
    <>
      <div className="user-container bg-slate-200 w-screen h-screen">
        <button
          className="w-1/4 bg-slate-600 text-white h-20 m-10 rounded-xl"
          onClick={() => {
            navigate("/");
          }}
        >
          Start Chat
        </button>
        <div className="users">
          {filteredUsers &&
          Array.isArray(filteredUsers) &&
          filteredUsers.length > 0
            ? filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="w-1/4 ml-10 mt-3 h-24 flex items-center justify-around bg-pink-200 rounded-lg shadow-lg "
                >
                  <div className="flex items-center h-full">
                    <img
                      src={require("../Assets/woman.png")}
                      alt=""
                      className="h-[80%] rounded-full shadow-lg border-blue-500 border-2 ml-6"
                    />
                    <div className="flex flex-col ml-4">
                      <h1 className="text-lg font-bold">{user.fullName}</h1>
                      <h1 className="text-xs text-start">{user.email}</h1>
                    </div>
                  </div>
                  <img
                    src={require("../Assets/add.png")}
                    alt=""
                    className="h-[50%] cursor-pointer"
                    onClick={() => addConversationHandler(user._id)}
                  />
                </div>
              ))
            : ""}
        </div>
      </div>
    </>
  );
};

export default Users;
