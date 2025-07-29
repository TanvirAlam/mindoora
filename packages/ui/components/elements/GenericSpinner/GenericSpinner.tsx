import React from 'react'
import { Styled } from './GenericSpinner.styled'
import SpinnerSVG from './SpinnerSVG'
import { useEffect, useState } from 'react'

interface CustomLoaderProps {
  isLoading: boolean
  children?: React.ReactNode
  delay?: number
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({ isLoading, children, delay=200 }) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSpinner(isLoading);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [isLoading, delay]);

  return showSpinner ? (
    <>
      <Styled.SpinnerWrapper>
        <SpinnerSVG />
      </Styled.SpinnerWrapper>
    </>
  ) : (
    <>{children}</>
  )
}
