import { ReactNode } from 'react';

export type BaseLink = {
  href: string
  text: string
}

export type BaseImage = {
  src: string
  alt: string
}

export type FormField = {
  label: string
  helpMessage?: string
}

export type FormFieldWithValidation = FormField & {
  errorMessage: string
}

export type FormOptionField = {
  label: string
}

export type TrackLinkHandler = (event: { buttonName: string; buttonText: string; buttonCategory: string }) => void

export type AddressLookupState = 'loading' | 'lookup' | 'manual'

export type AddressSuggestion = {
  singleLineName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  zipCode: string
}

export type ModalProps = {
  backgroundColor?: string
  color?: string
  buttonBackgroundColor?: string
  buttonColor?: string
  buttonText?: string
  width?: number
  children: ReactNode
  open?: boolean
}

export type ModalImplementProps = {
  backgroundColor?: string
  color?: string
  width?: number
  children: ReactNode
}

export type ModalBackDropProps = {
  onClicked: Function
  children: ReactNode
}

export type ButtonPropsType = {
  isdisabled?: boolean
  variant: 'outline' | 'filled' | 'text' | 'shadow'
  shape?: string
  size?: 'small' | 'medium' | 'large'
  backgroundcolor: string
  textcolor: string
  children?: ReactNode
  activebgcolor?: string
  shadowcolor?: string
  width?: string
  type?: string
  onClick?: () => void
  hidden?: boolean
}

export type FormControlProps = {
  label: string
  type: string
  required?: boolean
  register?: ReactNode
  name?: string
  validation?: Object
  getValue: string
}

export type CheckBoxProps = {
  label: string
  required?: boolean
}
