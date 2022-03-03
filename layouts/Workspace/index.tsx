import fetcher from "@utils/fetcher";
import axios from "axios";
import React, { FC, useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useSWR from "swr";
import Menu from "@components/Menu";
import {
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from "@layouts/Workspace/styles";
import { IUser } from "@typings/db";
import gravatar from "gravatar";
import Channel from "@pages/Channel";
import DirectMessage from "@pages/DirectMessage";

const Workspace: FC = ({ children }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser>("http://localhost:3095/api/users", fetcher);

  const onLogout = useCallback(() => {
    axios
      .post("http://localhost:3095/api/users/logout", null, { withCredentials: true })
      .then(() => {
        mutate();
      });
  }, []);

  const onClickUserProfile = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  if (!userData) {
    return (
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Routes>
    );
  }
  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg
              src={gravatar.url(userData.email, { s: "28px", d: "retro" })}
              alt={userData.nickname}
            />
            {showUserMenu && (
              <Menu
                style={{ right: 0, top: 38 }}
                show={showUserMenu}
                onCloseModal={onClickUserProfile}
              >
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.email, { s: "36px", d: "retro" })}
                    alt={userData.nickname}
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>workspace</Workspaces>
        <Channels>
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>menu scroll</MenuScroll>
        </Channels>
        <Chats>
          <Routes>
            <Route path="/channel/:channel" element={<Channel />} />
            <Route path="/dm/:id" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>
    </div>
  );
};

export default Workspace;
