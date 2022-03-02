import loadable from "@loadable/component";
import React from "react";
import { Route, Routes } from "react-router";

const LogIn = loadable(() => import("@pages/LogIn"));
const SignUp = loadable(() => import("@pages/SignUp"));
const Channel = loadable(() => import("@pages/Channel"));

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<LogIn />} />
      <Route path="/login/*" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/workspace/:channel/*" element={<Channel />} />
    </Routes>
  );
};

export default App;
