import { FormWrapper } from "../formInputs/FormWrapper";

const ModalMessage = ({ message }: { message: string }) => {
  return <FormWrapper>{message}</FormWrapper>;
};

export default ModalMessage;
