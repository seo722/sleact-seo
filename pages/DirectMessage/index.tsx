import Workspace from "@layouts/Workspace";
import React, { useCallback, useEffect, useRef } from "react";
import { Container, Header } from "@pages/DirectMessage/styles";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import fetcher from "@utils/fetcher";
import { useParams } from "react-router-dom";
import gravatar from "gravatar";
import { IDM, IUser } from "@typings/db";
import ChatBox from "@components/ChatBox";
import ChatList from "@components/ChatList";
import useInput from "@hooks/useInput";
import axios from "axios";
import makeSection from "@utils/makeSection";
import Scrollbars from "react-custom-scrollbars";
import useSocket from "@hooks/useSocket";
import { toast } from "react-toastify";

const PAGE_SIZE = 20;
const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR<IUser>("/api/users", fetcher);
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const [chat, onChangeChat, setChat] = useInput("");
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index) =>
      `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );

  const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE) || false;

  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData && userData && myData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat("");
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat })
          .then(() => {
            mutateChat();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  const onMessage = useCallback(
    (data: IDM) => {
      //id 는 상대방 아이디
      if (data.SenderId === Number(id) && myData?.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log("scrollToBottom!", scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
            }
            //  else {
            //   toast.success("새 메시지가 도착했습니다.", {
            //     onClick() {
            //       scrollbarRef.current?.scrollToBottom();
            //     },
            //     closeOnClick: true,
            //   });
            // }
          }
        });
      }
    },
    [id, myData, mutateChat],
  );

  useEffect(() => {
    socket?.on("dm", onMessage);
    return () => {
      socket?.off("dm", onMessage);
    };
  }, [socket, onMessage]);

  //로딩시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: "24px", d: "retro" })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
        scrollbarRef={scrollbarRef}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
