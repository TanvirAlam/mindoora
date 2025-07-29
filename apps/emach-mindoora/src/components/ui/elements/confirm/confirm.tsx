import { ModalWrapper } from "~/styles/mixins.styled";
import { Styled } from "./confirm.styled";
import Image from "next/image";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";

const ConfirmModal = ({
  message,
  onConfirm,
}: {
  message: string;
  onConfirm: () => void;
}) => {
  return (
    <ModalWrapper className={fredoka.className}>
      <Image
        src="/assets/wearning-message.png"
        alt="bgImage"
        width={600}
        height={100}
        className="z-1"
      />
      <div className="absolute flex flex-col">
        <span className="text-4xl font-bold [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
          {message}
        </span>
      </div>
      <div className="flex w-full items-center justify-center">
        <Styled.ModalButtonCancel>Cancel</Styled.ModalButtonCancel>
        <Styled.ModalButtonDelete onClick={onConfirm}>
          Yes
        </Styled.ModalButtonDelete>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmModal;
