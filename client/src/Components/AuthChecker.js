import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatDashboard from "./ChatDashboard";
import Login from "./Login";

const AuthChecker = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setAuthentication] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/v1/user/load-current-user");
        console.log(response.data);
        if (response.data.isAuthenticated) {
          setAuthentication(true);
          navigate("/"); // Navigate to the dashboard if authenticated
        } else {
          setAuthentication(false);
          navigate("/sign-in"); // Navigate to login if not authenticated
        }
        setLoading(false);
      } catch (error) {
        setAuthentication(false);
        setLoading(false);
        navigate("/sign-in"); // Navigate to login if error occurs
      }
    };
    loadUser();
  }, [navigate]);
  console.log(isAuthenticated);
  if (loading) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return isAuthenticated ? <ChatDashboard /> : <Login isLoggedIn={true} />;
};

export default AuthChecker;
