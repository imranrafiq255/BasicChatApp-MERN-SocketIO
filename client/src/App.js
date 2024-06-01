import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthChecker from "./Components/AuthChecker";
import Users from "./Components/Users";
const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/sign-in" element={<AuthChecker />} />
          <Route path="/sign-up" element={<AuthChecker />} />
          <Route path="/" element={<AuthChecker />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
