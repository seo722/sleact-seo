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
  setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal: VFC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const [newMember, onChangeNewMember, setNewMember] = useInput("");
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>("/api/users", fetcher);
  const { mutate: memberMutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) {
        return;
      }
      axios
        .post(
          `/api/workspaces/${workspace}/channels/${channel}/members`,
          { email: newMember },
          { withCredentials: true },
        )
        .then((response) => {
          memberMutate(response.data, false);
          setShowInviteChannelModal(false);
          setNewMember("");
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [channel, newMember, memberMutate, setNewMember, setShowInviteChannelModal, workspace],
  );

  if (!show) return null;

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="channel-label">
          <span>채널 멤버 초대</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
