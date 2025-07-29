// CreateButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import { CreateButtonStyled } from './CreateButtonStyled';
interface CreateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
}

const CreateButton: React.FC<CreateButtonProps> = ({ children, ...props }) => {
  return <CreateButtonStyled {...props}>{children}</CreateButtonStyled>;
};

export default CreateButton;
