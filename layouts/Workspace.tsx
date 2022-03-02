import LogIn from "@pages/LogIn";
import fetcher from "@utils/fetcher";
import axios from "axios";
import React, { FC, useCallback, VFC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useSWR from "swr";

const Workspace: FC = ({ children }) => {
  const { data, error, mutate } = useSWR("http://localhost:3095/api/users", fetcher);

  const onLogout = useCallback(() => {
    axios
      .post("http://localhost:3095/api/users/logout", null, { withCredentials: true })
      .then(() => {
        mutate();
      });
  }, []);
  console.log(data);
  if (!data) {
    return (
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Routes>
    );
  }
  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
