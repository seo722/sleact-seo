import Workspace from "@layouts/Workspace";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container, Header } from "@pages/DirectMessage/styles";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import fetcher from "@utils/fetcher";
import { useParams } from "react-router-dom";
import gravatar from "gravatar";
import { IChannel, IChat, IUser } from "@typings/db";
import ChatBox from "@components/ChatBox";
import ChatList from "@components/ChatList";
import useInput from "@hooks/useInput";
import axios from "axios";
import makeSection from "@utils/makeSection";
import Scrollbars from "react-custom-scrollbars";
import useSocket from "@hooks/useSocket";
import InviteChannelModal from "@components/InviteChannelModal";

const PAGE_SIZE = 20;
const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR<IUser>("/api/users", fetcher);
  const [chat, onChangeChat, setChat] = useInput("");
  const { data: channelData } = useSWR<IChannel>(
    `/api/workspaces/${workspace}/channels/${channel}`,
    fetcher,
  );
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) =>
      `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${
        index + 1
      }`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE) || false;
  const scrollbarRef = useRef<Scrollbars>(null);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData && myData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat("");
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, { content: chat })
          .then(() => {
            mutateChat();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, channelData, workspace, channel],
  );

  const onMessage = useCallback(
    (data: IChat) => {
      //id 는 상대방 아이디
      if (data.Channel.name === channel || data.UserId !== myData?.id) {
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
              }, 50);
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
    [myData, channel],
  );

  useEffect(() => {
    socket?.on("message", onMessage);
    return () => {
      socket?.off("message", onMessage);
    };
  }, [socket, onMessage]);

  //로딩시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
      setTimeout(() => {
        console.log("scrollbar", scrollbarRef.current);
        scrollbarRef.current?.scrollToBottom();
      }, 500);
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);
  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  if (!myData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div
          style={{ display: "flex", flex: 1, justifyContent: "flex-end", alignItems: "center" }}
          className="header-right"
        >
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i
              className="c-icon p-ia__view_header__button_icon c-icon--add-user"
              aria-hidden="true"
            />
          </button>
        </div>
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
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
