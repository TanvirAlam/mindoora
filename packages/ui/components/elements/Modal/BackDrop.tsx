import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface BackdropProps extends MotionProps {
  onClicked: () => void // Define the type of onClicked function
  children: ReactNode
}

const Backdrop = ({ onClicked, children }: BackdropProps) => {
  return (
    <motion.div
      onClick={() => {
        onClicked()
      }}
      className='fixed top-0 left-0 right-0 bottom-0 z-50 flex h-screen items-center justify-center overflow-y-scroll bg-black bg-opacity-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}

export default Backdrop
