import loadable from "@loadable/component";
import Channel from "@pages/Channel";
import DirectMessage from "@pages/DirectMessage";
import React from "react";
import { Route, Routes } from "react-router";

const LogIn = loadable(() => import("@pages/LogIn"));
const SignUp = loadable(() => import("@pages/SignUp"));
const Workspace = loadable(() => import("@layouts/Workspace"));

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<LogIn />} />
      <Route path="/login/*" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/workspace/:workspace/*" element={<Workspace />} />
    </Routes>
  );
};

export default App;
