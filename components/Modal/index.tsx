import { CloseModalButton } from "@components/Menu/styles";
import React, { FC, useCallback } from "react";
import { CreateModal } from "./styles";

interface Props {
  show: boolean;
  onCloseModal: (e: any) => void;
  closeButton?: boolean;
}

const Modal: FC<Props> = ({ show, children, onCloseModal, closeButton }) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateModal>
  );
};
Modal.defaultProps = {
  closeButton: true,
};

export default Modal;
