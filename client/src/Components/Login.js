import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
const Login = ({ isLoggedIn = true }) => {
  const [data, setData] = useState({
    ...(!isLoggedIn && { fullName: "" }),
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const signUpHandler = async (e) => {
    try {
      const response = await axios.post("/api/v1/user/register", data);
      console.log(response.data.message);
      setError("");
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  const signInHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/v1/user/login", data);
      console.log(response.data.message);
      setError("");
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  return (
    <>
      <div className="login-container flex justify-center items-center w-screen h-screen">
        <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-slate-300 w-[400px] h-[700px] rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
              Welcome Back
            </h2>
            <h2 className="text-center text-xl mt-3">
              {isLoggedIn ? "Sign in" : "Sign up"} to get started
            </h2>
          </div>
          {error && (
            <div>
              <h1 className=" text-red-500">{error}</h1>
            </div>
          )}
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" action="#" method="POST">
              {!isLoggedIn && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Enter name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required=""
                      onChange={(e) =>
                        setData({ ...data, fullName: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                    />
                  </div>
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required=""
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required=""
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                  />
                </div>
              </div>
              <div>
                {isLoggedIn ? (
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={signInHandler}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={signUpHandler}
                  >
                    SignUp
                  </button>
                )}
              </div>
              <h1>
                {isLoggedIn ? (
                  <span>
                    New user? <NavLink to={"/sign-up"}>Sign up</NavLink>
                  </span>
                ) : (
                  <span>
                    <NavLink to={"/sign-in"}>Login?</NavLink>
                  </span>
                )}
              </h1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
