import Workspace from "@layouts/Workspace";
import React, { useCallback } from "react";
import { Container, Header } from "@pages/Channel/styles";
import useInput from "@hooks/useInput";
import ChatList from "@components/ChatList";
import ChatBox from "@components/ChatBox";

const Channel = () => {
  const [chat, onChangeChat, setChat] = useInput("");

  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
    setChat("");
  }, []);

  return (
    <Container>
      <Header>channel</Header>
      {/* <ChatList /> */}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default Channel;
