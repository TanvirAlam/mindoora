type Props = {
  children: React.ReactNode;
};

export const FormWrapper = ({ children }: Props) => {
  return <div className="rounded-xl">{children}</div>;
};
