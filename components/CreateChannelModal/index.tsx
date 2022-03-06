import Modal from "@components/Modal";
import useInput from "@hooks/useInput";
import { Button, Input, Label } from "@pages/SignUp/styles";
import { IChannel, IUser } from "@typings/db";
import fetcher from "@utils/fetcher";
import axios from "axios";
import React, { useCallback, VFC } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useSWR from "swr";

interface Props {
  show: boolean;
  onCloseModal: (e: any) => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput("");
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>("/api/users", fetcher);
  const { mutate: channelMutate } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      if (!newChannel || !newChannel.trim()) {
        return;
      }
      axios
        .post(
          `/api/workspaces/${workspace}/channels`,
          { name: newChannel },
          { withCredentials: true },
        )
        .then((response) => {
          channelMutate();
          setShowCreateChannelModal(false);
          setNewChannel("");
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [newChannel, channelMutate, setNewChannel, setShowCreateChannelModal, workspace],
  );

  if (!show) return null;
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널 이름</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
